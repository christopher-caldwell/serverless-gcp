import _ from 'lodash'

import { GoogleDeploy } from '..'

export const cleanupDeploymentBucket = async function (this: GoogleDeploy) {
  const objectsToRemove = await this.getObjectsToRemove()
  return this.removeObjects(objectsToRemove)
}

export const getObjectsToRemove = async function (this: GoogleDeploy) {
  const auth = await this.provider.getAuthClient()
  const { data } = await this.provider.sdk.storage.objects.list({
    bucket: this.provider.googleProvider.deploymentBucketName,
    auth,
  })

  if (!data.items?.length) return []

  const files = data.items

  // 4 old ones + the one which will be uploaded after the cleanup = 5
  const objectsToKeepCount = 4

  const orderedObjects = _.orderBy(
    files,
    (file) => {
      const timestamp = file.name.match(/(serverless)\/(.+)\/(.+)\/(\d+)-(.+)\/(.+\.zip)/)[4]
      return timestamp
    },
    ['asc'],
  )

  const objectsToKeep = _.takeRight(orderedObjects, objectsToKeepCount)
  const objectsToRemove = _.pullAllWith(files, objectsToKeep, _.isEqual)

  if (objectsToRemove.length) {
    return objectsToRemove
  }

  return []
}

export const removeObjects = async function (this: GoogleDeploy, objectsToRemove: ObjectToRemove[]) {
  if (!objectsToRemove.length) return

  this.serverless.cli.log('Removing old artifacts...')

  const removePromises = objectsToRemove.map((object) => {
    const params = {
      bucket: object.bucket,
      object: object.name,
    }

    return this.provider.sdk.storage.objects.delete(params)
  })

  return Promise.all(removePromises)
}

export type ObjectToRemove = any
