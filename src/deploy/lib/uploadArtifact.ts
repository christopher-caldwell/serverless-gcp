import fs from 'fs'

import { GoogleDeploy } from '..'

export const uploadArtifacts = async function (this: GoogleDeploy) {
  this.serverless.cli.log('Uploading artifacts...')

  const bucketName = this.provider.googleProvider.deploymentBucketName
  const auth = await this.provider.getAuthClient()
  const params = {
    auth,
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

  await this.provider.sdk.storage.objects.insert(params)
  this.serverless.cli.log('Artifacts successfully uploaded...')
}
