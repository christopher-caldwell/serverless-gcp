import Serverless from 'serverless'
import Aws from 'serverless/aws'
import Plugin from 'serverless/classes/Plugin'
import BbPromise from 'bluebird'

import { constants, GoogleProviderConfig, GoogleServerlessConfig } from '../provider'
import { validate, setDefaults, setDeploymentBucketName } from '../shared'

const emptyDeploymentBucket = require('./lib/emptyDeploymentBucket')
const removeDeployment = require('./lib/removeDeployment')
const monitorDeployment = require('../shared/monitorDeployment')

export class GoogleRemove {
  monitorDeployment: any
  serverless: Serverless
  options: Serverless.Options
  provider: Aws
  hooks: Plugin.Hooks
  setDefaults: () => void
  setDeploymentBucketName: () => void

  constructor(serverless: Serverless, options: Serverless.Options) {
    this.serverless = serverless
    this.options = options
    this.provider = this.serverless.getProvider(constants.providerName)

    this.setDefaults = setDefaults.bind(this)
    this.setDeploymentBucketName = setDeploymentBucketName.bind(this)

    Object.assign(this, emptyDeploymentBucket, removeDeployment, monitorDeployment)

    this.hooks = {
      'before:remove:remove': async () => {
        await validate(this.serverless.config.servicePath, this.serverless.service.service)
        this.setDefaults()
        this.setDeploymentBucketName()
      },
      'remove:remove': () => BbPromise.bind(this).then(this.emptyDeploymentBucket).then(this.removeDeployment),
    }
  }

  removeDeployment() {
    this.serverless.cli.log('Removing deployment...')

    const deploymentName = `sls-${this.serverless.service.service}-${this.options.stage}`

    const params = {
      project: (this.serverless.service.provider as any).project,
      deployment: deploymentName,
    }

    return (
      this.provider
        // @ts-expect-error TS(2559) FIXME: Type '{ project: any; deployment: string; }' has n... Remove this comment to see the full error message
        .request('deploymentmanager', 'deployments', 'delete', params)
        .then(() => this.monitorDeployment(deploymentName, 'remove', 5000))
    )
  }

  emptyDeploymentBucket() {
    // @ts-expect-error TS(2769) FIXME: No overload matches this call.
    return BbPromise.bind(this).then(this.getObjectsToRemove).then(this.removeObjects)
  }

  removeObjects(objectsToRemove) {
    if (!objectsToRemove.length) return BbPromise.resolve()

    this.serverless.cli.log('Removing artifacts in deployment bucket...')

    const removePromises = objectsToRemove.map((object) => {
      const params = {
        bucket: object.bucket,
        object: object.name,
      }
      // @ts-expect-error TS(2559) FIXME: Type '{ bucket: any; object: any; }' has no proper... Remove this comment to see the full error message
      return this.provider.request('storage', 'objects', 'delete', params)
    })

    return BbPromise.all(removePromises)
  }

  async getObjectsToRemove() {
    const params = {
      bucket: (this.serverless.service.provider as unknown as GoogleProviderConfig).deploymentBucketName,
    }

    // @ts-expect-error TS(2559) FIXME: Type '{ bucket: string; }' has no properties in co... Remove this comment to see the full error message
    const response = await this.provider.request('storage', 'objects', 'list', params)
    if (!response.items || !response.items.length) return BbPromise.resolve([])

    return BbPromise.resolve(response.items)
  }
}
