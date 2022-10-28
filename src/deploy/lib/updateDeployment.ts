'use strict'

import Serverless from 'serverless'
import Aws from 'serverless/aws'
import fs from 'fs'
import path from 'path'

import { GoogleProviderConfig } from '../../provider/googleProvider'
import { monitorDeployment } from '../../shared/monitorDeployment'

// ?
type Deployment = any

export const getDeployment = (
  serverless: Serverless,
  provider: Aws,
  options: Serverless.Options,
): Promise<Deployment> => {
  const params = {
    project: (serverless.service.provider as unknown as GoogleProviderConfig).project,
  }

  // @ts-expect-error Mismatch on params
  return provider.request('deploymentmanager', 'deployments', 'list', params).then((response) => {
    const deployment = response.deployments.find((dep) => {
      const name = `sls-${serverless.service.service}-${options.stage}`
      return dep.name === name
    })

    return deployment
  })
}

export const update = (deployment: Deployment, serverless: Serverless, provider: Aws, options: Serverless.Options) => {
  serverless.cli.log('Updating deployment...')

  const filePath = path.join(serverless.config.servicePath, '.serverless', 'configuration-template-update.yml')

  const deploymentName = `sls-${serverless.service.service}-${options.stage}`

  const params = {
    project: (serverless.service.provider as unknown as GoogleProviderConfig).project,
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

  return (
    provider

      //@ts-expect-error Mismatch call signature on params
      .request('deploymentmanager', 'deployments', 'update', params)
      .then(() => monitorDeployment(deploymentName, 'update', 5000, serverless, provider))
  )
}

export const updateDeployment = async (serverless: Serverless, provider: Aws, options: Serverless.Options) => {
  const deployment = await getDeployment(serverless, provider, options)
  await update(deployment, serverless, provider, options)
}

// Consider making the AWS specific imports the Google version here
// declare module 'serverless' {

// }
