import { GoogleRemove } from '..'
import { ObjectToRemove } from '../../deploy/lib'

export const emptyDeploymentBucket = async function (this: GoogleRemove) {
  const objects = await this.getObjectsToRemove()
  return this.removeObjects(objects)
}

export const getObjectsToRemove = async function (this: GoogleRemove) {
  const params = {
    //@ts-expect-error deploymentBucketName not on AWS
    bucket: this.serverless.service.provider.deploymentBucketName,
  }

  //@ts-expect-error params signature
  const response = await this.provider.request('storage', 'objects', 'list', params)
  if (!response.items || !response.items.length) return []

  return response.items
}

export const removeObjects = function (this: GoogleRemove, objectsToRemove: ObjectToRemove[]) {
  if (!objectsToRemove.length) return

  this.serverless.cli.log('Removing artifacts in deployment bucket...')

  const removePromises = objectsToRemove.map((object) => {
    const params = {
      bucket: object.bucket,
      object: object.name,
    }
    //@ts-expect-error params signature
    return this.provider.request('storage', 'objects', 'delete', params)
  })

  return Promise.all(removePromises)
}
