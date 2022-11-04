'use strict'

import { GoogleFunctionDefinition, GoogleProviderConfig, GoogleServerlessConfig } from '../shared/types'

import BbPromise from 'bluebird'
import _ from 'lodash'
import { _Plugin } from './utils'

export const validateServicePath = (servicePath?: string) => {
  if (!servicePath) {
    throw new Error('This command can only be run inside a service directory')
  }

  return BbPromise.resolve()
}

export const validateServiceName = (name: string) => {
  // should not contain 'goog'
  if (name.match(/goog/)) {
    throw new Error('Your service should not contain the string "goog"')
  }

  if (name.match(/_+/)) {
    throw new Error('Your service name should not include underscores')
  }

  return BbPromise.resolve()
}

export const validateHandlers = (functions: GoogleServerlessConfig['functions']) => {
  _.forEach(functions, (funcVal: GoogleFunctionDefinition, funcKey: string) => {
    if (_.includes(funcVal.handler, '/') || _.includes(funcVal.handler, '.')) {
      const errorMessage = [
        `The "handler" property for the function "${funcKey}" is invalid.`,
        ' Handlers should be plain strings referencing only the exported function name',
        ' without characters such as "." or "/" (so e.g. "http" instead of "index.http").',
        ' Do you want to nest your functions code in a subdirectory?',
        ' Google solves this by utilizing the "main" config in the projects package.json file.',
        ' Please check the docs for more info.',
      ].join('')
      throw new Error(errorMessage)
    }
  })
}

export const validateEventsProperty = (
  funcObject: GoogleFunctionDefinition,
  functionName: string,
  supportedEvents = ['http', 'event'],
) => {
  if (!funcObject.events || funcObject.events.length === 0) {
    const errorMessage = [
      `Missing "events" property for function "${functionName}".`,
      ' Your function needs at least one "event".',
      ' Please check the docs for more info.',
    ].join('')
    throw new Error(errorMessage)
  }

  if (funcObject.events.length > 1) {
    const errorMessage = [
      `The function "${functionName}" has more than one event.`,
      ' Only one event per function is supported.',
      ' Please check the docs for more info.',
    ].join('')
    throw new Error(errorMessage)
  }

  const eventType = Object.keys(funcObject.events[0])[0]
  if (supportedEvents.indexOf(eventType) === -1) {
    const errorMessage = [
      `Event type "${eventType}" of function "${functionName}" not supported.`,
      ` supported event types are: ${supportedEvents.join(', ')}`,
    ].join('')
    throw new Error(errorMessage)
  }
}

export const validate = async function (this: _Plugin) {
  await validateServicePath(this.serverless.config.servicePath)
  await validateServiceName(this.serverless.service.service)
}

export const validateAndSetDefaults = async function (this: _Plugin) {
  await validateServicePath(this.serverless.config.servicePath)
  await validateServiceName(this.serverless.service.service)
  this.options.stage = _.get(this, 'options.stage') || _.get(this, 'serverless.service.provider.stage') || 'dev'

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
}