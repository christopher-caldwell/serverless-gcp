'use strict'

// mock of the serverless instance
export class Serverless {
  cli: any
  configSchemaHandler: any
  pluginManager: any
  plugins: any
  processedInput: any
  providers: Record<string, any>
  service: any
  utils: any
  constructor() {
    this.providers = {}

    this.service = {}
    this.service.getAllFunctions = function () {
      //eslint-disable-line
      return Object.keys(this.functions)
    }
    this.service.getFunction = function (functionName) {
      //eslint-disable-line
      // NOTE assign the function name only when it is not specified
      if (!this.functions[functionName].name) {
        // NOTE the stage is always 'dev'!
        this.functions[functionName].name = `${this.service}-dev-${functionName}`
      }
      return this.functions[functionName]
    }
    this.service.provider = {}
    this.utils = {
      writeFileSync() {},
      readFileSync() {},
    }

    this.cli = {
      log() {},
      consoleLog() {},
      printDot() {},
    }

    this.plugins = []
    this.pluginManager = {
      addPlugin: (plugin) => this.plugins.push(plugin),
    }

    this.configSchemaHandler = {
      defineProvider: jest.fn(),
      defineFunctionEvent: jest.fn(),
    }

    this.processedInput = {}
  }

  setProvider(name: string, provider) {
    this.providers[name] = provider
  }

  getProvider(name: string) {
    return this.providers[name]
  }
}
