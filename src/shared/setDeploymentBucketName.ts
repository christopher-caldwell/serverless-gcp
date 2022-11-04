'use strict'

import BbPromise from 'bluebird'
import _ from 'lodash'

import { _Plugin } from './utils'

export const setDeploymentBucketName = async function (this: _Plugin) {
  // set a default name for the deployment bucket
  const service = this.serverless.service.service
  const stage = this.options.stage
  const timestamp = +new Date()
  const name = `sls-${service}-${stage}-${timestamp}`

  //@ts-expect-error deploymentBucketName not on AWS provider
  this.serverless.service.provider.deploymentBucketName = name

  // check if there's already a deployment and update if available
  const params = {
    //@ts-expect-error project not on AWS provider
    project: this.serverless.service.provider.project,
    deployment: `sls-${this.serverless.service.service}-${this.options.stage}`,
  }

  try {
    //@ts-expect-error params different signature
    const response = await this.provider.request('deploymentmanager', 'resources', 'list', params)
    if (!_.isEmpty(response) && response.resources) {
      const regex = new RegExp(`sls-${service}-${stage}-.+`)

      const deploymentBucket = response.resources.find(
        (resource) => resource.type === 'storage.v1.bucket' && resource.name.match(regex),
      )

      //@ts-expect-error deploymentBucketName not on AWS provider
      this.serverless.service.provider.deploymentBucketName = deploymentBucket.name
    }
  } catch (e) {
    // likely the first deployment
    return
  }
}
