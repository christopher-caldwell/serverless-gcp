import type AwsProvider from 'serverless/aws'

//TODO: autogenerate these types

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
export interface SharedProperties {
  region?: GoogleRegion
  /** Can be overridden by function configuration
   * @default nodejs10
   */
  runtime?: GoogleRuntime
  /** Can be overridden by function configuration
   * @default 256
   */
  memorySize?: GoogleMemory
  /** Can be overridden by function configuration. JSON schema says `string`, but Serverless types say `number` */
  timeout?: string
  /** Can be overridden by function configuration */
  environment?: GoogleEnvironmentVariables
  /** Can be overridden by function configuration */
  secrets?: GoogleSecretEnvironmentVariables
  /** Can be overridden by function configuration */
  vpc?: string
  /** Can be overridden by function configuration */
  vpcEgress?: GoogleVpcEgress
  /** Can be overridden by function configuration */
  labels?: GoogleResourceManagerLabels
  serviceAccountEmail?: string
}
export interface GoogleProviderConfig extends SharedProperties {
  /** Not required if using the default login */
  credentials?: string
  /** The Google **ID** of your target project */
  project: string
  /** Provider name cannot be `google` as many plugins have custom logic around Google as a provider. */
  name: '_google'
  // Not sure if this is valid in G, exists on base AWS
  stackTags?: { [key: string]: any }
  deploymentBucketName?: string
  stage: string
}
export interface GoogleFunctionDefinition extends SharedProperties {
  /** Name of exported function to be ran by the CloudFunction. Cannot include `/` or `.` and must be a sibling to this file.
   * @nodejs Must also be `index.js`, `function.js`, or you can use the `main` key in a sibling level package.json to use subdirectory code. */
  handler: string
  name?: string
  minInstances?: number
  maxInstances?: number
  events: Array<{ event?: any; http?: any }>
}

export interface GoogleServerlessConfig {
  service: string
  // service: Service
  useDotenv?: boolean
  frameworkVersion?: string
  enableLocalInstallationFallback?: boolean
  variablesResolutionMode?: '20210219' | '20210326'
  unresolvedVariablesNotificationMode?: 'warn' | 'error'
  deprecationNotificationMode?: 'warn' | 'warn:summary' | 'error'
  disabledDeprecations?: string[]
  configValidationMode?: 'warn' | 'error' | 'off'
  provider: GoogleProviderConfig
  package?: AwsProvider.Package
  functions?: Record<string, GoogleFunctionDefinition>
  resources?: any
  plugins?: string[]
  app?: string
  tenant?: string
  custom?: Record<string, any>
}
