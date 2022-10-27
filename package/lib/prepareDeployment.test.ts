'use strict'

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../../provider/googleProvider')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GooglePack... Remove this comment to see the full error message
const GooglePackage = require('../googlePackage')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../../test/serverless')

describe('PrepareDeployment', () => {
  let coreResources
  let serverless
  let googlePackage

  beforeEach(() => {
    coreResources = {
      resources: [
        {
          type: 'storage.v1.bucket',
          name: 'will-be-replaced-by-serverless',
        },
      ],
    }
    serverless = new Serverless()
    serverless.service.service = 'my-service'
    serverless.service.provider = {
      compiledConfigurationTemplate: coreResources,
      deploymentBucketName: 'sls-my-service-dev-12345678',
    }
    serverless.setProvider('google', new GoogleProvider(serverless))
    const options = {
      stage: 'dev',
      region: 'us-central1',
    }
    googlePackage = new GooglePackage(serverless, options)
  })

  describe('#prepareDeployment()', () => {
    let readFileSyncStub

    beforeEach(() => {
      readFileSyncStub = sinon.stub(serverless.utils, 'readFileSync').returns(coreResources)
    })

    afterEach(() => {
      serverless.utils.readFileSync.restore()
    })

    it('should load the core configuration template into the serverless instance', () => {
      const expectedCompiledConfiguration = {
        resources: [
          {
            type: 'storage.v1.bucket',
            name: 'sls-my-service-dev-12345678',
          },
        ],
      }

      return googlePackage.prepareDeployment().then(() => {
        expect(readFileSyncStub.calledOnce).toEqual(true)
        expect(serverless.service.provider.compiledConfigurationTemplate).toEqual(expectedCompiledConfiguration)
      })
    })

    it('should use the configured location', () => {
      serverless.service.provider.region = 'europe-west1'

      const expectedCompiledConfiguration = {
        resources: [
          {
            type: 'storage.v1.bucket',
            name: 'sls-my-service-dev-12345678',
            properties: {
              location: 'europe-west1',
            },
          },
        ],
      }

      return googlePackage.prepareDeployment().then(() => {
        expect(readFileSyncStub.calledOnce).toEqual(true)
        expect(serverless.service.provider.compiledConfigurationTemplate).toEqual(expectedCompiledConfiguration)
      })
    })
  })
})
