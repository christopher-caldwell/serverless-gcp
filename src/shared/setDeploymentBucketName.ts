import _ from 'lodash'

import { _Plugin } from './utils'

export const setDeploymentBucketName = async function (this: _Plugin) {
  // set a default name for the deployment bucket
  const service = this.serverless.service.service
  const stage = this.options.stage
  const timestamp = +new Date()
  const name = `sls-${service}-${stage}-${timestamp}`

  const auth = await this.provider.getAuthClient()
  this.provider.googleProvider.deploymentBucketName = name

  // check if there's already a deployment and update if available
  const params = {
    auth,
    project: this.provider.googleProvider.project,
    deployment: `sls-${this.serverless.service.service}-${this.options.stage}`,
  }

  try {
    const { data } = await this.provider.sdk.deploymentmanager.resources.list(params)

    if (!_.isEmpty(data) && data.resources) {
      const regex = new RegExp(`sls-${service}-${stage}-.+`)

      const deploymentBucket = data.resources.find(
        (resource) => resource.type === 'storage.v1.bucket' && resource.name.match(regex),
      )

      this.provider.googleProvider.deploymentBucketName = deploymentBucket.name
    }
  } catch (e) {
    // likely the first deployment
    return
  }
}
