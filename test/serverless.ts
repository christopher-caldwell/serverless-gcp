'use strict'

// mock of the serverless instance
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
class Serverless {
  cli: any
  configSchemaHandler: any
  pluginManager: any
  plugins: any
  processedInput: any
  providers: any
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

  setProvider(name, provider) {
    this.providers[name] = provider
  }

  getProvider(name) {
    return this.providers[name]
  }
}

module.exports = Serverless
