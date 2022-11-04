import path from 'path'
import os from 'os'
import type Serverless from '@/@types/serverless'
import type AwsProvider from '@/@types/serverless/aws'
import Plugin from '@/@types/serverless/classes/Plugin'
import _ from 'lodash'
import { google, deploymentmanager_v2, storage_v1beta2, logging_v2, cloudfunctions_v1 } from 'googleapis'
import googleApisPackageJson from 'googleapis/package.json'

import { GoogleProviderConfig } from '../shared/types'
import { schema } from './lib'

export const constants = {
  /** Provider name cannot be `google` as many plugins have custom logic around Google as a provider. */
  providerName: '_google',
}

// TODO: Figure out how to type `provider` in the other plugins as this class
export class GoogleProvider implements Plugin {
  serverless: Serverless
  provider: GoogleProvider
  sdk: {
    google: typeof google
    deploymentmanager: deploymentmanager_v2.Deploymentmanager
    storage: storage_v1beta2.Storage
    logging: logging_v2.Logging
    cloudfunctions: cloudfunctions_v1.Cloudfunctions
  }
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
    return this.serverless
      .getProvider(constants.providerName)
      .request('storage', 'objects', 'get', {
        // @ts-expect-error TS(2345) FIXME: Argument of type '{ bucket: string; object: string... Remove this comment to see the full error message
        bucket,
        object,
        alt: 'media',
      })
      .catch((err) => {
        throw new Error(`Error getting value for ${bucket}/${object}. ${err.message}`)
      })
  }

  async request() {
    // grab necessary stuff from arguments array
    //TODO: fix this lazy non-sense
    const lastArg = arguments[Object.keys(arguments).pop()]
    const hasParams = typeof lastArg === 'object'
    const filArgs = _.filter(arguments, (v) => typeof v === 'string')
    const params = hasParams ? lastArg : {}

    const service = filArgs[0]
    const serviceInstance = this.sdk[service]
    this.isServiceSupported(service)

    const authClient = this.getAuthClient()
    await authClient.getClient()

    const requestParams = { auth: authClient }

    // merge the params from the request call into the base functionParams
    _.merge(requestParams, params)

    return filArgs
      .reduce((p, c) => p[c], this.sdk)
      .bind(serviceInstance)(requestParams)
      .then((result) => result.data)
      .catch((error) => {
        if (
          error &&
          error.errors &&
          error.errors[0].message &&
          _.includes(error.errors[0].message, 'project 1043443644444')
        ) {
          throw new Error(
            "Incorrect configuration. Please change the 'project' key in the 'provider' block in your Serverless config file.",
          )
        } else if (error) {
          throw error
        }
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

      return new google.auth.GoogleAuth({
        keyFile: credentials.toString(),
        scopes: 'https://www.googleapis.com/auth/cloud-platform',
      })
    }

    return new google.auth.GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    })
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
    return _.get(funcObject, 'runtime') || _.get(this, '@/@types/serverless.service.provider.runtime') || 'nodejs10'
  }

  getConfiguredSecrets(funcObject: { secrets: string }) {
    const providerSecrets = _.get(this, '@/@types/serverless.service.provider.secrets', {})
    const secrets = _.merge({}, providerSecrets, funcObject.secrets)

    const keys = Object.keys(secrets).sort()
    return keys.map((key) => {
      return {
        key,
        ...secrets[key],
      }
    })
  }

  getConfiguredEnvironment(funcObject) {
    return _.merge({}, _.get(this, '@/@types/serverless.service.provider.environment'), funcObject.environment)
  }
}
