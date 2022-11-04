'use strict'

import Serverless from 'serverless'
import Aws from 'serverless/aws'

/**
 * mock to test functionality in a command unrelated matter
 * this mean that not e.g. googleDeploy but the more abstract googleCommand can be used
 */
export class GoogleCommand {
  options: any
  provider: Aws
  serverless: Serverless
  constructor(serverless: Serverless, options: Serverless.Options, testSubject) {
    this.options = options
    this.serverless = serverless
    this.provider = this.serverless.getProvider('google')

    Object.assign(this, testSubject)
  }
}
