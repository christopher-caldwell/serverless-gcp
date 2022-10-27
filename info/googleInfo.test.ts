'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleInfo... Remove this comment to see the full error message
const GoogleInfo = require('./googleInfo')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../test/serverless')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('GoogleInfo', () => {
  let serverless
  let options
  let googleInfo

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    serverless = new Serverless()
    options = {
      stage: 'my-stage',
      region: 'my-region',
    }
    serverless.setProvider('google', new GoogleProvider(serverless))
    googleInfo = new GoogleInfo(serverless, options)
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#constructor()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the serverless instance', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleInfo.serverless).toEqual(serverless)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set options if provided', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleInfo.options).toEqual(options)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should make the provider accessible', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleInfo.provider).toBeInstanceOf(GoogleProvider)
    })

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('hooks', () => {
      let validateStub
      let setDefaultsStub
      let displayServiceInfoStub

      // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
      beforeEach(() => {
        validateStub = sinon.stub(googleInfo, 'validate').returns(BbPromise.resolve())
        setDefaultsStub = sinon.stub(googleInfo, 'setDefaults').returns(BbPromise.resolve())
        displayServiceInfoStub = sinon.stub(googleInfo, 'displayServiceInfo').returns(BbPromise.resolve())
      })

      // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
      afterEach(() => {
        googleInfo.validate.restore()
        googleInfo.setDefaults.restore()
        googleInfo.displayServiceInfo.restore()
      })

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('should run "before:info:info" promise chain', () =>
        googleInfo.hooks['before:info:info']().then(() => {
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(validateStub.calledOnce).toEqual(true)
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(setDefaultsStub.calledAfter(validateStub)).toEqual(true)
        }))

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('should run "deploy:deploy" promise chain', () =>
        googleInfo.hooks['deploy:deploy']().then(() => {
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(displayServiceInfoStub.calledOnce).toEqual(true)
        }))

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('should run "info:info" promise chain', () =>
        googleInfo.hooks['info:info']().then(() => {
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(displayServiceInfoStub.calledOnce).toEqual(true)
        }))
    })
  })
})
