import chalk from 'chalk'
import { deploymentmanager_v2 } from 'googleapis'
import _ from 'lodash'

import { GoogleInfo } from '..'

export const displayServiceInfo = async function (this: GoogleInfo) {
  const resources = await this.getResources()
  const logData = this.gatherData(resources)
  this.printInfo(logData)
}

export const getResources = async function (this: GoogleInfo): Promise<Resources> {
  const project = this.provider.project

  const auth = await this.provider.getAuthClient()
  const params = {
    auth,
    project,
    deployment: `sls-${this.serverless.service.service}-${this.options.stage}`,
  }

  const { data } = await this.provider.sdk.deploymentmanager.resources.list(params)
  return data
}

export interface LogData {
  service: string
  project: string
  stage: string
  region: string
  resources: {
    functions: any[]
  }
}

export type Resources = deploymentmanager_v2.Schema$ResourcesListResponse
export type Resource = deploymentmanager_v2.Schema$ResourcesListResponse['resources'][number]
export const gatherData = function (this: GoogleInfo, resources: Resources) {
  const project = this.provider.googleProvider.project

  const data: LogData = {
    project: project,
    service: this.serverless.service.service,
    stage: this.options.stage,
    region: this.options.region,
    resources: {
      functions: [],
    },
  }

  _.forEach(resources.resources, (resource) => {
    if (resource.type === 'gcp-types/cloudfunctions-v1:projects.locations.functions') {
      const serviceFuncName = getFunctionNameInService(
        resource.name,
        this.serverless.service.service,
        this.options.stage,
      )
      const serviceFunc = this.serverless.service.getFunction(serviceFuncName)
      const eventType = Object.keys(serviceFunc.events[0])[0]
      const funcEventConfig = serviceFunc.events[0][eventType]
      let funcResource = funcEventConfig.resource || null
      if (eventType === 'http') {
        const region = this.options.region
        const baseUrl = `https://${region}-${project}.cloudfunctions.net`
        const path = serviceFunc.name // NOTE this might change
        funcResource = `${baseUrl}/${path}`
      }
      const func = {
        name: serviceFuncName,
        resource: funcResource, // how the function can be triggered (e.g. url, pubSub, etc.)
      }
      data.resources.functions.push(func)
    }
  })
  return data
}

export const printInfo = function (this: GoogleInfo, data: LogData) {
  let message = ''
  // get all the service related information
  message += `${chalk.yellow.underline('Service Information')}\n`
  message += `${chalk.yellow('service:')} ${data.service}\n`
  message += `${chalk.yellow('project:')} ${data.project}\n`
  message += `${chalk.yellow('stage:')} ${data.stage}\n`
  message += `${chalk.yellow('region:')} ${data.region}\n`
  message += '\n'
  // get all the functions
  message += `${chalk.yellow.underline('Deployed functions')}\n`
  if (data.resources.functions.length) {
    data.resources.functions.forEach((func) => {
      message += `${chalk.yellow(func.name)}\n`
      message += `  ${func.resource}\n`
    })
  } else {
    message += 'There are no functions deployed yet\n'
  }
  this.serverless.cli.log(message)
}

const getFunctionNameInService = (funcName: string, service: string, stage: string) => {
  let funcNameInService = funcName
  funcNameInService = funcNameInService.replace(`${service}-`, '')
  funcNameInService = funcNameInService.replace(`${stage}-`, '')
  return funcNameInService
}
