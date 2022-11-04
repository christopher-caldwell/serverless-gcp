import type Serverless from 'serverless'
import Plugin, { Hooks } from 'serverless/classes/plugin'

import { GoogleProvider } from './provider'
import { GooglePackage } from './package'
import { GoogleDeploy } from './deploy'
import { GoogleRemove } from './remove'
// import { GoogleInvoke } from './invoke'
import { GoogleInvokeLocal } from './invoke-local'
import { GoogleLogs } from './logs'
import { GoogleInfo } from './info'

/**
 * **NOTE:** this plugin is used to add all the different provider related plugins at once.
 * This way only one plugin needs to be added to the service in order to get access to the
 * whole provider implementation.
 */
class GoogleServerlessPlugin implements Plugin {
  serverless: Serverless
  options: Serverless.Options
  hooks: Hooks

  constructor(serverless: Serverless, options: Serverless.Options) {
    this.serverless = serverless
    this.options = options

    this.serverless.pluginManager.addPlugin(GoogleProvider)
    this.serverless.pluginManager.addPlugin(GooglePackage)
    this.serverless.pluginManager.addPlugin(GoogleDeploy)
    this.serverless.pluginManager.addPlugin(GoogleRemove)
    // this.serverless.pluginManager.addPlugin(GoogleInvoke)
    this.serverless.pluginManager.addPlugin(GoogleInvokeLocal)
    this.serverless.pluginManager.addPlugin(GoogleLogs)
    this.serverless.pluginManager.addPlugin(GoogleInfo)
  }
}

export = GoogleServerlessPlugin
