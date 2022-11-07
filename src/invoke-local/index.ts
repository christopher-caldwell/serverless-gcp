import Serverless from '@/@types/serverless'
import Plugin, { Logging } from '@/@types/serverless/classes/Plugin'
import _ from 'lodash'

import { constants, GoogleProvider } from '../provider'
import { GoogleFunctionDefinition } from '../shared/types'
import { validateEventsProperty, validateAndSetDefaults, getFunctionPath } from '../shared'
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
  provider: GoogleProvider
  hooks: Plugin.Hooks
  logging: Logging
  getFunctionPath: (functionObj: GoogleFunctionDefinition) => {
    fullPath: string
    handlerContainer: Record<string, any>
    handlerName: string
  }
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

  constructor(serverless: Serverless, options: Serverless.Options, logging: Logging) {
    this.serverless = serverless
    this.options = options
    this.logging = logging

    this.provider = this.serverless.getProvider<GoogleProvider>(constants.providerName)
    this.validateAndSetDefaults = validateAndSetDefaults.bind(this)
    this.getFunctionPath = getFunctionPath.bind(this)
    this.getDataAndContext = getDataAndContext.bind(this)
    this.loadFileInOption = loadFileInOption.bind(this)
    this.invokeLocalNodeJs = invokeLocalNodeJs.bind(this)
    this.handleError = handleError.bind(this)
    this.handleEvent = handleEvent.bind(this)
    this.handleHttp = handleHttp.bind(this)
    this.addEnvironmentVariablesToProcessEnv = addEnvironmentVariablesToProcessEnv.bind(this)

    this.hooks = {
      initialize: () => {
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
    const functionObj = this.serverless.service.getFunction<GoogleFunctionDefinition>(this.options.function)
    validateEventsProperty(functionObj, this.options.function)

    const runtime = this.provider.getRuntime(functionObj)
    if (!runtime.startsWith('nodejs')) {
      throw new Error(`Local invocation with runtime ${runtime} is not supported`)
    }

    const event = this.options.event
    const context = this.options.context

    return this.invokeLocalNodeJs(functionObj, event, context)
  }
}
