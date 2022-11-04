import path from 'path'
import _ from 'lodash'
import chalk from 'chalk'

import { GoogleInvokeLocal } from '..'
import { GoogleFunctionDefinition } from '../../shared/types'
import { getReqRes } from './httpReqRes'

export const invokeLocalNodeJs = async function (
  this: GoogleInvokeLocal,
  functionObj: GoogleFunctionDefinition,
  event,
  customContext: Record<string, unknown>,
) {
  // index.js and function.js are the two files supported by default by a cloud-function
  // TODO add the file pointed by the main key of the package.json
  //@ts-expect-error serviceDir isn't on there
  const serviceDir = this.serverless.serviceDir as string
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

  if (handlerName === 'event') {
    return this.handleEvent(cloudFunction, event, customContext)
  }
  return this.handleHttp(cloudFunction, event)
}

export const handleError = async function (this: GoogleInvokeLocal, err: Error, resolve: (value?: unknown) => void) {
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

export const handleEvent = function (this: GoogleInvokeLocal, cloudFunction, event, customContext) {
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

export const handleHttp = function (this: GoogleInvokeLocal, cloudFunction, event) {
  const { expressRequest, expressResponse: response } = getReqRes()
  const request = Object.assign(expressRequest, event)

  return new Promise((resolve) => {
    const endCallback = (data) => {
      if (data && Buffer.isBuffer(data)) {
        data = data.toString()
      }
      const headers = response.getHeaders()
      // @ts-ignore .includes
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
      resolve(undefined)
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

export const addEnvironmentVariablesToProcessEnv = function (
  this: GoogleInvokeLocal,
  functionObj: GoogleFunctionDefinition,
) {
  //@ts-expect-error getConfiguredEnvironment not on provider
  const environmentVariables = this.provider.getConfiguredEnvironment(functionObj)
  _.merge(process.env, environmentVariables)
}

const tryToRequirePaths = (path: string) => {
  try {
    return require(path)
  } catch (e) {
    // pass
  }
}
