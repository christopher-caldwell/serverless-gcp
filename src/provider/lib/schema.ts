import { JSONSchema7 } from 'json-schema'

const definitions: Record<string, JSONSchema7> = {
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
  cloudFunctionEvent: {
    type: 'object',
    properties: {
      event: {
        type: 'boolean',
      },
      http: {
        type: 'boolean',
      },
      additionalProperties: false,
    },
  },
}

const providerSchema: JSONSchema7 = {
  properties: {
    credentials: { type: 'string' },
    project: { type: 'string' },
    region: { $ref: '#/definitions/cloudFunctionRegion' },
    runtime: { $ref: '#/definitions/cloudFunctionRuntime' },
    serviceAccountEmail: { type: 'string' },
    memorySize: { $ref: '#/definitions/cloudFunctionMemory' },
    timeout: { type: 'string' },
    environment: { $ref: '#/definitions/cloudFunctionEnvironmentVariables' },
    secrets: { $ref: '#/definitions/cloudFunctionSecretEnvironmentVariables' },
    vpc: { type: 'string' },
    vpcEgress: { $ref: '#/definitions/cloudFunctionVpcEgress' },
    labels: { $ref: '#/definitions/resourceManagerLabels' },
  },
}
const functionSchema: JSONSchema7 = {
  properties: {
    handler: { type: 'string' },
    runtime: { $ref: '#/definitions/cloudFunctionRuntime' },
    serviceAccountEmail: { type: 'string' },
    memorySize: { $ref: '#/definitions/cloudFunctionMemory' },
    timeout: { type: 'string' },
    minInstances: { type: 'number' },
    environment: { $ref: '#/definitions/cloudFunctionEnvironmentVariables' },
    secrets: { $ref: '#/definitions/cloudFunctionSecretEnvironmentVariables' },
    vpc: { type: 'string' },
    vpcEgress: { $ref: '#/definitions/cloudFunctionVpcEgress' },
    labels: { $ref: '#/definitions/resourceManagerLabels' },
    // TODO: fix this. Causes runtime error because there's already a definition
    // events: {
    //   type: 'string',
    //   items: { $ref: '#/definitions/cloudFunctionEvent' },
    // },
  },
}

export const schema = {
  definitions,
  provider: providerSchema,
  function: functionSchema,
}
