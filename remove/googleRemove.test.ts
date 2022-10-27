'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleRemo... Remove this comment to see the full error message
const GoogleRemove = require('./googleRemove')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../test/serverless')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('GoogleRemove', () => {
  let serverless
  let options
  let googleRemove

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    serverless = new Serverless()
    options = {
      stage: 'my-stage',
      region: 'my-region',
    }
    serverless.setProvider('google', new GoogleProvider(serverless))
    googleRemove = new GoogleRemove(serverless, options)
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#constructor()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the serverless instance', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleRemove.serverless).toEqual(serverless)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set options if provided', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleRemove.options).toEqual(options)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should make the provider accessible', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleRemove.provider).toBeInstanceOf(GoogleProvider)
    })

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('hooks', () => {
      let validateStub
      let setDefaultsStub
      let setDeploymentBucketNameStub
      let emptyDeploymentBucketStub
      let removeDeploymentStub

      // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
      beforeEach(() => {
        validateStub = sinon.stub(googleRemove, 'validate').returns(BbPromise.resolve())
        setDefaultsStub = sinon.stub(googleRemove, 'setDefaults').returns(BbPromise.resolve())
        setDeploymentBucketNameStub = sinon.stub(googleRemove, 'setDeploymentBucketName').returns(BbPromise.resolve())
        emptyDeploymentBucketStub = sinon.stub(googleRemove, 'emptyDeploymentBucket').returns(BbPromise.resolve())
        removeDeploymentStub = sinon.stub(googleRemove, 'removeDeployment').returns(BbPromise.resolve())
      })

      // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
      afterEach(() => {
        googleRemove.validate.restore()
        googleRemove.setDefaults.restore()
        googleRemove.setDeploymentBucketName.restore()
        googleRemove.emptyDeploymentBucket.restore()
        googleRemove.removeDeployment.restore()
      })

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('should run "before:remove:remove" promise chain', () =>
        googleRemove.hooks['before:remove:remove']().then(() => {
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(validateStub.calledOnce).toEqual(true)
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(setDefaultsStub.calledAfter(validateStub)).toEqual(true)
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(setDeploymentBucketNameStub.calledAfter(setDefaultsStub)).toEqual(true)
        }))

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('should run "remove:remove" promise chain', () =>
        googleRemove.hooks['remove:remove']().then(() => {
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(emptyDeploymentBucketStub.calledOnce).toEqual(true)
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(removeDeploymentStub.calledAfter(emptyDeploymentBucketStub)).toEqual(true)
        }))
    })
  })
})
