'use strict'

/* eslint no-use-before-define: 0 */

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'chalk'.
const chalk = require('chalk')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')
// @ts-expect-error TS(2649) FIXME: Cannot augment module '_' with value exports becau... Remove this comment to see the full error message
const _ = require('lodash')

module.exports = {
  displayServiceInfo() {
    return BbPromise.bind(this).then(this.getResources).then(this.gatherData).then(this.printInfo)
  },
  getResources() {
    const project = this.serverless.service.provider.project
    return this.provider.request('deploymentmanager', 'resources', 'list', {
      project,
      deployment: `sls-${this.serverless.service.service}-${this.options.stage}`,
    })
  },
  gatherData(resources) {
    const data = {}
    // general data
    ;(data as any).service = this.serverless.service.service
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
  },
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
    this.serverless.cli.consoleLog(message)
    return BbPromise.resolve()
  },
}

const getFunctionNameInService = (funcName, service, stage) => {
  let funcNameInService = funcName
  funcNameInService = funcNameInService.replace(`${service}-`, '')
  funcNameInService = funcNameInService.replace(`${stage}-`, '')
  return funcNameInService
}
