import Serverless from '@/@types/serverless'
import Aws from '@/@types/serverless/aws'
import { Hooks } from '@/@types/serverless/classes/plugin'
import { constants } from '../provider'

import { validateAndSetDefaults } from '../shared'
import { Resources, displayServiceInfo, gatherData, getResources, printInfo, LogData } from './lib'

export class GoogleInfo {
  hooks: Hooks
  options: Serverless.Options
  provider: Aws
  serverless: Serverless
  validateAndSetDefaults: () => void
  displayServiceInfo: () => Promise<void>
  gatherData: (resources: any) => LogData
  getResources: () => Promise<Resources>
  printInfo: (logData: LogData) => void

  constructor(serverless: Serverless, options: Serverless.Options) {
    this.serverless = serverless
    this.options = options
    this.provider = this.serverless.getProvider(constants.providerName)

    this.validateAndSetDefaults = validateAndSetDefaults.bind(this)
    this.displayServiceInfo = displayServiceInfo.bind(this)
    this.gatherData = gatherData.bind(this)
    this.getResources = getResources.bind(this)
    this.printInfo = printInfo.bind(this)

    this.hooks = {
      'before:info:info': async () => {
        this.validateAndSetDefaults()
      },
      'deploy:deploy': () => {
        return this.displayServiceInfo()
      },

      'info:info': () => {
        return this.displayServiceInfo()
      },
    }
  }
}
