import Serverless from '@/@types/serverless'
import Plugin, { Hooks } from '@/@types/serverless/classes/Plugin'
import Aws from '@/@types/serverless/aws'

import { constants } from '../provider'
import {
  prepareDeployment,
  compileFunctions,
  saveCreateTemplateFile,
  saveUpdateTemplateFile,
  cleanupServerlessDir,
  mergeServiceResources,
  generateArtifactDirectoryName,
} from './lib'
import { validateAndSetDefaults, setDeploymentBucketName } from '../shared'

export class GooglePackage implements Plugin {
  hooks: Hooks
  options: Serverless.Options
  provider: Aws
  serverless: Serverless
  cleanupServerlessDir: () => void
  compileFunctions: () => void
  validateAndSetDefaults: () => void
  generateArtifactDirectoryName: () => void
  mergeServiceResources: () => void
  prepareDeployment: () => void
  saveCreateTemplateFile: () => void
  saveUpdateTemplateFile: () => void
  setDeploymentBucketName: () => void
  constructor(serverless: Serverless, options: Serverless.Options) {
    this.serverless = serverless
    this.options = options
    this.provider = this.serverless.getProvider(constants.providerName)
    this.serverless.configSchemaHandler.defineFunctionEvent(constants.providerName, 'http', { type: 'string' })
    this.serverless.configSchemaHandler.defineFunctionEvent(constants.providerName, 'event', {
      type: 'object',
      properties: {
        eventType: {
          type: 'string',
        },
        path: {
          type: 'string',
        },
        resource: {
          type: 'string',
        },
        failurePolicy: {
          type: 'object',
          properties: {
            retry: {
              type: 'object',
            },
          },
          additionalProperties: false,
        },
      },
      required: ['eventType', 'resource'],
      additionalProperties: false,
    })

    this.cleanupServerlessDir = cleanupServerlessDir.bind(this)
    this.compileFunctions = compileFunctions.bind(this)
    this.validateAndSetDefaults = validateAndSetDefaults.bind(this)
    this.setDeploymentBucketName = setDeploymentBucketName.bind(this)
    this.prepareDeployment = prepareDeployment.bind(this)
    this.saveCreateTemplateFile = saveCreateTemplateFile.bind(this)
    this.generateArtifactDirectoryName = generateArtifactDirectoryName.bind(this)
    this.mergeServiceResources = mergeServiceResources.bind(this)
    this.saveUpdateTemplateFile = saveUpdateTemplateFile.bind(this)

    this.hooks = {
      'package:cleanup': () => {
        this.cleanupServerlessDir()
      },

      'before:package:initialize': async () => {
        this.validateAndSetDefaults()
      },
      'package:initialize': () => {
        this.setDeploymentBucketName()
        this.prepareDeployment()
        this.saveCreateTemplateFile()
      },

      'before:package:compileFunctions': () => {
        this.generateArtifactDirectoryName()
      },

      'package:compileFunctions': () => {
        this.compileFunctions()
      },
      'package:finalize': () => {
        this.mergeServiceResources()
        this.saveUpdateTemplateFile()
      },
    }
  }
}
