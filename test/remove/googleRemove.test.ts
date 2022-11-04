'use strict'

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../provider/googleProvider')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GoogleRemo... Remove this comment to see the full error message
const GoogleRemove = require('./googleRemove')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../test/serverless')

describe('GoogleRemove', () => {
  let serverless
  let options
  let googleRemove

  beforeEach(() => {
    serverless = new Serverless()
    options = {
      stage: 'my-stage',
      region: 'my-region',
    }
    serverless.setProvider('google', new GoogleProvider(serverless))
    googleRemove = new GoogleRemove(serverless, options)
  })

  describe('#constructor()', () => {
    it('should set the serverless instance', () => {
      expect(googleRemove.serverless).toEqual(serverless)
    })

    it('should set options if provided', () => {
      expect(googleRemove.options).toEqual(options)
    })

    it('should make the provider accessible', () => {
      expect(googleRemove.provider).toBeInstanceOf(GoogleProvider)
    })

    describe('hooks', () => {
      let validateStub
      let setDefaultsStub
      let setDeploymentBucketNameStub
      let emptyDeploymentBucketStub
      let removeDeploymentStub

      beforeEach(() => {
        validateStub = sinon.stub(googleRemove, 'validate').returns(BbPromise.resolve())
        setDefaultsStub = sinon.stub(googleRemove, 'setDefaults').returns(BbPromise.resolve())
        setDeploymentBucketNameStub = sinon.stub(googleRemove, 'setDeploymentBucketName').returns(BbPromise.resolve())
        emptyDeploymentBucketStub = sinon.stub(googleRemove, 'emptyDeploymentBucket').returns(BbPromise.resolve())
        removeDeploymentStub = sinon.stub(googleRemove, 'removeDeployment').returns(BbPromise.resolve())
      })

      afterEach(() => {
        googleRemove.validate.restore()
        googleRemove.setDefaults.restore()
        googleRemove.setDeploymentBucketName.restore()
        googleRemove.emptyDeploymentBucket.restore()
        googleRemove.removeDeployment.restore()
      })

      it('should run "before:remove:remove" promise chain', () =>
        googleRemove.hooks['before:remove:remove']().then(() => {
          expect(validateStub.calledOnce).toEqual(true)
          expect(setDefaultsStub.calledAfter(validateStub)).toEqual(true)
          expect(setDeploymentBucketNameStub.calledAfter(setDefaultsStub)).toEqual(true)
        }))

      it('should run "remove:remove" promise chain', () =>
        googleRemove.hooks['remove:remove']().then(() => {
          expect(emptyDeploymentBucketStub.calledOnce).toEqual(true)
          expect(removeDeploymentStub.calledAfter(emptyDeploymentBucketStub)).toEqual(true)
        }))
    })
  })
})
