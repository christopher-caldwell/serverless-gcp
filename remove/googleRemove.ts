import Serverless from 'serverless'
import Aws from 'serverless/aws'
import Plugin from 'serverless/classes/Plugin'
import { GoogleProviderConfig, GoogleServerlessConfig } from '../provider/googleProvider'

import BbPromise from 'bluebird'

import { validate } from '../shared/validate'
// const validate = require('../shared/validate');
const setDefaults = require('../shared/utils')
const setDeploymentBucketName = require('../shared/setDeploymentBucketName')
const emptyDeploymentBucket = require('./lib/emptyDeploymentBucket')
const removeDeployment = require('./lib/removeDeployment')
const monitorDeployment = require('../shared/monitorDeployment')

class GoogleRemove {
  serverless: Serverless
  options: Serverless.Options
  provider: Aws
  hooks: Plugin.Hooks
  constructor(serverless: Serverless, options: Serverless.Options) {
    this.serverless = serverless
    this.options = options
    this.provider = this.serverless.getProvider('google')

    Object.assign(
      this,
      validate,
      setDefaults,
      setDeploymentBucketName,
      emptyDeploymentBucket,
      removeDeployment,
      monitorDeployment,
    )

    this.hooks = {
      'before:remove:remove': async () => {
        await validate(
          this.serverless.service.functions as unknown as GoogleServerlessConfig['functions'],
          this.serverless.config.servicePath,
          this.serverless.service.service,
        )
        // setDefaults
        // setDeploymentBucketName
      },
      'remove:remove': () => BbPromise.bind(this).then(this.emptyDeploymentBucket).then(this.removeDeployment),
    }
  }

  removeDeployment() {
    this.serverless.cli.log('Removing deployment...')

    const deploymentName = `sls-${this.serverless.service.service}-${this.options.stage}`

    const params = {
      project: this.serverless.service.provider.project,
      deployment: deploymentName,
    }

    return this.provider
      .request('deploymentmanager', 'deployments', 'delete', params)
      .then(() => this.monitorDeployment(deploymentName, 'remove', 5000))
  }

  emptyDeploymentBucket() {
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
      return this.provider.request('storage', 'objects', 'delete', params)
    })

    return BbPromise.all(removePromises)
  }

  async getObjectsToRemove() {
    const params = {
      bucket: (this.serverless.service.provider as unknown as GoogleProviderConfig).deploymentBucketName,
    }

    const response = await this.provider.request('storage', 'objects', 'list', params)
    if (!response.items || !response.items.length) return BbPromise.resolve([])

    return BbPromise.resolve(response.items)
  }
}

module.exports = GoogleRemove
