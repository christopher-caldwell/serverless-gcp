import path from 'path'
import _ from 'lodash'
import BbPromise from 'bluebird'

import { GooglePackage } from '..'
import { validateEventsProperty } from '../../shared'
import { GoogleFunctionDefinition, GoogleMemory, GoogleRegion, GoogleRuntime } from '../../shared/types'

export function compileFunctions(this: GooglePackage) {
  const artifactFilePath = this.serverless.service.package.artifact
  const fileName = artifactFilePath.split(path.sep).pop()
  const projectName = _.get(this, 'serverless.service.provider.project')
  this.serverless.service.provider.region = this.serverless.service.provider.region || 'us-central1'
  this.serverless.service.package.artifactFilePath = `${this.serverless.service.package.artifactDirectoryName}/${fileName}`
  this.serverless.service.getAllFunctions().forEach((functionName) => {
    const funcObject = this.serverless.service.getFunction(functionName) as unknown as GoogleFunctionDefinition
    //@ts-expect-error vpcEgress not on AWS provider
    let vpcEgress = funcObject.vpcEgress || this.serverless.service.provider.vpcEgress
    this.serverless.cli.log(`Compiling function "${functionName}"...`)
    validateHandlerProperty(funcObject, functionName)
    validateEventsProperty(funcObject, functionName)
    validateVpcConnectorProperty(funcObject, functionName)
    validateVpcConnectorEgressProperty(vpcEgress)
    const funcTemplate = getDefaultFunctionTemplate(
      funcObject,
      projectName,
      this.serverless.service.provider.region as GoogleRegion,
      //@ts-expect-error deploymentBucketName not on AWS provider
      `gs://${this.serverless.service.provider.deploymentBucketName}/${this.serverless.service.package.artifactFilePath}`,
    )
    funcTemplate.properties.serviceAccountEmail =
      _.get(funcObject, 'serviceAccountEmail') || _.get(this, 'serverless.service.provider.serviceAccountEmail') || null

    funcTemplate.properties.availableMemoryMb =
      _.get(funcObject, 'memorySize') || _.get(this, 'serverless.service.provider.memorySize') || 256

    //@ts-expect-error getRuntime not on AWS provider
    funcTemplate.properties.runtime = this.provider.getRuntime(funcObject)

    funcTemplate.properties.timeout =
      _.get(funcObject, 'timeout') || _.get(this, 'serverless.service.provider.timeout') || '60s'

    //@ts-expect-error getConfiguredEnvironment not on AWS provider
    funcTemplate.properties.environmentVariables = this.provider.getConfiguredEnvironment(funcObject)
    //@ts-expect-error getConfiguredSecrets not on AWS provider
    funcTemplate.properties.secretEnvironmentVariables = this.provider.getConfiguredSecrets(funcObject)

    // No..
    if (!funcTemplate.properties.serviceAccountEmail) {
      delete funcTemplate.properties.serviceAccountEmail
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
      funcTemplate.properties.maxInstances = funcObject.maxInstances
    }
    if (funcObject.minInstances) {
      funcTemplate.properties.minInstances = funcObject.minInstances
    }
    if (!_.size(funcTemplate.properties.environmentVariables)) {
      delete funcTemplate.properties.environmentVariables
    }
    if (!_.size(funcTemplate.properties.secretEnvironmentVariables)) {
      delete funcTemplate.properties.secretEnvironmentVariables
    }
    funcTemplate.properties.labels = _.assign(
      {},
      _.get(this, 'serverless.service.provider.labels') || {},
      _.get(funcObject, 'labels') || {},
    )
    const eventType = Object.keys(funcObject.events[0])[0]
    if (eventType === 'http') {
      const url = funcObject.events[0].http
      funcTemplate.properties.httpsTrigger = {
        url,
      }
    }
    if (eventType === 'event') {
      const type = funcObject.events[0].event.eventType
      const path = funcObject.events[0].event.path
      const resource = funcObject.events[0].event.resource
      const failurePolicy = funcObject.events[0].event.failurePolicy
      const retry = _.get(funcObject.events[0].event, 'failurePolicy.retry')
      funcTemplate.properties.eventTrigger = {
        eventType: type,
        resource,
      }
      if (path) funcTemplate.properties.eventTrigger.path = path
      if (failurePolicy) {
        funcTemplate.properties.eventTrigger.failurePolicy = {
          retry,
        }
      }
    }
    //@ts-expect-error Seems to be called `compiledCloudFormationTemplate`
    this.serverless.service.provider.compiledConfigurationTemplate.resources.push(funcTemplate)
    // this.serverless.service.provider.compiledCloudFormationTemplate.resources.push(funcTemplate)
  })
}

const validateHandlerProperty = (funcObject: GoogleFunctionDefinition, functionName: string) => {
  if (!funcObject.handler) {
    const errorMessage = [
      `Missing "handler" property for function "${functionName}".`,
      ' Your function needs a "handler".',
      ' Please check the docs for more info.',
    ].join('')
    throw new Error(errorMessage)
  }
}

const validateVpcConnectorProperty = (funcObject: GoogleFunctionDefinition, functionName: string) => {
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

const validateVpcConnectorEgressProperty = (vpcEgress?: string) => {
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

interface FunctionTemplateProperties {
  parent
  availableMemoryMb: GoogleMemory
  runtime: GoogleRuntime
  timeout: string
  entryPoint: string
  function: string
  sourceArchiveUrl: string
  serviceAccountEmail?: string
  environmentVariables?: any
  secretEnvironmentVariables?: any
  minInstances?: number
  maxInstances?: number
  httpsTrigger?: {
    url: string
  }
  labels?: string
  eventTrigger?: {
    eventType: string
    path?: string
    resource: string
    failurePolicy?: {
      retry: number
    }
  }
}
interface FunctionTemplate {
  type: string
  name: string
  properties: FunctionTemplateProperties
}

const getDefaultFunctionTemplate = (
  funcObject: GoogleFunctionDefinition,
  projectName: string,
  region: GoogleRegion,
  sourceArchiveUrl: string,
): FunctionTemplate => {
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
