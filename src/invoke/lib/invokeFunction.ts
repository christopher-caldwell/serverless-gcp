import chalk from 'chalk'

import { GoogleInvoke } from '..'
import { GoogleServerlessConfig } from '../../shared/types'

export const invokeFunction = async function (this: GoogleInvoke) {
  const result = await this.invoke()
  this.printResult(result)
}

export const invoke = async function (this: GoogleInvoke) {
  const project = this.provider.googleProvider.project
  const region = this.options.region
  let func = this.options.function
  const resourceData = this.options.data || ''

  const functions = this.serverless.service.functions as unknown as GoogleServerlessConfig['functions']
  func = getGoogleCloudFunctionName(functions, func)
  const auth = await this.provider.getAuthClient()
  const params = {
    auth,
    name: `projects/${project}/locations/${region}/functions/${func}`,
    resource: {
      data: resourceData,
    },
  }
  const { data } = await this.provider.sdk.cloudfunctions.projects.locations.functions.call(params)

  return data
}

export interface Result {
  executionId: string
  result: string
}
export const printResult = function (this: GoogleInvoke, result: Result) {
  let res = result

  if (!result || !result.result) {
    res = {
      executionId: 'error',
      result: 'An error occurred while executing your function...',
    }
  }

  const log = `${chalk.grey(res.executionId)} ${res.result}`

  this.serverless.cli.log(log)
}

// retrieve the functions name (Google uses our handler property as the function name)
const getGoogleCloudFunctionName = (serviceFunctions: GoogleServerlessConfig['functions'], func: string) => {
  const targetFunction = serviceFunctions[func]
  if (!targetFunction) {
    const errorMessage = [
      `Function "${func}" not found. `,
      'Please check your "serverless.yml" file for the correct function name.',
    ].join('')
    throw new Error(errorMessage)
  }

  return targetFunction.name
}
