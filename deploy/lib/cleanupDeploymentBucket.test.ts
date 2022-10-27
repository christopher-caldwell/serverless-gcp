'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../../provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleDepl... Remove this comment to see the full error message
const GoogleDeploy = require('../googleDeploy')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../../test/serverless')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('CleanupDeploymentBucket', () => {
  let serverless
  let googleDeploy
  let key

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    serverless = new Serverless()
    serverless.service = {
      service: 'my-service',
      provider: {
        deploymentBucketName: 'sls-my-service-dev-12345678',
      },
    }
    serverless.setProvider('google', new GoogleProvider(serverless))
    const options = {
      stage: 'dev',
      region: 'us-central1',
    }
    googleDeploy = new GoogleDeploy(serverless, options)
    key = `serverless/${serverless.service.service}/${options.stage}`
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#cleanupDeploymentBucket()', () => {
    let getObjectsToRemoveStub
    let removeObjectsStub

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
      getObjectsToRemoveStub = sinon.stub(googleDeploy, 'getObjectsToRemove').returns(BbPromise.resolve())
      removeObjectsStub = sinon.stub(googleDeploy, 'removeObjects').returns(BbPromise.resolve())
    })

    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
      googleDeploy.getObjectsToRemove.restore()
      googleDeploy.removeObjects.restore()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should run promise chain', () =>
      googleDeploy.cleanupDeploymentBucket().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(getObjectsToRemoveStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(removeObjectsStub.calledAfter(getObjectsToRemoveStub))
      }))
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#getObjectsToRemove()', () => {
    let requestStub

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
      requestStub = sinon.stub(googleDeploy.provider, 'request')
    })

    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
      googleDeploy.provider.request.restore()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should return all to be removed objects (except the last 4)', () => {
      const response = {
        items: [
          {
            bucket: 'sls-my-service-dev-12345678',
            name: `${key}/151224711231-2016-08-18T15:42:00/artifact.zip`,
          },
          {
            bucket: 'sls-my-service-dev-12345678',
            name: `${key}/141264711231-2016-08-18T15:43:00/artifact.zip`,
          },
          {
            bucket: 'sls-my-service-dev-12345678',
            name: `${key}/141321321541-2016-08-18T11:23:02/artifact.zip`,
          },
          {
            bucket: 'sls-my-service-dev-12345678',
            name: `${key}/142003031341-2016-08-18T12:46:04/artifact.zip`,
          },
          {
            bucket: 'sls-my-service-dev-12345678',
            name: `${key}/113304333331-2016-08-18T13:40:06/artifact.zip`,
          },
          {
            bucket: 'sls-my-service-dev-12345678',
            name: `${key}/903940390431-2016-08-18T23:42:08/artifact.zip`,
          },
        ],
      }
      requestStub.returns(BbPromise.resolve(response))

      return googleDeploy.getObjectsToRemove().then((objects) => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(objects.length).toEqual(2)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(objects).not.toContainEqual({
          bucket: 'sls-my-service-dev-12345678',
          name: `${key}/141321321541-2016-08-18T11:23:02/artifact.zip`,
        })
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(objects).not.toContainEqual({
          bucket: 'sls-my-service-dev-12345678',
          name: `${key}/142003031341-2016-08-18T12:46:04/artifact.zip`,
        })
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(objects).not.toContainEqual({
          bucket: 'sls-my-service-dev-12345678',
          name: `${key}/151224711231-2016-08-18T15:42:00/artifact.zip`,
        })
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(objects).not.toContainEqual({
          bucket: 'sls-my-service-dev-12345678',
          name: `${key}/903940390431-2016-08-18T23:42:08/artifact.zip`,
        })
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(
          requestStub.calledWithExactly('storage', 'objects', 'list', {
            bucket: 'sls-my-service-dev-12345678',
          }),
        ).toEqual(true)
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should return an empty array if there are no objects which should be removed', () => {
      const response = {
        items: [
          {
            bucket: 'sls-my-service-dev-12345678',
            name: `${key}/151224711231-2016-08-18T15:42:00/artifact.zip`,
          },
          {
            bucket: 'sls-my-service-dev-12345678',
            name: `${key}/141264711231-2016-08-18T15:43:00/artifact.zip`,
          },
          {
            bucket: 'sls-my-service-dev-12345678',
            name: `${key}/141321321541-2016-08-18T11:23:02/artifact.zip`,
          },
          {
            bucket: 'sls-my-service-dev-12345678',
            name: `${key}/142003031341-2016-08-18T12:46:04/artifact.zip`,
          },
        ],
      }
      requestStub.returns(BbPromise.resolve(response))

      return googleDeploy.getObjectsToRemove().then((objects) => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(objects.length).toEqual(0)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(objects).toEqual([])
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(
          requestStub.calledWithExactly('storage', 'objects', 'list', {
            bucket: 'sls-my-service-dev-12345678',
          }),
        ).toEqual(true)
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should return an empty array if no objects are returned', () => {
      const response = {
        items: [],
      }
      requestStub.returns(BbPromise.resolve(response))

      return googleDeploy.getObjectsToRemove().then((objects) => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(objects.length).toEqual(0)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(objects).toEqual([])
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(
          requestStub.calledWithExactly('storage', 'objects', 'list', {
            bucket: 'sls-my-service-dev-12345678',
          }),
        ).toEqual(true)
      })
    })
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#removeObjects()', () => {
    let requestStub
    let consoleLogStub

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
      requestStub = sinon.stub(googleDeploy.provider, 'request')
      consoleLogStub = sinon.stub(googleDeploy.serverless.cli, 'log').returns()
    })

    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
      googleDeploy.provider.request.restore()
      googleDeploy.serverless.cli.log.restore()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should resolve if no objects should be removed', () => {
      const objectsToRemove = []

      return googleDeploy.removeObjects(objectsToRemove).then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(requestStub.calledOnce).toEqual(false)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledOnce).toEqual(false)
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should remove all given objects', () => {
      const objectsToRemove = [
        {
          bucket: 'sls-my-service-dev-12345678',
          name: `${key}/151224711231-2016-08-18T15:42:00/artifact.zip`,
        },
        {
          bucket: 'sls-my-service-dev-12345678',
          name: `${key}/141264711231-2016-08-18T15:43:00/artifact.zip`,
        },
        {
          bucket: 'sls-my-service-dev-12345678',
          name: `${key}/141321321541-2016-08-18T11:23:02/artifact.zip`,
        },
        {
          bucket: 'sls-my-service-dev-12345678',
          name: `${key}/142003031341-2016-08-18T12:46:04/artifact.zip`,
        },
      ]

      requestStub.returns(BbPromise.resolve('removePromise'))

      return googleDeploy.removeObjects(objectsToRemove).then((removePromises) => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(requestStub.called).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(removePromises).toEqual(['removePromise', 'removePromise', 'removePromise', 'removePromise'])
      })
    })
  })
})
