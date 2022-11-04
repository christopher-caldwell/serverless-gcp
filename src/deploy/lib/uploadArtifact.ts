import fs from 'fs'

import { GoogleDeploy } from '..'

export const uploadArtifacts = async function (this: GoogleDeploy) {
  this.serverless.cli.log('Uploading artifacts...')

  //@ts-expect-error deploymentBucketName not on AWS
  const bucketName = this.serverless.service.provider.deploymentBucketName
  const params = {
    bucket: bucketName,
    resource: {
      name: this.serverless.service.package.artifactFilePath,
      contentType: 'application/octet-stream',
    },
    media: {
      mimeType: 'application/octet-stream',
      // TODO: This might be where the issue about index and function is.
      body: fs.createReadStream(this.serverless.service.package.artifact),
    },
  }

  //@ts-expect-error params are different signature
  await this.provider.request('storage', 'objects', 'insert', params)
  this.serverless.cli.log('Artifacts successfully uploaded...')
}
