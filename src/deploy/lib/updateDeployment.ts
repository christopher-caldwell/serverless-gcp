import fs from 'fs'
import path from 'path'

import { Deployment, GoogleDeploy } from '..'

export const updateDeployment = async function (this: GoogleDeploy) {
  const deployment = await this.getDeployment()
  return this.update(deployment)
}

export const getDeployment = async function (this: GoogleDeploy) {
  const auth = await this.provider.getAuthClient()
  const params = {
    auth,
    project: this.provider.googleProvider.project,
  }

  const { data } = await this.provider.sdk.deploymentmanager.deployments.list(params)
  const deployment = data.deployments.find((dep) => {
    const name = `sls-${this.serverless.service.service}-${this.options.stage}`
    return dep.name === name
  })

  if (!deployment) throw new Error('Cannot find deployment')

  return deployment
}

export const update = async function (this: GoogleDeploy, deployment: Deployment) {
  this.serverless.cli.log('Updating deployment...')

  const filePath = path.join(this.serverless.config.servicePath, '.serverless', 'configuration-template-update.yml')

  const deploymentName = `sls-${this.serverless.service.service}-${this.options.stage}`

  const auth = await this.provider.getAuthClient()
  const params = {
    auth,
    project: this.provider.googleProvider.project,
    deployment: deploymentName,
    resource: {
      name: deploymentName,
      fingerprint: deployment.fingerprint,
      target: {
        config: {
          content: fs.readFileSync(filePath).toString(),
        },
      },
    },
  }

  await this.provider.sdk.deploymentmanager.deployments.update(params)

  return this.monitorDeployment(deploymentName, 'update', 5000)
}
