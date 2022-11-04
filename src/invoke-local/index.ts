import Serverless from 'serverless'
import path from 'path'
import Aws from 'serverless/aws'
import Plugin from 'serverless/classes/Plugin'
import _ from 'lodash'

import { GoogleFunctionDefinition, GoogleServerlessConfig } from '../provider'

import { validateEventsProperty, validate, setDefaults } from '../shared'

export class GoogleInvokeLocal implements Plugin {
  serverless: Serverless
  options: Serverless.Options
  provider: Aws
  hooks: Plugin.Hooks
  setDefaults: () => void

  constructor(serverless: Serverless, options: Serverless.Options) {
    this.serverless = serverless
    this.options = options

    this.provider = this.serverless.getProvider('_google')
    this.setDefaults = setDefaults.bind(this)

    this.hooks = {
      initialize: () => {
        //@ts-expect-error processedInput not on serverless
        this.options = this.serverless.processedInput.options
      },
      'before:invoke:local:invoke': async () => {
        await validate(
          this.serverless.service.functions as unknown as GoogleServerlessConfig['functions'],
          this.serverless.config.servicePath,
          this.serverless.service.service,
        )
        this.setDefaults()
        await this.getDataAndContext()
      },
      'invoke:local:invoke': async () => this.invokeLocal(),
    }
  }

