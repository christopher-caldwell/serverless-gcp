import BbPromise from 'bluebird'
import Serverless from 'serverless'
import Aws from 'serverless/aws'
import Plugin, { Commands, Hooks } from 'serverless/classes/Plugin'

import { constants } from '../provider'
import { validate, setDefaults } from '../shared'

import { retrieveLogs, getLogs, printLogs, GoogleLog } from './lib'

export class GoogleLogs implements Plugin {
  commands: Commands
  hooks: Hooks
  options: Serverless.Options
  provider: Aws
  serverless: Serverless
  setDefaults: () => void
  retrieveLogs: () => Promise<void>
  getLogs: () => Promise<GoogleLog>
  printLogs: (logs: GoogleLog) => void

  constructor(serverless: Serverless, options: Serverless.Options) {
    this.serverless = serverless
    this.options = options
    this.provider = this.serverless.getProvider(constants.providerName)

    this.setDefaults = setDefaults.bind(this)
    this.getLogs = getLogs.bind(this)
    this.printLogs = printLogs.bind(this)
    this.retrieveLogs = retrieveLogs.bind(this)

    this.commands = {
      logs: {
        lifecycleEvents: ['logs'],
        options: {
          count: {
            usage: 'Amount of requested logs',
            shortcut: 'c',
            //@ts-expect-error type isn't allowed
            type: 'string',
          },
        },
      },
    }

    this.hooks = {
      'before:logs:logs': async () => {
        await validate(this.serverless.config.servicePath, this.serverless.service.service)
        this.setDefaults()
      },
      'logs:logs': () => {
        return this.retrieveLogs()
      },
    }
  }
}
