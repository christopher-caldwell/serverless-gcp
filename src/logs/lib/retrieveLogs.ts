import chalk from 'chalk'

import { GoogleLogs } from '../'
import { GoogleServerlessConfig } from '../../shared/types'

export const retrieveLogs = async function (this: GoogleLogs) {
  const logs = await this.getLogs()
  this.printLogs(logs)
}

export const getLogs = async function (this: GoogleLogs) {
  const project = this.provider.googleProvider.project
  let func = this.options.function
  const count = this.options.count
  const pageSize = count ? parseInt(count, 10) : 10

  const allFunctions = this.serverless.service.functions as unknown as GoogleServerlessConfig['functions']
  func = getGoogleCloudFunctionName(allFunctions, func)

  const auth = await this.provider.getAuthClient()
  const params = {
    auth,
    filter: `resource.labels.function_name="${func}" AND NOT textPayload=""`,
    orderBy: 'timestamp desc',
    resourceNames: [`projects/${project}`],
    pageSize,
  }

  const { data } = await this.provider.sdk.logging.entries.list(params)
  return data
}

export interface GoogleLog {
  entries: {
    timestamp: string
    textPayload: string
    labels?: {
      execution_id?: string
    }
  }[]
}
export const printLogs = function (this: GoogleLogs, logs: GoogleLog) {
  if (!logs.entries || !logs.entries.length) {
    logs = {
      entries: [
        {
          timestamp: new Date().toISOString().slice(0, 10),
          textPayload: 'There is no log data to show...',
        },
      ],
    }
  }

  let output = logs.entries.reduce((p, c) => {
    let message = ''
    message += `${chalk.grey(`${c.timestamp}:`)}\t`
    message += c.labels && c.labels.execution_id ? `[${c.labels.execution_id}]\t` : ''
    message += `${c.textPayload}\n`
    return p + message
  }, '')

  output = `Displaying the ${logs.entries.length} most recent log(s):\n\n${output}` // prettify output
  output = output.slice(0, output.length - 1) // remove "\n---\n\n" for the last log entry

  this.serverless.cli.log(output)
}

const getGoogleCloudFunctionName = (serviceFunctions: GoogleServerlessConfig['functions'], func: string) => {
  if (!serviceFunctions[func]) {
    const errorMessage = [
      `Function "${func}" not found. `,
      'Please check your "serverless.yml" file for the correct function name.',
    ].join('')
    throw new Error(errorMessage)
  }
  return serviceFunctions[func].name
}
