import fs from 'fs'
import path from 'path'

import { GoogleDeploy, Deployment } from '..'

export const createDeployment = async function (this: GoogleDeploy) {
  const deployment = await this.checkForExistingDeployment()
  return this.createIfNotExists(deployment)
}

export const checkForExistingDeployment = async function (this: GoogleDeploy): Promise<Deployment | undefined> {
  const auth = await this.provider.getAuthClient()
  const params = {
    project: this.provider.googleProvider.project,
    auth,
  }

  const { data } = await this.provider.sdk.deploymentmanager.deployments.list(params)
  let foundDeployment: Deployment

  if (data && data.deployments) {
    foundDeployment = data.deployments.find((deployment) => {
      const name = `sls-${this.serverless.service.service}-${this.options.stage}`
      return deployment.name === name
    })
  }

  return foundDeployment
}

export const createIfNotExists = async function (this: GoogleDeploy, foundDeployment?: Deployment) {
  if (foundDeployment) return

  this.serverless.cli.log('Creating deployment...')

  const filePath = path.join(this.serverless.config.servicePath, '.serverless', 'configuration-template-create.yml')

  const deploymentName = `sls-${this.serverless.service.service}-${this.options.stage}`

  const auth = await this.provider.getAuthClient()
  const params = {
    auth,
    project: this.provider.googleProvider.project,
    resource: {
      name: deploymentName,
      target: {
        config: {
          content: fs.readFileSync(filePath).toString(),
        },
      },
    },
  }

  await this.provider.sdk.deploymentmanager.deployments.insert(params)

  return this.monitorDeployment(deploymentName, 'create', 5000)
}
