'use strict'

// mock to test functionality in a command unrelated matter
// this mean that not e.g. googleDeploy but the more abstract googleCommand can be used
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GoogleComm... Remove this comment to see the full error message
class GoogleCommand {
  options: any
  provider: any
  serverless: any
  constructor(serverless, options, testSubject) {
    this.options = options
    this.serverless = serverless
    this.provider = this.serverless.getProvider('google')

    Object.assign(this, testSubject)
  }
}

module.exports = GoogleCommand
