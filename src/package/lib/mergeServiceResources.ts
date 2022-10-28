'use strict'

/* eslint no-use-before-define: 0 */

// @ts-expect-error TS(2649) FIXME: Cannot augment module '_' with value exports becau... Remove this comment to see the full error message
const _ = require('lodash')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

module.exports = {
  mergeServiceResources() {
    const resources = this.serverless.service.resources

    if (typeof resources === 'undefined' || _.isEmpty(resources)) return BbPromise.resolve()

    _.mergeWith(this.serverless.service.provider.compiledConfigurationTemplate, resources, mergeCustomizer)

    return BbPromise.resolve()
  },
}

const mergeCustomizer = (objValue, srcValue) => {
  if (_.isArray(objValue)) return objValue.concat(srcValue)
  return objValue
}
