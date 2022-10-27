'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../../provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GooglePack... Remove this comment to see the full error message
const GooglePackage = require('../googlePackage')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../../test/serverless')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('PrepareDeployment', () => {
  let coreResources
  let serverless
  let googlePackage

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
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

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#prepareDeployment()', () => {
    let readFileSyncStub

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
      readFileSyncStub = sinon.stub(serverless.utils, 'readFileSync').returns(coreResources)
    })

    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
      serverless.utils.readFileSync.restore()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(readFileSyncStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(serverless.service.provider.compiledConfigurationTemplate).toEqual(expectedCompiledConfiguration)
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(readFileSyncStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(serverless.service.provider.compiledConfigurationTemplate).toEqual(expectedCompiledConfiguration)
      })
    })
  })
})
