'use strict'

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

const cleanupServerlessDir = require('./lib/cleanupServerlessDir')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'validate'.
const validate = require('../shared/validate')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'utils'.
const utils = require('../shared/utils')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'setDeploym... Remove this comment to see the full error message
const setDeploymentBucketName = require('../shared/setDeploymentBucketName')
const prepareDeployment = require('./lib/prepareDeployment')
const saveCreateTemplateFile = require('./lib/writeFilesToDisk')
const mergeServiceResources = require('./lib/mergeServiceResources')
const generateArtifactDirectoryName = require('./lib/generateArtifactDirectoryName')
const compileFunctions = require('./lib/compileFunctions')
const saveUpdateTemplateFile = require('./lib/writeFilesToDisk')

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GooglePack... Remove this comment to see the full error message
class GooglePackage {
  cleanupServerlessDir: any
  compileFunctions: any
  generateArtifactDirectoryName: any
  hooks: any
  mergeServiceResources: any
  options: any
  prepareDeployment: any
  provider: any
  saveCreateTemplateFile: any
  saveUpdateTemplateFile: any
  serverless: any
  setDefaults: any
  setDeploymentBucketName: any
  validate: any
  constructor(serverless, options) {
    this.serverless = serverless
    this.options = options
    this.provider = this.serverless.getProvider('google')
    this.serverless.configSchemaHandler.defineFunctionEvent('google', 'http', { type: 'string' })
    this.serverless.configSchemaHandler.defineFunctionEvent('google', 'event', {
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

    Object.assign(
      this,
      cleanupServerlessDir,
      validate,
      utils,
      setDeploymentBucketName,
      prepareDeployment,
      saveCreateTemplateFile,
      generateArtifactDirectoryName,
      compileFunctions,
      mergeServiceResources,
      saveUpdateTemplateFile,
    )

    this.hooks = {
      'package:cleanup': () => BbPromise.bind(this).then(this.cleanupServerlessDir),

      'before:package:initialize': () => BbPromise.bind(this).then(this.validate).then(this.setDefaults),

      'package:initialize': () =>
        BbPromise.bind(this)
          .then(this.setDeploymentBucketName)
          .then(this.prepareDeployment)
          .then(this.saveCreateTemplateFile),

      'before:package:compileFunctions': () => BbPromise.bind(this).then(this.generateArtifactDirectoryName),

      'package:compileFunctions': () => BbPromise.bind(this).then(this.compileFunctions),

      'package:finalize': () => BbPromise.bind(this).then(this.mergeServiceResources).then(this.saveUpdateTemplateFile),
    }
  }
}

module.exports = GooglePackage
