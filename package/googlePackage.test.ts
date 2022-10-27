'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GooglePack... Remove this comment to see the full error message
const GooglePackage = require('./googlePackage')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../test/serverless')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('GooglePackage', () => {
  let serverless
  let options
  let googlePackage

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    serverless = new Serverless()
    options = {
      stage: 'my-stage',
      region: 'my-region',
    }
    serverless.setProvider('google', new GoogleProvider(serverless))
    googlePackage = new GooglePackage(serverless, options)
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#constructor()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the serverless instance', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googlePackage.serverless).toEqual(serverless)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set options if provided', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googlePackage.options).toEqual(options)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should make the provider accessible', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googlePackage.provider).toBeInstanceOf(GoogleProvider)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should define the schema of the http triggered function', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(serverless.configSchemaHandler.defineFunctionEvent).toHaveBeenCalledWith(
        'google',
        'http',
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect.any(Object),
      )
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should define the schema of the event triggered function', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(serverless.configSchemaHandler.defineFunctionEvent).toHaveBeenCalledWith(
        'google',
        'event',
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect.any(Object),
      )
    })

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('hooks', () => {
      let cleanupServerlessDirStub
      let validateStub
      let setDefaultsStub
      let setDeploymentBucketNameStub
      let prepareDeploymentStub
      let saveCreateTemplateFileStub
      let generateArtifactDirectoryNameStub
      let compileFunctionsStub
      let mergeServiceResourcesStub
      let saveUpdateTemplateFileStub

      // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
      beforeEach(() => {
        cleanupServerlessDirStub = sinon.stub(googlePackage, 'cleanupServerlessDir').returns(BbPromise.resolve())
        validateStub = sinon.stub(googlePackage, 'validate').returns(BbPromise.resolve())
        setDefaultsStub = sinon.stub(googlePackage, 'setDefaults').returns(BbPromise.resolve())
        setDeploymentBucketNameStub = sinon.stub(googlePackage, 'setDeploymentBucketName').returns(BbPromise.resolve())
        prepareDeploymentStub = sinon.stub(googlePackage, 'prepareDeployment').returns(BbPromise.resolve())
        saveCreateTemplateFileStub = sinon.stub(googlePackage, 'saveCreateTemplateFile').returns(BbPromise.resolve())
        generateArtifactDirectoryNameStub = sinon
          .stub(googlePackage, 'generateArtifactDirectoryName')
          .returns(BbPromise.resolve())
        compileFunctionsStub = sinon.stub(googlePackage, 'compileFunctions').returns(BbPromise.resolve())
        mergeServiceResourcesStub = sinon.stub(googlePackage, 'mergeServiceResources').returns(BbPromise.resolve())
        saveUpdateTemplateFileStub = sinon.stub(googlePackage, 'saveUpdateTemplateFile').returns(BbPromise.resolve())
      })

      // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
      afterEach(() => {
        googlePackage.cleanupServerlessDir.restore()
        googlePackage.validate.restore()
        googlePackage.setDefaults.restore()
        googlePackage.setDeploymentBucketName.restore()
        googlePackage.prepareDeployment.restore()
        googlePackage.saveCreateTemplateFile.restore()
        googlePackage.generateArtifactDirectoryName.restore()
        googlePackage.compileFunctions.restore()
        googlePackage.mergeServiceResources.restore()
        googlePackage.saveUpdateTemplateFile.restore()
      })

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('should run "package:cleanup" promise chain', () =>
        googlePackage.hooks['package:cleanup']().then(() => {
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(cleanupServerlessDirStub.calledOnce).toEqual(true)
        }))

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('should run "before:package:initialize" promise chain', () =>
        googlePackage.hooks['before:package:initialize']().then(() => {
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(validateStub.calledOnce).toEqual(true)
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(setDefaultsStub.calledAfter(validateStub)).toEqual(true)
        }))

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('should run "package:initialize" promise chain', () =>
        googlePackage.hooks['package:initialize']().then(() => {
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(setDeploymentBucketNameStub.calledOnce).toEqual(true)
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(prepareDeploymentStub.calledAfter(setDeploymentBucketNameStub)).toEqual(true)
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(saveCreateTemplateFileStub.calledAfter(prepareDeploymentStub)).toEqual(true)
        }))

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('should run "before:package:compileFunctions" promise chain', () =>
        googlePackage.hooks['before:package:compileFunctions']().then(() => {
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(generateArtifactDirectoryNameStub.calledOnce).toEqual(true)
        }))

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('should run "package:compileFunctions" promise chain', () =>
        googlePackage.hooks['package:compileFunctions']().then(() => {
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(compileFunctionsStub.calledOnce).toEqual(true)
        }))

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('should run "package:finalize" promise chain', () =>
        googlePackage.hooks['package:finalize']().then(() => {
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(mergeServiceResourcesStub.calledOnce).toEqual(true)
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(saveUpdateTemplateFileStub.calledAfter(mergeServiceResourcesStub)).toEqual(true)
        }))
    })
  })
})
