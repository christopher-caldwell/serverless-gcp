'use strict'

import BbPromise from 'bluebird'
import Serverless from 'serverless'
import Aws from 'serverless/aws'
import { Hooks } from 'serverless/classes/plugin'

import { monitorDeployment } from '../shared'
import { GoogleProviderConfig } from '../provider'

export class GoogleDeploy {
  hooks: Hooks
  options: Serverless.Options
  provider: Aws
  serverless: Serverless
  setDefaults: any
  setDeploymentBucketName: any
  updateDeployment: any
  validate: any

  constructor(serverless: Serverless, options: Serverless.Options) {
    this.serverless = serverless
    this.options = options
    this.provider = this.serverless.getProvider('google')
    this.hooks = {
      'before:deploy:deploy': async () => {
        const result = await this.validate()
        return this.setDefaults(result)
      },
      'deploy:deploy': async () => {
        const deployment = await this.createDeployment()
        await this.setDeploymentBucketName(deployment)
        this.uploadArtifacts()
        this.updateDeployment()
      },

      'after:deploy:deploy': () => BbPromise.bind(this).then(this.cleanupDeploymentBucket),
    }
  }

  getDeployment() {
    const params = {
      project: (this.serverless.service.provider as unknown as GoogleProviderConfig).project,
    }

    // @ts-expect-error Mismatch on params
    return provider.request('deploymentmanager', 'deployments', 'list', params).then((response) => {
      const deployment = response.deployments.find((dep: Deployment) => {
        const name = `sls-${this.serverless.service.service}-${this.options.stage}`
        return dep.name === name
      })

      return deployment
    })
  }

  async update(deployment: any) {
    this.serverless.cli.log('Updating deployment...')

    const filePath = path.join(this.serverless.config.servicePath, '.serverless', 'configuration-template-update.yml')

    const deploymentName = `sls-${this.serverless.service.service}-${this.options.stage}`

    const params = {
      project: (this.serverless.service.provider as unknown as GoogleProviderConfig).project,
      deployment: deploymentName,
      resource: {
        name: deploymentName,
        fingerprint: deployment.fingerprint,
        target: {
          config: {
            content: fs.readFileSync(filePath).toString(),
          },
        },
      },
    }

    //@ts-expect-error Mismatch call signature on params
    await this.provider.request('deploymentmanager', 'deployments', 'update', params)
    return monitorDeployment(deploymentName, 'update', 5000, this.serverless, this.provider)
  }

  async cleanupDeploymentBucket() {
    const projectsToRemove = await this.getObjectsToRemove()
    return this.removeObjects(projectsToRemove)
  }

  async getObjectsToRemove(): Promise<CloudStorageObjects[]> {
    const params = {
      //@ts-expect-error deploymentBucketName isn't on provider
      bucket: this.serverless.service.provider.deploymentBucketName,
    }

    //@ts-expect-error Params is different signature
    const response = await this.provider.request('storage', 'objects', 'list', params)
    if (!response.items.length) return []

    const files = response.items

    // 4 old ones + the one which will be uploaded after the cleanup = 5
    const objectsToKeepCount = 4

    const orderedObjects = _.orderBy(
      files,
      (file) => {
        const timestamp = file.name.match(/(serverless)\/(.+)\/(.+)\/(\d+)-(.+)\/(.+\.zip)/)[4]
        return timestamp
      },
      ['asc'],
    )

    const objectsToKeep = _.takeRight(orderedObjects, objectsToKeepCount)
    const objectsToRemove = _.pullAllWith(files, objectsToKeep, _.isEqual)

    if (objectsToRemove.length) {
      return objectsToRemove
    }

    return []
  }

  async removeObjects(objectsToRemove: CloudStorageObjects[]) {
    if (!objectsToRemove.length) return

    this.serverless.cli.log('Removing old artifacts...')

    const removePromises = objectsToRemove.map((object) => {
      const params = {
        bucket: object.bucket,
        object: object.name,
      }
      // @ts-expect-error params is different
      return this.provider.request('storage', 'objects', 'delete', params)
    })

    return BbPromise.all(removePromises)
  }

  async createDeployment() {
    const res = await this.checkForExistingDeployment()
    return this.createIfNotExists(res)
  }

  async checkForExistingDeployment(): Promise<Deployment> {
    const params = {
      //@ts-expect-error project isn't on provider
      project: this.serverless.service.provider.project,
    }

    // @ts-expect-error params is different
    const response = await this.provider.request('deploymentmanager', 'deployments', 'list', params)
    let foundDeployment: Deployment

    if (response && response.deployments) {
      foundDeployment = response.deployments.find((deployment: Deployment) => {
        const name = `sls-${this.serverless.service.service}-${this.options.stage}`
        return deployment.name === name
      })
    }

    return foundDeployment
  }

  async createIfNotExists(foundDeployment: Deployment) {
    if (foundDeployment) return

    this.serverless.cli.log('Creating deployment...')

    const filePath = path.join(this.serverless.config.servicePath, '.serverless', 'configuration-template-create.yml')

    const deploymentName = `sls-${this.serverless.service.service}-${this.options.stage}`

    const params = {
      //@ts-expect-error project isn't on provider
      project: this.serverless.service.provider.project,
      resource: {
        name: deploymentName,
        target: {
          config: {
            content: fs.readFileSync(filePath).toString(),
          },
        },
      },
    }

    //@ts-expect-error params is different
    await this.provider.request('deploymentmanager', 'deployments', 'insert', params)
    return monitorDeployment(deploymentName, 'create', 5000, this.serverless, this.provider)
  }

  async uploadArtifacts() {
    this.serverless.cli.log('Uploading artifacts...')

    const params = {
      // @ts-expect-error deploymentBucketName isn't on provider
      bucket: this.serverless.service.provider.deploymentBucketName,
      resource: {
        name: this.serverless.service.package.artifactFilePath,
        contentType: 'application/octet-stream',
      },
      media: {
        mimeType: 'application/octet-stream',
        body: fs.createReadStream(this.serverless.service.package.artifact),
      },
    }

    // @ts-expect-error params is different
    await this.provider.request('storage', 'objects', 'insert', params)
    return this.serverless.cli.log('Artifacts successfully uploaded...')
  }
}

type Deployment = any
interface CloudStorageObjects {
  bucket: string
  name: string
}
