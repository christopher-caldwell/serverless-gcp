'use strict'

import BbPromise from 'bluebird'
import async from 'async'
import Serverless from 'serverless'
import Aws from 'serverless/aws'
import { GoogleProviderConfig } from '../provider/googleProvider'

export const monitorDeployment = (
  deploymentName: string,
  action: string,
  frequency: number,
  serverless: Serverless,
  provider: Aws,
) => {
  const validStatuses = ['DONE']

  let deploymentStatus = null

  serverless.cli.log(`Checking deployment ${action} progress...`)

  return new BbPromise((resolve, reject) => {
    async.whilst(
      () => validStatuses.indexOf(deploymentStatus) === -1,

      (callback) => {
        setTimeout(() => {
          const params = {
            project: (serverless.service.provider as unknown as GoogleProviderConfig).project,
          }
          return (
            provider
              // @ts-expect-error params doesn't find the shape of AWS
              .request('deploymentmanager', 'deployments', 'list', params)
              .then((response) => {
                // if actions is "remove" and no deployments are left set to "DONE"
                if (!response.deployments && action === 'remove') {
                  deploymentStatus = 'DONE'
                  callback()
                }

                const deployment = response.deployments.find((dep) => dep.name === deploymentName)

                // if actions is "remove" and deployment disappeared then set to "DONE"
                if (!deployment && action === 'remove') {
                  deploymentStatus = 'DONE'
                  callback()
                }

                throwErrorIfDeploymentFails(deployment)

                deploymentStatus = deployment.operation.status

                // @ts-expect-error printDot doesn't exist
                serverless.cli.printDot()
                return callback()
              })
              .catch((error) => {
                reject(error)
              })
          )
        }, frequency)
      },

      () => {
        // empty console.log for a prettier output
        // serverless.cli.consconoleLog('')
        serverless.cli.log('')
        serverless.cli.log('Done...')
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
