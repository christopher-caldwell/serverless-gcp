import fs from 'fs'
import path from 'path'

import { GoogleDeploy, Deployment } from '..'

export const createDeployment = async function (this: GoogleDeploy) {
  const deployment = await this.checkForExistingDeployment()
  return this.createIfNotExists(deployment)
}

export const checkForExistingDeployment = async function (this: GoogleDeploy): Promise<Deployment | undefined> {
  const params = {
    //@ts-expect-error project not on there
    project: this.serverless.service.provider.project,
  }

  //@ts-expect-error params index signature
  const response = (await this.provider.request('deploymentmanager', 'deployments', 'list', params)) as {
    deployments: Deployment[]
  }
  let foundDeployment: Deployment

  if (response && response.deployments) {
    foundDeployment = response.deployments.find((deployment) => {
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

  const params = {
    //@ts-expect-error project not on there
    project: this.serverless.service.provider.project,
    resource: {
      name: deploymentName,
      target: {
        config: {
          content: fs.readFileSync(filePath).toString(),
        },
      },
    },
  }

  //@ts-expect-error params index signature
  await this.provider.request('deploymentmanager', 'deployments', 'insert', params)

  return this.monitorDeployment(deploymentName, 'create', 5000)
}
