'use strict'

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')
// @ts-expect-error TS(2649) FIXME: Cannot augment module '_' with value exports becau... Remove this comment to see the full error message
const _ = require('lodash')

module.exports = {
  setDeploymentBucketName() {
    // set a default name for the deployment bucket
    const service = this.serverless.service.service
    const stage = this.options.stage
    const timestamp = +new Date()
    const name = `sls-${service}-${stage}-${timestamp}`

    this.serverless.service.provider.deploymentBucketName = name

    // check if there's already a deployment and update if available
    const params = {
      project: this.serverless.service.provider.project,
      deployment: `sls-${this.serverless.service.service}-${this.options.stage}`,
    }

    return this.provider
      .request('deploymentmanager', 'resources', 'list', params)
      .then((response) => {
        if (!_.isEmpty(response) && response.resources) {
          const regex = new RegExp(`sls-${service}-${stage}-.+`)

          const deploymentBucket = response.resources.find(
            (resource) => resource.type === 'storage.v1.bucket' && resource.name.match(regex),
          )

          this.serverless.service.provider.deploymentBucketName = deploymentBucket.name
        }
      })
      .catch(() => BbPromise.resolve()) // if it cannot be found (e.g. on initial deployment)
  },
}
