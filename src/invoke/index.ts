'use strict'

import Serverless from 'serverless'
import Aws from 'serverless/aws'
import Plugin, { Hooks } from 'serverless/classes/plugin'

const BbPromise = require('bluebird')

import { validate } from '../shared'
const setDefaults = require('../shared/utils')

export class GoogleInvoke implements Plugin {
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
      'before:invoke:invoke': () => BbPromise.bind(this).then(this.validate).then(this.setDefaults),

      'invoke:invoke': () => BbPromise.bind(this).then(this.invokeFunction),
    }
  }

  invokeFunction() {
    return BbPromise.bind(this).then(this.invoke).then(this.printResult)
  }

  invoke() {
    //@ts-expect-error project is not on Aws provider
    const project = this.serverless.service.provider.project
    const region = this.options.region
    let func = this.options.function
    //@ts-expect-error data doesn't exist on options
    const data = this.options.data || ''

    func = getGoogleCloudFunctionName(this.serverless.service.functions, func)

    const params = {
      name: `projects/${project}/locations/${region}/functions/${func}`,
      resource: {
        data,
      },
    }

    //@ts-expect-error 2-4 args, got 6?
    return this.provider.request('cloudfunctions', 'projects', 'locations', 'functions', 'call', params)
  }

  printResult(result) {
    let res = result

    if (!result || !result.result) {
      res = {
        executionId: 'error',
        result: 'An error occurred while executing your function...',
      }
    }

    const log = `${chalk.grey(res.executionId)} ${res.result}`

    this.serverless.cli.log(log)

    return BbPromise.resolve()
  }
}

module.exports = GoogleInvoke
