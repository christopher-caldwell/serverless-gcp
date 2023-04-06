import type { GoogleServerlessConfig } from '@caldwell/serverless-google-cloud/dist/shared/types'
import type { Configuration as EsBuildConfig } from './serverless.esbuild'

const esBuildConfig: Partial<EsBuildConfig> = {
  bundle: true,
  minify: false,
  sourcemap: true,
  sourcesContent: false,
  packager: 'yarn',
}

const serverlessConfig: GoogleServerlessConfig = {
  frameworkVersion: '3',
  service: 'example',
  plugins: ['serverless-esbuild', '../../dist/index.js'],
  custom: {
    esbuild: esBuildConfig,
  },
  package: {
    individually: true,
  },
  provider: {
    deploymentBucketName: 'squad',
    project: process.env.SERVERLESS_GCP_PROJECT!,
    name: '_google',
    runtime: 'nodejs16',
    memorySize: 128,
    stage: 'local',
    region: 'us-central1',
  },
  functions: {
    SomethingElse: {
      handler: 'src/something-else/index.event',
      environment: {
        SOMETHING_IMPORTANT: "seriously, it's important",
      },
      events: [
        {
          event: true,
        },
      ],
    },
    Test: {
      handler: 'src/test/index.event',
      events: [
        {
          event: true,
        },
      ],
    },
  },
}

module.exports = serverlessConfig
