'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleDepl... Remove this comment to see the full error message
const GoogleDeploy = require('./googleDeploy')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../test/serverless')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('GoogleDeploy', () => {
  let serverless
  let options
  let googleDeploy

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    serverless = new Serverless()
    options = {
      stage: 'my-stage',
      region: 'my-region',
    }
    serverless.setProvider('google', new GoogleProvider(serverless))
    googleDeploy = new GoogleDeploy(serverless, options)
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#constructor()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the serverless instance', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleDeploy.serverless).toEqual(serverless)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set options if provided', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleDeploy.options).toEqual(options)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should make the provider accessible', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleDeploy.provider).toBeInstanceOf(GoogleProvider)
    })

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('hooks', () => {
      let validateStub
      let setDefaultsStub
      let createDeploymentStub
      let setDeploymentBucketNameStub
      let uploadArtifactsStub
      let updateDeploymentStub
      let cleanupDeploymentBucketStub

      // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
      beforeEach(() => {
        validateStub = sinon.stub(googleDeploy, 'validate').returns(BbPromise.resolve())
        setDefaultsStub = sinon.stub(googleDeploy, 'setDefaults').returns(BbPromise.resolve())
        createDeploymentStub = sinon.stub(googleDeploy, 'createDeployment').returns(BbPromise.resolve())
        setDeploymentBucketNameStub = sinon.stub(googleDeploy, 'setDeploymentBucketName').returns(BbPromise.resolve())
        uploadArtifactsStub = sinon.stub(googleDeploy, 'uploadArtifacts').returns(BbPromise.resolve())
        updateDeploymentStub = sinon.stub(googleDeploy, 'updateDeployment').returns(BbPromise.resolve())
        cleanupDeploymentBucketStub = sinon.stub(googleDeploy, 'cleanupDeploymentBucket').returns(BbPromise.resolve())
      })

      // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
      afterEach(() => {
        googleDeploy.validate.restore()
        googleDeploy.setDefaults.restore()
        googleDeploy.createDeployment.restore()
        googleDeploy.setDeploymentBucketName.restore()
        googleDeploy.uploadArtifacts.restore()
        googleDeploy.updateDeployment.restore()
        googleDeploy.cleanupDeploymentBucket.restore()
      })

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('should run "before:deploy:deploy" promise chain', () =>
        googleDeploy.hooks['before:deploy:deploy']().then(() => {
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(validateStub.calledOnce).toEqual(true)
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(setDefaultsStub.calledAfter(validateStub)).toEqual(true)
        }))

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('should run "deploy:deploy" promise chain', () =>
        googleDeploy.hooks['deploy:deploy']().then(() => {
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(createDeploymentStub.calledOnce).toEqual(true)
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(setDeploymentBucketNameStub.calledAfter(createDeploymentStub)).toEqual(true)
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(uploadArtifactsStub.calledAfter(createDeploymentStub)).toEqual(true)
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(updateDeploymentStub.calledAfter(uploadArtifactsStub)).toEqual(true)
        }))

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('should run "after:deploy:deploy" promise chain', () =>
        googleDeploy.hooks['after:deploy:deploy']().then(() => {
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(cleanupDeploymentBucketStub.calledOnce).toEqual(true)
        }))
    })
  })
})