  async loadFileInOption(filePath: string, optionKey: string) {
    //@ts-expect-error serviceDir not on serverless
    const serviceDir = this.serverless.serviceDir as string
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(serviceDir, filePath)

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`The file you provided does not exist: ${absolutePath}`)
    }
    if (absolutePath.endsWith('.js')) {
      // to support js - export as an input data
      this.options[optionKey] = require(absolutePath)
      return
    }
    this.options[optionKey] = await this.serverless.utils.readFile(absolutePath)
  }

  async getDataAndContext() {
    // unless asked to preserve raw input, attempt to parse any provided objects
    //@ts-expect-error not on options
    if (!this.options.raw) {
      //@ts-expect-error not on options
      if (this.options.data) {
        try {
          //@ts-expect-error not on options
          this.options.data = JSON.parse(this.options.data)
        } catch (exception) {
          // do nothing if it's a simple string or object already
        }
      }
      //@ts-expect-error not on options
      if (this.options.context) {
        try {
          //@ts-expect-error not on options
          this.options.context = JSON.parse(this.options.context)
        } catch (exception) {
          // do nothing if it's a simple string or object already
        }
      }
    }

    //@ts-expect-error not on options
    if (!this.options.data) {
      //@ts-expect-error not on options
      if (this.options.path) {
        //@ts-expect-error not on options
        await this.loadFileInOption(this.options.path, 'data')
      } else {
        try {
          //@ts-expect-error not on options
          this.options.data = await stdin()
        } catch (e) {
          // continue if no stdin was provided
        }
      }
    }

    //@ts-expect-error not on options
    if (!this.options.context && this.options.contextPath) {
      //@ts-expect-error not on options
      await this.loadFileInOption(this.options.contextPath, 'context')
    }
  }

  async invokeLocalNodeJs(functionObj: GoogleFunctionDefinition, event, customContext: Record<String, unknown>) {
    // index.js and function.js are the two files supported by default by a cloud-function
    // TODO add the file pointed by the main key of the package.json
    //@ts-expect-error serviceDir isn't on there
    const serviceDir = this.serverless.serviceDir as string
    console.log({ event })
    // const paths = ['index.js', 'function.js'].map((fileName) => path.join(serviceDir, fileName))
    const [sourcePath, handlerName = 'event'] = functionObj.handler.split('.')
    const fullPath = path.join(serviceDir, sourcePath)
    if (!fullPath) {
      throw new Error(`Failed to join paths to the targeted function`)
    }
    if (handlerName !== 'event' && handlerName !== 'http') {
      throw new Error(
        `The only supported function names are "event" and "http". You provided ${handlerName}. 
        
Blame Google, not me.`,
      )
    }

    const handlerContainer = tryToRequirePaths(fullPath)
    if (!handlerContainer) {
      throw new Error(`Failed to require ${fullPath}`)
    }

    const cloudFunction = handlerContainer[handlerName]
    if (!cloudFunction) {
      throw new Error(
        `Failed to load function "${handlerName}" from module. 
This likely means that you did not export the designated function (${handlerName}) from the file`,
      )
    }

    this.addEnvironmentVariablesToProcessEnv(functionObj)

    const eventType = Object.keys(functionObj.events[0])[0]

    switch (eventType) {
      case 'event':
        return this.handleEvent(cloudFunction, event, customContext)
      case 'http':
        return this.handleHttp(cloudFunction, event)
      default:
        throw new Error(`${eventType} is not supported`)
    }
  }

  handleError(err: Error, resolve: (value?: unknown) => void) {
    let errorResult: Record<string, unknown>
    if (err instanceof Error) {
      errorResult = {
        errorMessage: err.message,
        errorType: err.constructor.name,
        stackTrace: err.stack && err.stack.split('\n'),
      }
    } else {
      errorResult = {
        errorMessage: err,
      }
    }

    this.serverless.cli.log(chalk.red(JSON.stringify(errorResult, null, 4)))
    resolve()
    process.exitCode = 1
  }

  handleEvent(cloudFunction, event, customContext) {
    let hasResponded = false

    function handleResult(result) {
      if (result instanceof Error) {
        this.handleError.call(this, result)
        return
      }
      this.serverless.cli.consoleLog(JSON.stringify(result, null, 4))
    }

    return new Promise((resolve) => {
      const callback = (err, result) => {
        if (!hasResponded) {
          hasResponded = true
          if (err) {
            this.handleError(err, resolve)
          } else if (result) {
            handleResult.call(this, result)
          }
          resolve(undefined)
        }
      }

      let context = {}

      if (customContext) {
        context = customContext
      }
      try {
        const maybeThennable = cloudFunction(event, context, callback)
        if (maybeThennable) {
          Promise.resolve(maybeThennable).then(callback.bind(this, null), callback.bind(this))
        }
      } catch (error) {
        this.handleError(error, resolve)
      }
    })
  }

  handleHttp(cloudFunction, event) {
    const { expressRequest, expressResponse: response } = getReqRes()
    const request = Object.assign(expressRequest, event)

    return new Promise((resolve) => {
      const endCallback = (data) => {
        if (data && Buffer.isBuffer(data)) {
          data = data.toString()
        }
        const headers = response.getHeaders()
        const bodyIsJson = headers['content-type'] && headers['content-type'].includes(jsonContentType)
        if (data && bodyIsJson) {
          data = JSON.parse(data)
        }
        this.serverless.cli.log(
          JSON.stringify(
            {
              status: response.statusCode,
              headers,
              body: data,
            },
            null,
            4,
          ),
        )
        // @ts-expect-error TS(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
        resolve()
      }

      Object.assign(response, { end: endCallback }) // Override of the end method which is always called to send the response of the http request

      try {
        const maybeThennable = cloudFunction(request, response)
        if (maybeThennable) {
          Promise.resolve(maybeThennable).catch((error) => this.handleError(error, resolve))
        }
      } catch (error) {
        this.handleError(error, resolve)
      }
    })
  }

  addEnvironmentVariablesToProcessEnv(functionObj: GoogleFunctionDefinition) {
    //@ts-expect-error getConfiguredEnvironment not on provider
    const environmentVariables = this.provider.getConfiguredEnvironment(functionObj)
    _.merge(process.env, environmentVariables)
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
    return this.invokeLocalNodeJs(functionObj, (this.options as any).data, (this.options as any).context)
  }
}

const tryToRequirePaths = (path: string) => {
  try {
    return require(path)
  } catch (e) {
    // pass
  }
}
