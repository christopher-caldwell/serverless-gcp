'use strict'

import Serverless from 'serverless'
import Aws from 'serverless/aws'
import { Hooks } from 'serverless/classes/plugin'
import { constants } from '../provider'

// TODO: Add validate
import { validate } from '../shared'
import { Resources, displayServiceInfo, gatherData, getResources, printInfo, LogData } from './lib'

export class GoogleInfo {
  hooks: Hooks
  options: Serverless.Options
  provider: Aws
  serverless: Serverless
  setDefaults: () => void
  displayServiceInfo: () => Promise<void>
  gatherData: (resources: any) => LogData
  getResources: () => Promise<Resources>
  printInfo: (logData: LogData) => void

  constructor(serverless: Serverless, options: Serverless.Options) {
    this.serverless = serverless
    this.options = options
    this.provider = this.serverless.getProvider(constants.providerName)

    this.setDefaults = setDefaults.bind(this)
    this.displayServiceInfo = displayServiceInfo.bind(this)
    this.gatherData = gatherData.bind(this)
    this.getResources = getResources.bind(this)
    this.printInfo = printInfo.bind(this)

    this.hooks = {
      'before:info:info': async () => {
        await validate()
        this.setDefaults()
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
