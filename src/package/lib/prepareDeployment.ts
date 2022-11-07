import path from 'path'
import _ from 'lodash'

import { _Plugin } from '../../shared'

export const prepareDeployment = function (this: _Plugin) {
  //@ts-expect-error compiledConfigurationTemplate on the types is cloudformation
  let deploymentTemplate = this.serverless.service.provider.compiledConfigurationTemplate
  // let deploymentTemplate = this.provider.googleProvider.compiledConfigurationTemplate || _deploymentTemplate

  // Need to copy this template during build
  deploymentTemplate = this.serverless.utils.readFileSync(
    path.join(__dirname, '..', 'templates', 'core-configuration-template.yml'),
  )

  const bucket = deploymentTemplate.resources.find(findDeploymentBucket)

  const name = this.provider.googleProvider.deploymentBucketName
  const location = this.serverless.service.provider.region
  const updatedBucket = updateBucket(bucket, name, location)

  const bucketIndex = deploymentTemplate.resources.findIndex(findDeploymentBucket)

  deploymentTemplate.resources[bucketIndex] = updatedBucket

  //@ts-expect-error compiledConfigurationTemplate on the types is cloudformation
  this.serverless.service.provider.compiledConfigurationTemplate = deploymentTemplate
}

const updateBucket = (bucket: { name: string; properties?: { location: string } }, name: string, location: string) => {
  const newBucket = _.cloneDeep(bucket)
  newBucket.name = name
  if (location) {
    if (!newBucket.properties) {
      newBucket.properties = {
        location,
      }
    } else newBucket.properties.location = location
  }
  return newBucket
}

const findDeploymentBucket = (resource: { type: string; name: string }) => {
  const type = 'storage.v1.bucket'
  const name = 'will-be-replaced-by-serverless'

  return resource.type === type && resource.name === name
}
