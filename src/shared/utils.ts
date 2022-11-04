'use strict'

import Serverless from 'serverless'

import _ from 'lodash'
import BbPromise from 'bluebird'

class _Plugin {
  options: Serverless.Options
  serverless: Serverless
}
export function setDefaults(this: _Plugin) {
  this.options.stage = _.get(this, 'options.stage') || _.get(this, 'serverless.service.provider.stage') || 'dev'
  //@ts-expect-error runtime. I think this is the wrong type for options?
  console.log('this.options.runtime', this.options.runtime)
  //@ts-expect-error runtime. I think this is the wrong type for options?
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
}
