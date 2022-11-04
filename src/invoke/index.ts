import Serverless from '@/@types/serverless'
import Aws from '@/@types/serverless/aws'
import Plugin, { Hooks } from '@/@types/serverless/classes/plugin'
import { constants } from '../provider'

import { validateAndSetDefaults } from '../shared'
import { printResult, invoke, Result, invokeFunction } from './lib'

export class GoogleInvoke implements Plugin {
  hooks: Hooks
  options: Serverless.Options
  provider: Aws
  serverless: Serverless
  validateAndSetDefaults: () => void
  invoke: () => Promise<Result>
  printResult: (result: Result) => void
  invokeFunction: () => Promise<void>

  constructor(serverless: Serverless, options: Serverless.Options) {
    this.serverless = serverless
    this.options = options
    this.provider = this.serverless.getProvider(constants.providerName)

    this.validateAndSetDefaults = validateAndSetDefaults.bind(this)
    this.invoke = invoke.bind(this)
    this.printResult = printResult.bind(this)
    this.invokeFunction = invokeFunction.bind(this)

    this.hooks = {
      'before:invoke:invoke': async () => {
        this.validateAndSetDefaults()
      },
      'invoke:invoke': () => this.invokeFunction(),
    }
  }
}
