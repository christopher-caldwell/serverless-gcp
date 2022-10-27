'use strict'

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'validate'.
const validate = require('../shared/validate')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'setDefault... Remove this comment to see the full error message
const setDefaults = require('../shared/utils')
const displayServiceInfo = require('./lib/displayServiceInfo')

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GoogleInfo... Remove this comment to see the full error message
class GoogleInfo {
  displayServiceInfo: any
  hooks: any
  options: any
  provider: any
  serverless: any
  setDefaults: any
  validate: any
  constructor(serverless, options) {
    this.serverless = serverless
    this.options = options
    this.provider = this.serverless.getProvider('google')

    Object.assign(this, validate, setDefaults, displayServiceInfo)

    this.hooks = {
      'before:info:info': () => BbPromise.bind(this).then(this.validate).then(this.setDefaults),

      'deploy:deploy': () => BbPromise.bind(this).then(this.displayServiceInfo),

      'info:info': () => BbPromise.bind(this).then(this.displayServiceInfo),
    }
  }
}

module.exports = GoogleInfo
