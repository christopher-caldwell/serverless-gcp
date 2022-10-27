'use strict'

/* eslint no-use-before-define: 0 */

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require('path')

// @ts-expect-error TS(2649) FIXME: Cannot augment module '_' with value exports becau... Remove this comment to see the full error message
const _ = require('lodash')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')
const { validateEventsProperty } = require('../../shared/validate')

module.exports = {
  compileFunctions() {
    const artifactFilePath = this.serverless.service.package.artifact
    const fileName = artifactFilePath.split(path.sep).pop()
    const projectName = _.get(this, 'serverless.service.provider.project')
    this.serverless.service.provider.region = this.serverless.service.provider.region || 'us-central1'
    this.serverless.service.package.artifactFilePath = `${this.serverless.service.package.artifactDirectoryName}/${fileName}`
    this.serverless.service.getAllFunctions().forEach((functionName) => {
      const funcObject = this.serverless.service.getFunction(functionName)
      let vpcEgress = funcObject.vpcEgress || this.serverless.service.provider.vpcEgress
      this.serverless.cli.log(`Compiling function "${functionName}"...`)
      validateHandlerProperty(funcObject, functionName)
      validateEventsProperty(funcObject, functionName)
      validateVpcConnectorProperty(funcObject, functionName)
      validateVpcConnectorEgressProperty(vpcEgress)
      const funcTemplate = getFunctionTemplate(
        funcObject,
        projectName,
        this.serverless.service.provider.region,
        `gs://${this.serverless.service.provider.deploymentBucketName}/${this.serverless.service.package.artifactFilePath}`,
      )
      ;(funcTemplate.properties as any).serviceAccountEmail =
        _.get(funcObject, 'serviceAccountEmail') ||
        _.get(this, 'serverless.service.provider.serviceAccountEmail') ||
        null
      funcTemplate.properties.availableMemoryMb =
        _.get(funcObject, 'memorySize') || _.get(this, 'serverless.service.provider.memorySize') || 256
      funcTemplate.properties.runtime = this.provider.getRuntime(funcObject)
      funcTemplate.properties.timeout =
        _.get(funcObject, 'timeout') || _.get(this, 'serverless.service.provider.timeout') || '60s'
      ;(funcTemplate.properties as any).environmentVariables = this.provider.getConfiguredEnvironment(funcObject)
      ;(funcTemplate.properties as any).secretEnvironmentVariables = this.provider.getConfiguredSecrets(funcObject)
      if (!(funcTemplate.properties as any).serviceAccountEmail) {
        delete (funcTemplate.properties as any).serviceAccountEmail
      }
      if (funcObject.vpc) {
        _.assign(funcTemplate.properties, {
          vpcConnector: _.get(funcObject, 'vpc') || _.get(this, 'serverless.service.provider.vpc'),
        })
      }
      if (vpcEgress) {
        vpcEgress = vpcEgress.toUpperCase()
        if (vpcEgress === 'ALL') vpcEgress = 'ALL_TRAFFIC'
        if (vpcEgress === 'PRIVATE') vpcEgress = 'PRIVATE_RANGES_ONLY'
        _.assign(funcTemplate.properties, {
          vpcConnectorEgressSettings: vpcEgress,
        })
      }
      if (funcObject.maxInstances) {
        ;(funcTemplate.properties as any).maxInstances = funcObject.maxInstances
      }
      if (funcObject.minInstances) {
        ;(funcTemplate.properties as any).minInstances = funcObject.minInstances
      }
      if (!_.size((funcTemplate.properties as any).environmentVariables)) {
        delete (funcTemplate.properties as any).environmentVariables
      }
      if (!_.size((funcTemplate.properties as any).secretEnvironmentVariables)) {
        delete (funcTemplate.properties as any).secretEnvironmentVariables
      }
      ;(funcTemplate.properties as any).labels = _.assign(
        {},
        _.get(this, 'serverless.service.provider.labels') || {},
        _.get(funcObject, 'labels') || {},
      )
      const eventType = Object.keys(funcObject.events[0])[0]
      if (eventType === 'http') {
        const url = funcObject.events[0].http
        ;(funcTemplate.properties as any).httpsTrigger = {}
        ;(funcTemplate.properties as any).httpsTrigger.url = url
      }
      if (eventType === 'event') {
        const type = funcObject.events[0].event.eventType
                const path = funcObject.events[0].event.path; //eslint-disable-line
        const resource = funcObject.events[0].event.resource
        const failurePolicy = funcObject.events[0].event.failurePolicy
        const retry = _.get(funcObject.events[0].event, 'failurePolicy.retry')
        ;(funcTemplate.properties as any).eventTrigger = {}
        ;(funcTemplate.properties as any).eventTrigger.eventType = type
        if (path) (funcTemplate.properties as any).eventTrigger.path = path
        ;(funcTemplate.properties as any).eventTrigger.resource = resource
        if (failurePolicy) {
          ;(funcTemplate.properties as any).eventTrigger.failurePolicy = {}
          ;(funcTemplate.properties as any).eventTrigger.failurePolicy.retry = retry
        }
      }
      this.serverless.service.provider.compiledConfigurationTemplate.resources.push(funcTemplate)
    })
    return BbPromise.resolve()
  },
}

const validateHandlerProperty = (funcObject, functionName) => {
  if (!funcObject.handler) {
    const errorMessage = [
      `Missing "handler" property for function "${functionName}".`,
      ' Your function needs a "handler".',
      ' Please check the docs for more info.',
    ].join('')
    throw new Error(errorMessage)
  }
}

const validateVpcConnectorProperty = (funcObject, functionName) => {
  if (funcObject.vpc && typeof funcObject.vpc === 'string') {
    // vpcConnector argument can be one of two possible formats as described here:
    // https://cloud.google.com/functions/docs/reference/rest/v1/projects.locations.functions#resource:-cloudfunction
    if (funcObject.vpc.indexOf('/') > -1) {
      const vpcNamePattern = /projects\/[\s\S]*\/locations\/[\s\S]*\/connectors\/[\s\S]*/i
      if (!vpcNamePattern.test(funcObject.vpc)) {
        const errorMessage = [
          `The function "${functionName}" has invalid vpc connection name`,
          ' VPC Connector name should follow projects/{project_id}/locations/{region}/connectors/{connector_name}',
          ' or just {connector_name} if within the same project.',
          ' Please check the docs for more info at ',
          ' https://cloud.google.com/functions/docs/reference/rest/v1/projects.locations.functions#resource:-cloudfunction',
        ].join('')
        throw new Error(errorMessage)
      }
    }
  }
}

const validateVpcConnectorEgressProperty = (vpcEgress) => {
  if (vpcEgress && typeof vpcEgress !== 'string') {
    const errorMessage = [
      'Your provider/function has invalid vpc connection name',
      ' VPC Connector Egress Setting be either ALL_TRAFFIC or PRIVATE_RANGES_ONLY. ',
      ' You may shorten these to ALL or PRIVATE optionally.',
      ' Please check the docs for more info at',
      ' https://cloud.google.com/functions/docs/reference/rest/v1/projects.locations.functions#resource:-cloudfunction',
    ].join('')
    throw new Error(errorMessage)
  }
}

const getFunctionTemplate = (funcObject, projectName, region, sourceArchiveUrl) => {
  //eslint-disable-line
  return {
    type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
    name: funcObject.name,
    properties: {
      parent: `projects/${projectName}/locations/${region}`,
      availableMemoryMb: 256,
      runtime: 'nodejs10',
      timeout: '60s',
      entryPoint: funcObject.handler,
      function: funcObject.name,
      sourceArchiveUrl,
    },
  }
}
