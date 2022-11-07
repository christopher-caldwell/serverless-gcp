import Serverless from '@/@types/serverless'
import Plugin from '@/@types/serverless/classes/Plugin'

import { constants, GoogleProvider } from '../provider'
import { ObjectToRemove } from '../deploy/lib'
import { monitorDeployment, validateAndSetDefaults, setDeploymentBucketName } from '../shared'
import { removeObjects, emptyDeploymentBucket, getObjectsToRemove, removeDeployment } from './lib'

export class GoogleRemove {
  serverless: Serverless
  options: Serverless.Options
  provider: GoogleProvider
  hooks: Plugin.Hooks
  monitorDeployment: (deploymentName: string, action: string, frequency: number) => Promise<string>
  validateAndSetDefaults: () => void
  setDeploymentBucketName: () => void
  emptyDeploymentBucket: () => Promise<void>
  getObjectsToRemove: () => Promise<ObjectToRemove[]>
  removeObjects: (objectsToRemove: ObjectToRemove[]) => Promise<void>
  removeDeployment: () => Promise<void>

  constructor(serverless: Serverless, options: Serverless.Options) {
    this.serverless = serverless
    this.options = options
    this.provider = this.serverless.getProvider(constants.providerName)

    this.monitorDeployment = monitorDeployment.bind(this)
    this.validateAndSetDefaults = validateAndSetDefaults.bind(this)
    this.setDeploymentBucketName = setDeploymentBucketName.bind(this)
    this.emptyDeploymentBucket = emptyDeploymentBucket.bind(this)
    this.getObjectsToRemove = getObjectsToRemove.bind(this)
    this.removeObjects = removeObjects.bind(this)
    this.removeDeployment = removeDeployment.bind(this)

    this.hooks = {
      'before:remove:remove': async () => {
        this.validateAndSetDefaults()
        this.setDeploymentBucketName()
      },
      'remove:remove': async () => {
        await this.emptyDeploymentBucket()
        return this.removeDeployment()
      },
    }
  }
}
