'use strict'

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'setDeploym... Remove this comment to see the full error message
const setDeploymentBucketName = require('./setDeploymentBucketName')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../provider/googleProvider')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../test/serverless')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GoogleComm... Remove this comment to see the full error message
const GoogleCommand = require('../test/googleCommand')

describe('SetDeploymentBucketName', () => {
  let serverless
  let googleCommand
  let requestStub

  beforeEach(() => {
    serverless = new Serverless()
    serverless.service = {
      service: 'my-service',
    }
    serverless.service.provider = {
      project: 'my-project',
    }
    const options = {
      stage: 'dev',
      region: 'us-central1',
    }
    serverless.setProvider('google', new GoogleProvider(serverless))
    googleCommand = new GoogleCommand(serverless, options, setDeploymentBucketName)
    requestStub = sinon.stub(googleCommand.provider, 'request')
  })

  afterEach(() => {
    googleCommand.provider.request.restore()
  })

  describe('#setDeploymentBucketName()', () => {
    it('should set the name if the deployment request errors out', () => {
      requestStub.returns(BbPromise.reject())

      return googleCommand.setDeploymentBucketName().then(() => {
        expect(serverless.service.provider.deploymentBucketName).toMatch(/sls-my-service-dev-.+/)
        expect(
          requestStub.calledWithExactly('deploymentmanager', 'resources', 'list', {
            project: 'my-project',
            deployment: 'sls-my-service-dev',
          }),
        ).toEqual(true)
      })
    })

    it('should set the name if a deployment is not present', () => {
      const response = {}
      requestStub.returns(BbPromise.resolve(response))

      return googleCommand.setDeploymentBucketName().then(() => {
        expect(serverless.service.provider.deploymentBucketName).toMatch(/sls-my-service-dev-.+/)
        expect(
          requestStub.calledWithExactly('deploymentmanager', 'resources', 'list', {
            project: 'my-project',
            deployment: 'sls-my-service-dev',
          }),
        ).toEqual(true)
      })
    })

    it('should set the bucket name with the one of the deployment if exists', () => {
      const response = {
        resources: [
          { type: 'some-other-type', name: 'some-other-resource' },
          { type: 'storage.v1.bucket', name: 'some-bucket' },
          { type: 'storage.v1.bucket', name: 'sls-my-service-dev-12345678' },
        ],
      }
      requestStub.returns(BbPromise.resolve(response))

      return googleCommand.setDeploymentBucketName().then(() => {
        expect(serverless.service.provider.deploymentBucketName).toEqual('sls-my-service-dev-12345678')
        expect(
          requestStub.calledWithExactly('deploymentmanager', 'resources', 'list', {
            project: 'my-project',
            deployment: 'sls-my-service-dev',
          }),
        ).toEqual(true)
      })
    })
  })
})
