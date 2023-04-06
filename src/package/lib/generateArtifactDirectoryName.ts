import { GoogleFunctionDefinition } from '@/shared'
import { GooglePackage } from '..'

export const generateArtifactDirectoryNames = function (this: GooglePackage) {
  const isPackagedIndividually = this.serverless.service.package.individually as boolean
  const serviceDir = this.serverless.serviceDir
  console.log({
    serviceDir,
    serverlessDirPath: this.serverless.serverlessDirPath,
  })
  if (isPackagedIndividually) {
    this.serverless.service.getAllFunctions().forEach((functionName) => {
      const funcObject = this.serverless.service.getFunction<GoogleFunctionDefinition>(functionName)
      console.log({
        name: funcObject.name,
      })
    })
  }
  const date = new Date()
  const serviceWithStage = `${this.serverless.service.service}/${this.options.stage}`
  const dateString = `${date.getTime().toString()}-${date.toISOString()}`

  this.serverless.service.package.artifactDirectoryName = `serverless/${serviceWithStage}/${dateString}`
}
