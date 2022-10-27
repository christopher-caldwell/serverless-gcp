'use strict'

/* eslint no-use-before-define: 0 */

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require('path')

// @ts-expect-error TS(2649) FIXME: Cannot augment module '_' with value exports becau... Remove this comment to see the full error message
const _ = require('lodash')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

module.exports = {
  prepareDeployment() {
    let deploymentTemplate = this.serverless.service.provider.compiledConfigurationTemplate

    deploymentTemplate = this.serverless.utils.readFileSync(
      path.join(__dirname, '..', 'templates', 'core-configuration-template.yml'),
    )

    const bucket = deploymentTemplate.resources.find(findDeploymentBucket)

    const name = this.serverless.service.provider.deploymentBucketName
    const location = this.serverless.service.provider.region
    const updatedBucket = updateBucket(bucket, name, location)

    const bucketIndex = deploymentTemplate.resources.findIndex(findDeploymentBucket)

    deploymentTemplate.resources[bucketIndex] = updatedBucket

    this.serverless.service.provider.compiledConfigurationTemplate = deploymentTemplate

    return BbPromise.resolve()
  },
}

const updateBucket = (bucket, name, location) => {
  const newBucket = _.cloneDeep(bucket)
  newBucket.name = name
  if (location) {
    if (!newBucket.properties) newBucket.properties = {}
    newBucket.properties.location = location
  }
  return newBucket
}

const findDeploymentBucket = (resource) => {
  const type = 'storage.v1.bucket'
  const name = 'will-be-replaced-by-serverless'

  return resource.type === type && resource.name === name
}
