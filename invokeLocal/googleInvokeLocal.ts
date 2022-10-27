import Serverless from 'serverless'
import Aws from 'serverless/aws'
import Plugin from 'serverless/classes/Plugin'
import { GoogleFunctionDefinition, GoogleServerlessConfig } from '../provider/googleProvider'

import { validateEventsProperty, validate } from '../shared/validate'
const setDefaults = require('../shared/utils')
const getDataAndContext = require('./lib/getDataAndContext')
const nodeJs = require('./lib/nodeJs')

class GoogleInvokeLocal {
  getDataAndContext: any
  invokeLocalNodeJs: any
  setDefaults: any
  serverless: Serverless
  options: Serverless.Options
  provider: Aws
  hooks: Plugin.Hooks

  constructor(serverless: Serverless, options: Serverless.Options) {
    this.serverless = serverless
    this.options = options

    this.provider = this.serverless.getProvider('google')

    Object.assign(this, validate, setDefaults, getDataAndContext, nodeJs)

    this.hooks = {
      initialize: () => {
        this.options = (this.serverless as any).processedInput.options
      },
      'before:invoke:local:invoke': async () => {
        await validate(
          this.serverless.service.functions as unknown as GoogleServerlessConfig['functions'],
          this.serverless.config.servicePath,
          this.serverless.service.service,
        )
        await this.setDefaults()
        await this.getDataAndContext()
      },
      'invoke:local:invoke': async () => this.invokeLocal(),
    }
  }

  async invokeLocal() {
    const functionObj = this.serverless.service.getFunction(
      this.options.function,
    ) as unknown as GoogleFunctionDefinition
    validateEventsProperty(functionObj, this.options.function)

    const runtime = (this.provider as any).getRuntime(functionObj)
    if (!runtime.startsWith('nodejs')) {
      throw new Error(`Local invocation with runtime ${runtime} is not supported`)
    }
    return this.invokeLocalNodeJs(functionObj, (this.options as any).data, (this.options as any).context)
  }
}

module.exports = GoogleInvokeLocal
