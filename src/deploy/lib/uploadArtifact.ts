import { GoogleFunctionDefinition } from '@/shared/types'
import fs from 'fs'

import { GoogleDeploy } from '..'

export const uploadArtifacts = async function (this: GoogleDeploy) {
  this.serverless.cli.log('Uploading artifacts...')

  const bucketName = this.provider.googleProvider.deploymentBucketName
  const auth = await this.provider.getAuthClient()
  // If package individually, go over functions
  this.serverless.service.getAllFunctions().forEach((functionName) => {
    const funcObject = this.serverless.service.getFunction<GoogleFunctionDefinition>(functionName)
    const { fullPath } = this.getFunctionPath(funcObject)
    console.log({ fullPath })
  })
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
      // This is not a valid file path
      // serverless/example/local/1667865164293-2022-11-07T23:52:44.293Z
      body: fs.createReadStream(this.serverless.service.package.artifactDirectoryName),
    },
  }

  await this.provider.sdk.storage.objects.insert(params)
  this.serverless.cli.log('Artifacts successfully uploaded...')
}
