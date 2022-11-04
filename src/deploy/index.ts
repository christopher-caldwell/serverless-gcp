import Serverless from 'serverless'
import Aws from 'serverless/aws'
import { Hooks } from 'serverless/classes/plugin'

import { monitorDeployment, validateAndSetDefaults, setDeploymentBucketName } from '../shared'
import { constants } from '../provider'
import {
  uploadArtifacts,
  update,
  updateDeployment,
  getDeployment,
  createDeployment,
  checkForExistingDeployment,
  createIfNotExists,
  ObjectToRemove,
} from './lib'

export class GoogleDeploy {
  hooks: Hooks
  options: Serverless.Options
  provider: Aws
  serverless: Serverless
  validateAndSetDefaults: () => void
  setDeploymentBucketName: () => void
  updateDeployment: () => Promise<void>
  uploadArtifacts: () => Promise<void>
  getDeployment: () => Promise<Deployment>
  monitorDeployment: (deploymentName: string, action: string, frequency: number) => Promise<string>
  update: (deployment: Deployment) => Promise<string>
  checkForExistingDeployment: () => Promise<Deployment | undefined>
  createDeployment: () => Promise<void>
  createIfNotExists: (deployment?: Deployment) => Promise<string>
  cleanupDeploymentBucket: () => Promise<void>
  getObjectsToRemove: () => Promise<ObjectToRemove[]>
  removeObjects: (objectsToRemove: ObjectToRemove[]) => Promise<void>

  constructor(serverless: Serverless, options: Serverless.Options) {
    this.serverless = serverless
    this.options = options
    this.provider = this.serverless.getProvider(constants.providerName)

    this.validateAndSetDefaults = validateAndSetDefaults.bind(this)
    this.setDeploymentBucketName = setDeploymentBucketName.bind(this)
    this.uploadArtifacts = uploadArtifacts.bind(this)
    this.monitorDeployment = monitorDeployment.bind(this)
    this.update = update.bind(this)
    this.updateDeployment = updateDeployment.bind(this)
    this.getDeployment = getDeployment.bind(this)
    this.checkForExistingDeployment = checkForExistingDeployment.bind(this)
    this.createDeployment = createDeployment.bind(this)
    this.createIfNotExists = createIfNotExists.bind(this)

    this.hooks = {
      'before:deploy:deploy': async () => {
        this.validateAndSetDefaults()
      },
      'deploy:deploy': async () => {
        await this.createDeployment()
        this.setDeploymentBucketName()
        await this.uploadArtifacts()
        return this.updateDeployment()
      },

      'after:deploy:deploy': () => {
        this.cleanupDeploymentBucket()
      },
    }
  }
}

export type Deployment = {
  name: string
  target: {
    config: {
      content: string
    }
  }
}
interface CloudStorageObjects {
  bucket: string
  name: string
}
