'use strict'

import path from 'path'
import os from 'os'
import type Serverless from 'serverless'
import AwsProvider from 'serverless/plugins/aws/provider/awsProvider'
import type { Package } from 'serverless/aws'
import Plugin from 'serverless/classes/Plugin'

import _ from 'lodash'
import { google, deploymentmanager_v2, storage_v1beta2, logging_v2, cloudfunctions_v1 } from 'googleapis'

import pluginPackageJson from '../package.json'
import googleApisPackageJson from 'googleapis/package.json'
import Service from 'serverless/classes/Service'

const constants = {
  providerName: 'google',
}

export class GoogleProvider extends AwsProvider {
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

  static getProviderName() {
    return constants.providerName
  }

  constructor(serverless: Serverless, options: Serverless.Options) {
    super(serverless, options)
    this.serverless = serverless
    // This adds `credentials` to the provider type
    this.googleProvider = this.serverless.service.provider as unknown as GoogleProviderConfig
    this.provider = this // only load plugin in a Google service context
    this.serverless.setProvider(constants.providerName, this)
    this.serverless.configSchemaHandler.defineProvider(constants.providerName, {
      definitions: {
        cloudFunctionRegion: {
          // Source: https://cloud.google.com/functions/docs/locations
          enum: [
            // Tier pricing 1
            'us-central1', // (Iowa)
            'us-east1', // (South Carolina)
            'us-east4', // (Northern Virginia)
            'europe-west1', // (Belgium)
            'europe-west2', // (London)
            'asia-east1', // (Taiwan)
            'asia-east2', // (Hong Kong)
            'asia-northeast1', // (Tokyo)
            'asia-northeast2', // (Osaka)
            // Tier pricing 2
            'us-west2', // (Los Angeles)
            'us-west3', // (Salt Lake City)
            'us-west4', // (Las Vegas)
            'northamerica-northeast1', // (Montreal)
            'southamerica-east1', // (Sao Paulo)
            'europe-west3', // (Frankfurt)
            'europe-west6', // (Zurich)
            'europe-central2', // (Warsaw)
            'australia-southeast1', // (Sydney)
            'asia-south1', // (Mumbai)
            'asia-southeast1', // (Singapore)
            'asia-southeast2', // (Jakarta)
            'asia-northeast3', // (Seoul)
          ],
        },
        cloudFunctionRuntime: {
          // Source: https://cloud.google.com/functions/docs/concepts/exec#runtimes
          enum: [
            'nodejs6', // decommissioned
            'nodejs8', // deprecated
            'nodejs10',
            'nodejs12',
            'nodejs14',
            'nodejs16', // recommended
            'python37',
            'python38',
            'python39',
            'go111',
            'go113',
            'go116', // recommended
            'java11',
            'dotnet3',
            'ruby26',
            'ruby27',
          ],
        },
        cloudFunctionMemory: {
          // Source: https://cloud.google.com/functions/docs/concepts/exec#memory
          enum: [
            128,
            256, // default
            512,
            1024,
            2048,
            4096,
          ],
        },
        cloudFunctionEnvironmentVariables: {
          type: 'object',
          patternProperties: {
            '^.*$': { type: 'string' },
          },
          additionalProperties: false,
        },
        cloudFunctionSecretEnvironmentVariables: {
          type: 'object',
          patternProperties: {
            '^[a-zA-Z0-9_]+$': {
              type: 'object',
              properties: {
                projectId: {
                  type: 'string',
                  minLength: 1,
                },
                secret: {
                  type: 'string',
                  pattern: '^[a-zA-Z0-9_-]+$',
                },
                version: {
                  type: 'string',
                  pattern: '^(latest|[0-9.]+)$',
                },
              },
              required: ['secret', 'version'],
            },
          },
        },
        cloudFunctionVpcEgress: {
          enum: ['ALL', 'ALL_TRAFFIC', 'PRIVATE', 'PRIVATE_RANGES_ONLY'],
        },
        resourceManagerLabels: {
          type: 'object',
          propertyNames: {
            type: 'string',
            minLength: 1,
            maxLength: 63,
          },
          patternProperties: {
            '^[a-z][a-z0-9_.]*$': { type: 'string' },
          },
          additionalProperties: false,
        },
      },

      provider: {
        properties: {
          credentials: { type: 'string' },
          project: { type: 'string' },
          region: { $ref: '#/definitions/cloudFunctionRegion' },
          runtime: { $ref: '#/definitions/cloudFunctionRuntime' }, // Can be overridden by function configuration
          serviceAccountEmail: { type: 'string' }, // Can be overridden by function configuration
          memorySize: { $ref: '#/definitions/cloudFunctionMemory' }, // Can be overridden by function configuration
          timeout: { type: 'string' }, // Can be overridden by function configuration
          environment: { $ref: '#/definitions/cloudFunctionEnvironmentVariables' }, // Can be overridden by function configuration
          secrets: { $ref: '#/definitions/cloudFunctionSecretEnvironmentVariables' }, // Can be overridden by function configuration
          vpc: { type: 'string' }, // Can be overridden by function configuration
          vpcEgress: { $ref: '#/definitions/cloudFunctionVpcEgress' }, // Can be overridden by function configuration
          labels: { $ref: '#/definitions/resourceManagerLabels' }, // Can be overridden by function configuration
        },
      },
      function: {
        properties: {
          handler: { type: 'string' },
          runtime: { $ref: '#/definitions/cloudFunctionRuntime' }, // Override provider configuration
          serviceAccountEmail: { type: 'string' }, // Override provider configuration
          memorySize: { $ref: '#/definitions/cloudFunctionMemory' }, // Override provider configuration
          timeout: { type: 'string' }, // Override provider configuration
          minInstances: { type: 'number' },
          environment: { $ref: '#/definitions/cloudFunctionEnvironmentVariables' }, // Override provider configuration
          secrets: { $ref: '#/definitions/cloudFunctionSecretEnvironmentVariables' }, // Can be overridden by function configuration
          vpc: { type: 'string' }, // Override provider configuration
          vpcEgress: { $ref: '#/definitions/cloudFunctionVpcEgress' }, // Can be overridden by function configuration
          labels: { $ref: '#/definitions/resourceManagerLabels' }, // Override provider configuration
        },
      },
    })

    const serverlessVersion = this.serverless.version
    const pluginVersion = pluginPackageJson.version
    const googleApisVersion = googleApisPackageJson.version

    google.options({
      headers: {
        'User-Agent': `Serverless/${serverlessVersion} Serverless-Google-Provider/${pluginVersion} Googleapis/${googleApisVersion}`,
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
      .getProvider('google')
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

  request() {
    // grab necessary stuff from arguments array
    const lastArg = arguments[Object.keys(arguments).pop()] //eslint-disable-line
    const hasParams = typeof lastArg === 'object'
    const filArgs = _.filter(arguments, (v) => typeof v === 'string') //eslint-disable-line
    const params = hasParams ? lastArg : {}

    const service = filArgs[0]
    const serviceInstance = this.sdk[service]
    this.isServiceSupported(service)

    const authClient = this.getAuthClient()

    return authClient.getClient().then(() => {
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

  getConfiguredEnvironment(funcObject) {
    return _.merge({}, _.get(this, 'serverless.service.provider.environment'), funcObject.environment)
  }
}

/** @source: https://cloud.google.com/functions/docs/locations */
export type GoogleRegion =
  | 'us-central1' // (Iowa)
  | 'us-east1' // (South Carolina)
  | 'us-east4' // (Northern Virginia)
  | 'europe-west1' // (Belgium)
  | 'europe-west2' // (London)
  | 'asia-east1' // (Taiwan)
  | 'asia-east2' // (Hong Kong)
  | 'asia-northeast1' // (Tokyo)
  | 'asia-northeast2' // (Osaka)
  | 'us-west2' // (Los Angeles)
  | 'us-west3' // (Salt Lake City)
  | 'us-west4' // (Las Vegas)
  | 'northamerica-northeast1' // (Montreal)
  | 'southamerica-east1' // (Sao Paulo)
  | 'europe-west3' // (Frankfurt)
  | 'europe-west6' // (Zurich)
  | 'europe-central2' // (Warsaw)
  | 'australia-southeast1' // (Sydney)
  | 'asia-south1' // (Mumbai)
  | 'asia-southeast1' // (Singapore)
  | 'asia-southeast2' // (Jakarta)
  | 'asia-northeast3' // (Seoul)

/** @source: https://cloud.google.com/functions/docs/concepts/exec#runtimes */
export type GoogleRuntime =
  | 'nodejs6'
  | 'nodejs8'
  | 'nodejs10'
  | 'nodejs12'
  | 'nodejs14'
  | 'nodejs16'
  | 'python37'
  | 'python38'
  | 'python39'
  | 'go111'
  | 'go113'
  | 'go116'
  | 'java11'
  | 'dotnet3'
  | 'ruby26'
  | 'ruby27'

/** @source: https://cloud.google.com/functions/docs/concepts/exec#memory  */
export type GoogleMemory = 128 | 256 | 512 | 1024 | 2048 | 4096

export type GoogleEnvironmentVariables = Record<string, string>
export type GoogleSecretEnvironmentVariables = {
  projectId?: string
  secret: string
  version: string
}
export type GoogleVpcEgress = 'ALL' | 'ALL_TRAFFIC' | 'PRIVATE' | 'PRIVATE_RANGES_ONLY'
export type GoogleResourceManagerLabels = Record<string, string>
export type SharedProperties = {
  region: GoogleRegion
  /** Can be overridden by function configuration
   * @default nodejs10
   */
  runtime?: GoogleRuntime
  /** Can be overridden by function configuration
   * @default 256
   */
  memorySize?: GoogleMemory
  /** Can be overridden by function configuration */
  timeout: string
  /** Can be overridden by function configuration */
  environment: GoogleEnvironmentVariables
  /** Can be overridden by function configuration */
  secrets: GoogleSecretEnvironmentVariables
  /** Can be overridden by function configuration */
  vpc: string
  /** Can be overridden by function configuration */
  vpcEgress: GoogleVpcEgress
  /** Can be overridden by function configuration */
  labels: GoogleResourceManagerLabels
  serviceAccountEmail: string
}
export type GoogleProviderConfig = {
  /** Not required if using the default login */
  credentials?: string
  /** The Google **ID** of your target project */
  project: string
  name: 'google'
  // Not sure if this is valid in G, exists on base AWS
  stackTags?: { [key: string]: any }
  deploymentBucketName?: string
} & SharedProperties
export type GoogleFunctionDefinition = {
  /** Name of exported function to be ran by the CloudFunction. Cannot include `/` or `.` and must be a sibling to this file.
   * @nodejs Must also be `index.js`, `function.js`, or you can use the `main` key in a sibling level package.json to use subdirectory code. */
  handler: string
  minInstances?: number
  events: Array<{ event?: any; http?: any }>
} & SharedProperties

export interface GoogleServerlessConfig {
  service: Service
  useDotenv?: boolean
  frameworkVersion?: string
  enableLocalInstallationFallback?: boolean
  variablesResolutionMode?: '20210219' | '20210326'
  unresolvedVariablesNotificationMode?: 'warn' | 'error'
  deprecationNotificationMode?: 'warn' | 'warn:summary' | 'error'
  disabledDeprecations?: string[]
  configValidationMode?: 'warn' | 'error' | 'off'
  provider: GoogleProvider
  package?: Package
  functions?: Record<string, GoogleFunctionDefinition>
  resources?: any
  plugins?: string[]
  app?: string
  tenant?: string
  custom?: Record<string, any>
}
