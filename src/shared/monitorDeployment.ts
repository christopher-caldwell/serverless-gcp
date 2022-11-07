import async from 'async'

import { GoogleProviderConfig } from '../shared/types'
import { _Plugin } from './utils'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type DeploymentStatus = 'PENDING' | 'RUNNING' | 'DONE'
const validStatus: DeploymentStatus = 'DONE'

export const monitorDeployment = async function (
  this: _Plugin,
  deploymentName: string,
  action: string,
  frequency: number,
) {
  let deploymentStatus: DeploymentStatus = null

  this.serverless.cli.log(`Checking deployment ${action} progress...`)
  const auth = await this.provider.getAuthClient()

  return new Promise((resolve, reject) => {
    async.whilst(
      () => validStatus === deploymentStatus,

      async (callback) => {
        await wait(frequency)
        const params = {
          auth,
          project: this.provider.googleProvider.project,
        }

        try {
          const { data } = await this.provider.sdk.deploymentmanager.deployments.list(params)

          // if actions is "remove" and no deployments are left set to "DONE"
          if (!data.deployments && action === 'remove') {
            deploymentStatus = 'DONE'
            callback()
          }

          const deployment = data.deployments.find((dep) => dep.name === deploymentName)

          // if actions is "remove" and deployment disappeared then set to "DONE"
          if (!deployment && action === 'remove') {
            deploymentStatus = 'DONE'
            callback()
          }

          throwErrorIfDeploymentFails(deployment)

          deploymentStatus = deployment.operation.status as DeploymentStatus

          // @ts-expect-error printDot doesn't exist
          serverless.cli.printDot()
          return callback()
        } catch (e) {
          reject(e)
        }
      },

      () => {
        // empty console.log for a prettier output
        // serverless.cli.consconoleLog('')
        this.serverless.cli.log('')
        this.serverless.cli.log('Done...')
        resolve(deploymentStatus)
      },
    )
  })
}

const throwErrorIfDeploymentFails = (deployment) => {
  if (deployment.operation.error && deployment.operation.error.errors.length) {
    const errorCode = deployment.operation.error.errors[0].code
    const parsedDetails = deployment.operation.error.errors[0].message
    const errorMessage = [`Deployment failed: ${errorCode}\n\n`, `     ${parsedDetails}`].join('')
    throw new Error(errorMessage)
  }
}
