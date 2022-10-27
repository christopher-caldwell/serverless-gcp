'use strict'

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'validate'.
const validate = require('../shared/validate')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'utils'.
const utils = require('../shared/utils')
const createDeployment = require('./lib/createDeployment')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'setDeploym... Remove this comment to see the full error message
const setDeploymentBucketName = require('../shared/setDeploymentBucketName')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'monitorDep... Remove this comment to see the full error message
const monitorDeployment = require('../shared/monitorDeployment')
const uploadArtifacts = require('./lib/uploadArtifacts')
const updateDeployment = require('./lib/updateDeployment')
const cleanupDeploymentBucket = require('./lib/cleanupDeploymentBucket')

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GoogleDepl... Remove this comment to see the full error message
class GoogleDeploy {
  cleanupDeploymentBucket: any
  createDeployment: any
  hooks: any
  options: any
  provider: any
  serverless: any
  setDefaults: any
  setDeploymentBucketName: any
  updateDeployment: any
  uploadArtifacts: any
  validate: any
  constructor(serverless, options) {
    this.serverless = serverless
    this.options = options
    this.provider = this.serverless.getProvider('google')

    Object.assign(
      this,
      validate,
      utils,
      createDeployment,
      setDeploymentBucketName,
      monitorDeployment,
      uploadArtifacts,
      updateDeployment,
      cleanupDeploymentBucket,
    )

    this.hooks = {
      'before:deploy:deploy': () => BbPromise.bind(this).then(this.validate).then(this.setDefaults),

      'deploy:deploy': () =>
        BbPromise.bind(this)
          .then(this.createDeployment)
          .then(this.setDeploymentBucketName)
          .then(this.uploadArtifacts)
          .then(this.updateDeployment),

      'after:deploy:deploy': () => BbPromise.bind(this).then(this.cleanupDeploymentBucket),
    }
  }
}

module.exports = GoogleDeploy
