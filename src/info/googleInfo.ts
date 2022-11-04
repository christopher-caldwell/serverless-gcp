'use strict'

import Serverless from 'serverless'
import Aws from 'serverless/aws'
import { Hooks } from 'serverless/classes/plugin'

// TODO: Add validate
import { validate } from '../shared'

export class GoogleInfo {
  hooks: Hooks
  options: Serverless.Options
  provider: Aws
  serverless: Serverless
  setDefaults: any
  validate: any
  constructor(serverless: Serverless, options: Serverless.Options) {
    this.serverless = serverless
    this.options = options
    this.provider = this.serverless.getProvider('google')

    this.hooks = {
      'before:info:info': () => BbPromise.bind(this).then(this.validate).then(this.setDefaults),

      'deploy:deploy': () => BbPromise.bind(this).then(this.displayServiceInfo),

      'info:info': () => BbPromise.bind(this).then(this.displayServiceInfo),
    }
  }

  displayServiceInfo() {
    return BbPromise.bind(this).then(this.getResources).then(this.gatherData).then(this.printInfo)
  }

  getResources() {
    //@ts-expect-error project is not on Aws provider
    const project = this.serverless.service.provider.project
    return this.provider.request('deploymentmanager', 'resources', 'list', {
      //@ts-expect-error project is not on Aws provider
      project,
      deployment: `sls-${this.serverless.service.service}-${this.options.stage}`,
    })
  }

  gatherData(resources) {
    const data = {}
    // general data
    ;(data as any).service = this.serverless.service.service
    //@ts-expect-error project is not on Aws provider
    ;(data as any).project = this.serverless.service.provider.project
    ;(data as any).stage = this.options.stage
    ;(data as any).region = this.options.region
    ;(data as any).resources = {
      functions: [],
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
          //@ts-expect-error project is not on Aws provider
          const project = this.serverless.service.provider.project
          const baseUrl = `https://${region}-${project}.cloudfunctions.net`
          const path = serviceFunc.name // NOTE this might change
          funcResource = `${baseUrl}/${path}`
        }
        const func = {
          name: serviceFuncName,
          resource: funcResource, // how the function can be triggered (e.g. url, pubSub, etc.)
        }
        ;(data as any).resources.functions.push(func)
      }
    })
    return BbPromise.resolve(data)
  }

  printInfo(data) {
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
    return BbPromise.resolve()
  }
}

module.exports = GoogleInfo
