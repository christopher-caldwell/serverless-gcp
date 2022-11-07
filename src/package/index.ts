import Serverless from '@/@types/serverless'
import Plugin, { Hooks, Logging } from '@/@types/serverless/classes/Plugin'

import { constants, GoogleProvider } from '../provider'
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
  provider: GoogleProvider
  serverless: Serverless
  logging: Logging

  cleanupServerlessDir: () => void
  compileFunctions: () => void
  validateAndSetDefaults: () => void
  generateArtifactDirectoryName: () => void
  mergeServiceResources: () => void
  prepareDeployment: () => void
  saveCreateTemplateFile: () => void
  saveUpdateTemplateFile: () => void
  setDeploymentBucketName: () => void

  constructor(serverless: Serverless, options: Serverless.Options, logging: Logging) {
    this.serverless = serverless
    this.options = options
    this.logging = logging
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
        this.serverless.cli.log('Running package:cleanup hook')
        this.cleanupServerlessDir()
      },

      'before:package:initialize': async () => {
        this.serverless.cli.log('Running before:package:initialize  hook')
        this.validateAndSetDefaults()
      },
      'package:initialize': () => {
        this.serverless.cli.log('Running package:initialize hook')
        this.setDeploymentBucketName()
        this.prepareDeployment()
        this.saveCreateTemplateFile()
      },

      'before:package:compileFunctions': () => {
        this.serverless.cli.log('Running before:package:compileFunctions hook')
        this.generateArtifactDirectoryName()
      },

      'package:compileFunctions': () => {
        this.serverless.cli.log('Running package:compileFunctions hook')
        this.compileFunctions()
      },
      'package:finalize': () => {
        this.serverless.cli.log('Running package:finalize hook')
        this.mergeServiceResources()
        this.saveUpdateTemplateFile()
      },
    }
  }
}
