import { GoogleRemove } from '..'
import { ObjectToRemove } from '../../deploy/lib'

export const emptyDeploymentBucket = async function (this: GoogleRemove) {
  const objects = await this.getObjectsToRemove()
  return this.removeObjects(objects)
}

export const getObjectsToRemove = async function (this: GoogleRemove) {
  const auth = await this.provider.getAuthClient()
  const params = {
    auth,
    bucket: this.provider.googleProvider.deploymentBucketName,
  }

  const { data } = await this.provider.sdk.storage.objects.list(params)

  if (!data.items || !data.items.length) return []

  return data.items
}

export const removeObjects = async function (this: GoogleRemove, objectsToRemove: ObjectToRemove[]) {
  if (!objectsToRemove.length) return
  const auth = await this.provider.getAuthClient()

  this.serverless.cli.log('Removing artifacts in deployment bucket...')

  const removePromises = objectsToRemove.map((object) => {
    const params = {
      auth,
      bucket: object.bucket,
      object: object.name,
    }
    return this.provider.sdk.storage.objects.delete(params)
  })

  return Promise.all(removePromises)
}
