import Serverless from '@/@types/serverless'
import _ from 'lodash'
import { GoogleProvider } from '@/provider'

export class _Plugin {
  options: Serverless.Options
  serverless: Serverless
  provider: GoogleProvider
}
export const setDefaults = function (this: _Plugin) {
  this.options.stage = _.get(this, 'options.stage') || _.get(this, 'serverless.service.provider.stage') || 'dev'

  // this is always undefined in local invoke
  this.options.runtime = _.get(this, 'options.runtime') || 'nodejs10'

  // serverless framework is hard-coding us-east-1 region from aws
  // this is temporary fix for multiple regions
  let region = _.get(this, 'options.region') || _.get(this, 'serverless.service.provider.region')

  if (region === 'us-east-1') {
    region = 'us-central1'
  }

  this.options.region = region
  this.serverless.service.provider.region = region
}
