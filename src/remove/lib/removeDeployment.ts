import { GoogleRemove } from '..'

export const removeDeployment = async function (this: GoogleRemove) {
  this.serverless.cli.log('Removing deployment...')

  const deploymentName = `sls-${this.serverless.service.service}-${this.options.stage}`

  const auth = await this.provider.getAuthClient()
  const params = {
    auth,
    project: this.provider.googleProvider.project,
    deployment: deploymentName,
  }

  await this.provider.sdk.deploymentmanager.deployments.delete(params)
  return this.monitorDeployment(deploymentName, 'remove', 5000)
}
