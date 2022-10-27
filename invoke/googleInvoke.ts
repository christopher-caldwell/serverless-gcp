'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'validate'.
const validate = require('../shared/validate')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'setDefault... Remove this comment to see the full error message
const setDefaults = require('../shared/utils')
const invokeFunction = require('./lib/invokeFunction')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleInvo... Remove this comment to see the full error message
class GoogleInvoke {
  hooks: any
  invokeFunction: any
  options: any
  provider: any
  serverless: any
  setDefaults: any
  validate: any
  constructor(serverless, options) {
    this.serverless = serverless
    this.options = options
    this.provider = this.serverless.getProvider('google')

    Object.assign(this, validate, setDefaults, invokeFunction)

    this.hooks = {
      'before:invoke:invoke': () => BbPromise.bind(this).then(this.validate).then(this.setDefaults),

      'invoke:invoke': () => BbPromise.bind(this).then(this.invokeFunction),
    }
  }
}

module.exports = GoogleInvoke
