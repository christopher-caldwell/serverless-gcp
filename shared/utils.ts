'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable '_'.
const _ = require('lodash')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

module.exports = {
  setDefaults() {
    this.options.stage = _.get(this, 'options.stage') || _.get(this, 'serverless.service.provider.stage') || 'dev'
    this.options.runtime = _.get(this, 'options.runtime') || 'nodejs10'

    // serverless framework is hard-coding us-east-1 region from aws
    // this is temporary fix for multiple regions
    let region = _.get(this, 'options.region') || _.get(this, 'serverless.service.provider.region')

    if (region === 'us-east-1') {
      region = 'us-central1'
    }

    this.options.region = region
    this.serverless.service.provider.region = region

    return BbPromise.resolve()
  },
}
