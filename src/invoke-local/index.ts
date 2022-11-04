import Serverless from 'serverless'
import Aws from 'serverless/aws'
import Plugin from 'serverless/classes/Plugin'
import _ from 'lodash'

import { constants } from '../provider'
import { GoogleFunctionDefinition } from '../shared/types'

import { validateEventsProperty, validateAndSetDefaults } from '../shared'
import {
  getDataAndContext,
  loadFileInOption,
  invokeLocalNodeJs,
  handleError,
  handleEvent,
  handleHttp,
  addEnvironmentVariablesToProcessEnv,
} from './lib'

export class GoogleInvokeLocal implements Plugin {
  serverless: Serverless
  options: Serverless.Options
  provider: Aws
  hooks: Plugin.Hooks
  validateAndSetDefaults: () => void
  getDataAndContext: () => Promise<void>
  loadFileInOption: (filePath: string, optionKey: string) => Promise<void>
  invokeLocalNodeJs: (
    functionObj: GoogleFunctionDefinition,
    event: Record<string, unknown>,
    customContext: Record<string, unknown>,
  ) => Promise<any>
  handleError: (err: Error, resolve: (value?: unknown) => void) => void
  handleEvent: (cloudFunction, event, customContext) => void
  handleHttp: (cloudFunction, event) => void
  addEnvironmentVariablesToProcessEnv: (functionObj: GoogleFunctionDefinition) => void

  constructor(serverless: Serverless, options: Serverless.Options) {
    this.serverless = serverless
    this.options = options

    this.provider = this.serverless.getProvider(constants.providerName)
    this.validateAndSetDefaults = validateAndSetDefaults.bind(this)
    this.getDataAndContext = getDataAndContext.bind(this)
    this.loadFileInOption = loadFileInOption.bind(this)
    this.invokeLocalNodeJs = invokeLocalNodeJs.bind(this)
    this.handleError = handleError.bind(this)
    this.handleEvent = handleEvent.bind(this)
    this.handleHttp = handleHttp.bind(this)
    this.addEnvironmentVariablesToProcessEnv = addEnvironmentVariablesToProcessEnv.bind(this)

    this.hooks = {
      initialize: () => {
        //@ts-expect-error processedInput not on serverless
        this.options = this.serverless.processedInput.options
      },
      'before:invoke:local:invoke': async () => {
        this.validateAndSetDefaults()
        await this.getDataAndContext()
      },
      'invoke:local:invoke': () => this.invokeLocal(),
    }
  }

  async invokeLocal() {
    const functionObj = this.serverless.service.getFunction(
      this.options.function,
    ) as unknown as GoogleFunctionDefinition
    validateEventsProperty(functionObj, this.options.function)

    //@ts-expect-error getRuntime not on provider
    const runtime = this.provider.getRuntime(functionObj)
    if (!runtime.startsWith('nodejs')) {
      throw new Error(`Local invocation with runtime ${runtime} is not supported`)
    }

    //@ts-expect-error event not on options
    const event = this.options.event
    //@ts-expect-error context not on options
    const context = this.options.context

    return this.invokeLocalNodeJs(functionObj, event, context)
  }
}
