import { GoogleRemove } from '..'

export const removeDeployment = async function (this: GoogleRemove) {
  this.serverless.cli.log('Removing deployment...')

  const deploymentName = `sls-${this.serverless.service.service}-${this.options.stage}`

  const params = {
    //@ts-expect-error project not on AWS
    project: this.serverless.service.provider.project,
    deployment: deploymentName,
  }

  //@ts-expect-error params
  await this.provider.request('deploymentmanager', 'deployments', 'delete', params)
  return this.monitorDeployment(deploymentName, 'remove', 5000)
}
