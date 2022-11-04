import Serverless from '@/@types/serverless'
import Aws from '@/@types/serverless/aws'
import Plugin, { Commands, Hooks } from '@/@types/serverless/classes/Plugin'

import { constants } from '../provider'
import { validateAndSetDefaults } from '../shared'
import { retrieveLogs, getLogs, printLogs, GoogleLog } from './lib'

export class GoogleLogs implements Plugin {
  commands: Commands
  hooks: Hooks
  options: Serverless.Options
  provider: Aws
  serverless: Serverless
  validateAndSetDefaults: () => void
  retrieveLogs: () => Promise<void>
  getLogs: () => Promise<GoogleLog>
  printLogs: (logs: GoogleLog) => void

  constructor(serverless: Serverless, options: Serverless.Options) {
    this.serverless = serverless
    this.options = options
    this.provider = this.serverless.getProvider(constants.providerName)

    this.validateAndSetDefaults = validateAndSetDefaults.bind(this)
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
        this.validateAndSetDefaults()
      },
      'logs:logs': () => {
        return this.retrieveLogs()
      },
    }
  }
}
