import path from 'path'
import os from 'os'
import type Serverless from '@/@types/serverless'
import type AwsProvider from '@/@types/serverless/aws'
import Plugin from '@/@types/serverless/classes/Plugin'
import _ from 'lodash'
import { google, deploymentmanager_v2, storage_v1beta2, logging_v2, cloudfunctions_v1 } from 'googleapis'
import googleApisPackageJson from 'googleapis/package.json'

import { GoogleFunctionDefinition, GoogleProviderConfig } from '../shared/types'
import { schema } from './lib'

export const constants = {
  /** Provider name cannot be `google` as many plugins have custom logic around Google as a provider. */
  providerName: '_google',
}

export interface GoogleSDK {
  google: typeof google
  deploymentmanager: deploymentmanager_v2.Deploymentmanager
  storage: storage_v1beta2.Storage
  logging: logging_v2.Logging
  cloudfunctions: cloudfunctions_v1.Cloudfunctions
}

// TODO: Figure out how to type `provider` in the other plugins as this class
export class GoogleProvider implements Plugin {
  serverless: Serverless
  provider: GoogleProvider
  sdk: GoogleSDK
  configurationVariablesSources
  variableResolvers
  googleProvider: GoogleProviderConfig
  hooks: Plugin.Hooks
  project: string
  name: string

  static getProviderName() {
    return constants.providerName
  }

  constructor(serverless: Serverless, options?: Serverless.Options) {
    this.serverless = serverless
    // This adds `credentials` to the provider type
    this.googleProvider = this.serverless.service.provider as unknown as GoogleProviderConfig
    this.provider = this // only load plugin in a Google service context
    this.serverless.setProvider(constants.providerName, this as unknown as AwsProvider)
    this.serverless.configSchemaHandler.defineProvider(constants.providerName, schema)

    const serverlessVersion = this.serverless.version
    const googleApisVersion = googleApisPackageJson.version

    google.options({
      headers: {
        'User-Agent': `Serverless/${serverlessVersion} Serverless-Google-Provider Googleapis/${googleApisVersion}`,
      },
    })

    this.sdk = {
      google,
      deploymentmanager: google.deploymentmanager('v2'),
      storage: google.storage('v1'),
      logging: google.logging('v2'),
      cloudfunctions: google.cloudfunctions('v1'),
    }

    this.configurationVariablesSources = {
      gs: {
        async resolve({ address }) {
          if (!address) {
            throw new (serverless as any).classes.Error(
              'Missing address argument in variable "gs" source',
              'GOOGLE_CLOUD_MISSING_GS_VAR ADDRESS',
            )
          }
          const groups = address.split('/')
          const bucket = groups.shift()
          const object = groups.join('/')
          return { value: await this.gsValue({ bucket, object }) }
        },
      },
    }

    // TODO: Remove with next major
    this.variableResolvers = {
      gs(variableString: string) {
        const groups = variableString.split(':')[1].split('/')
        const bucket = groups.shift()
        const object = groups.join('/')
        return this.gsValue({ bucket, object })
      },
    }
  }

  async getGsValue({ bucket, object }: { bucket: string; object: string }) {
    return this.provider.sdk.storage.objects.get({
      bucket,
      object,
      alt: 'media',
    })
  }

  getAuthClient() {
    let credentials = this.googleProvider.credentials

    if (credentials) {
      const credParts = this.googleProvider.credentials.split(path.sep)
      if (credParts[0] === '~') {
        credParts[0] = os.homedir()
        credentials = credParts.reduce((memo, part) => path.join(memo, part), '')
      }

      const auth = new google.auth.GoogleAuth({
        keyFile: credentials.toString(),
        scopes: 'https://www.googleapis.com/auth/cloud-platform',
      })

      return auth.getClient()
    }

    const auth = new google.auth.GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    })

    return auth.getClient()
  }

  isServiceSupported(service: string) {
    if (!_.includes(Object.keys(this.sdk), service)) {
      const errorMessage = [
        `Unsupported service API "${service}".`,
        ` Supported service APIs are: ${Object.keys(this.sdk).join(', ')}`,
      ].join('')

      throw new Error(errorMessage)
    }
  }

  getRuntime(funcObject: Serverless.FunctionDefinition) {
    return _.get(funcObject, 'runtime') || _.get(this, 'serverless.service.provider.runtime') || 'nodejs10'
  }

  getConfiguredSecrets(funcObject: { secrets: string }) {
    const providerSecrets = _.get(this, 'serverless.service.provider.secrets', {})
    const secrets = _.merge({}, providerSecrets, funcObject.secrets)

    const keys = Object.keys(secrets).sort()
    return keys.map((key) => {
      return {
        key,
        ...secrets[key],
      }
    })
  }

  getConfiguredEnvironment(funcObject: GoogleFunctionDefinition) {
    return _.merge({}, _.get(this, 'serverless.service.provider.environment'), funcObject.environment)
  }
}
