import _, { MergeWithCustomizer } from 'lodash'

import { GooglePackage } from '..'

export const mergeServiceResources = function (this: GooglePackage) {
  const resources = this.serverless.service.resources

  if (typeof resources === 'undefined' || _.isEmpty(resources)) return

  // @ts-expect-error compiledConfigurationTemplate not on AWS provider
  const template = this.serverless.service.provider.compiledConfigurationTemplate

  _.mergeWith(template, resources, mergeCustomizer)

  return
}

const mergeCustomizer: MergeWithCustomizer = (objValue, srcValue) => {
  if (_.isArray(objValue)) return objValue.concat(srcValue)
  return objValue
}
