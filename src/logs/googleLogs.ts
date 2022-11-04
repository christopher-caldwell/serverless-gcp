'use strict'

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'validate'.
const validate = require('../shared/validate')
const setDefaults = require('../shared/utils')
const retrieveLogs = require('./lib/retrieveLogs')

class GoogleLogs {
  commands: any
  hooks: any
  options: any
  provider: any
  retrieveLogs: any
  serverless: any
  setDefaults: any
  validate: any
  constructor(serverless, options) {
    this.serverless = serverless
    this.options = options
    this.provider = this.serverless.getProvider('google')

    this.commands = {
      logs: {
        lifecycleEvents: ['logs'],
        options: {
          count: {
            usage: 'Amount of requested logs',
            shortcut: 'c',
            type: 'string',
          },
        },
      },
    }

    Object.assign(this, validate, setDefaults, retrieveLogs)

    this.hooks = {
      'before:logs:logs': () => BbPromise.bind(this).then(this.validate).then(this.setDefaults),

      'logs:logs': () => BbPromise.bind(this).then(this.retrieveLogs),
    }
  }
}

module.exports = GoogleLogs
