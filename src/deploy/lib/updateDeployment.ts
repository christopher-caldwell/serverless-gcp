'use strict'

import fs from 'fs'
import path from 'path'

import { GoogleDeploy } from '..'

export const updateDeployment = async function (this: GoogleDeploy) {
  const deployment = await this.getDeployment()
  return this.update(deployment)
}

export const getDeployment = async function (this: GoogleDeploy) {
  const params = {
    //@ts-expect-error project is not on AWS
    project: this.serverless.service.provider.project,
  }

  //@ts-expect-error params signature is different
  const response = await this.provider.request('deploymentmanager', 'deployments', 'list', params)
  const deployment = response.deployments.find((dep) => {
    const name = `sls-${this.serverless.service.service}-${this.options.stage}`
    return dep.name === name
  })

  if (!deployment) throw new Error('Cannot find deployment')

  return deployment
}

export const update = async function (this: GoogleDeploy, deployment: any) {
  this.serverless.cli.log('Updating deployment...')

  const filePath = path.join(this.serverless.config.servicePath, '.serverless', 'configuration-template-update.yml')

  const deploymentName = `sls-${this.serverless.service.service}-${this.options.stage}`

  const params = {
    //@ts-expect-error project not on AWS
    project: this.serverless.service.provider.project,
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

  //@ts-expect-error params signature
  await this.provider.request('deploymentmanager', 'deployments', 'update', params)

  return this.monitorDeployment(deploymentName, 'update', 5000)
}
