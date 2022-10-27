'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../../provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleRemo... Remove this comment to see the full error message
const GoogleRemove = require('../googleRemove')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../../test/serverless')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('EmptyDeploymentBucket', () => {
  let serverless
  let googleRemove
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
    googleRemove = new GoogleRemove(serverless, options)
    key = `serverless/${serverless.service.service}/${options.stage}`
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#emptyDeploymentBucket()', () => {
    let getObjectsToRemoveStub
    let removeObjectsStub

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
      getObjectsToRemoveStub = sinon.stub(googleRemove, 'getObjectsToRemove').returns(BbPromise.resolve())
      removeObjectsStub = sinon.stub(googleRemove, 'removeObjects').returns(BbPromise.resolve())
    })

    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
      googleRemove.getObjectsToRemove.restore()
      googleRemove.removeObjects.restore()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should run promise chain', () =>
      googleRemove.emptyDeploymentBucket().then(() => {
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
      requestStub = sinon.stub(googleRemove.provider, 'request')
    })

    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
      googleRemove.provider.request.restore()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should resolve if there are no objects in the deployment bucket', () => {
      const response = {
        items: [],
      }
      requestStub.returns(BbPromise.resolve(response))

      return googleRemove.getObjectsToRemove().then((objects) => {
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
    it('should return all the objects in the deployment bucket', () => {
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
        ],
      }
      requestStub.returns(BbPromise.resolve(response))

      return googleRemove.getObjectsToRemove().then((objects) => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(objects.length).toEqual(2)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(objects).toContainEqual({
          bucket: 'sls-my-service-dev-12345678',
          name: `${key}/151224711231-2016-08-18T15:42:00/artifact.zip`,
        })
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(objects).toContainEqual({
          bucket: 'sls-my-service-dev-12345678',
          name: `${key}/141264711231-2016-08-18T15:43:00/artifact.zip`,
        })
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
      requestStub = sinon.stub(googleRemove.provider, 'request')
      consoleLogStub = sinon.stub(googleRemove.serverless.cli, 'log').returns()
    })

    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
      googleRemove.provider.request.restore()
      googleRemove.serverless.cli.log.restore()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should resolve if no objects should be removed', () => {
      const objectsToRemove = []

      return googleRemove.removeObjects(objectsToRemove).then(() => {
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
      ]

      requestStub.returns(BbPromise.resolve('removePromise'))

      return googleRemove.removeObjects(objectsToRemove).then((removePromises) => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(requestStub.called).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(removePromises).toEqual(['removePromise', 'removePromise'])
      })
    })
  })
})
