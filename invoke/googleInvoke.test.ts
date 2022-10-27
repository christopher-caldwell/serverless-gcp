'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleInvo... Remove this comment to see the full error message
const GoogleInvoke = require('./googleInvoke')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../test/serverless')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('GoogleInvoke', () => {
  let serverless
  let options
  let googleInvoke

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    serverless = new Serverless()
    options = {
      stage: 'my-stage',
      region: 'my-region',
    }
    serverless.setProvider('google', new GoogleProvider(serverless))
    googleInvoke = new GoogleInvoke(serverless, options)
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#constructor()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the serverless instance', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleInvoke.serverless).toEqual(serverless)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set options if provided', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleInvoke.options).toEqual(options)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should make the provider accessible', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleInvoke.provider).toBeInstanceOf(GoogleProvider)
    })

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('hooks', () => {
      let validateStub
      let setDefaultsStub
      let invokeFunctionStub

      // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
      beforeEach(() => {
        validateStub = sinon.stub(googleInvoke, 'validate').returns(BbPromise.resolve())
        setDefaultsStub = sinon.stub(googleInvoke, 'setDefaults').returns(BbPromise.resolve())
        invokeFunctionStub = sinon.stub(googleInvoke, 'invokeFunction').returns(BbPromise.resolve())
      })

      // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
      afterEach(() => {
        googleInvoke.validate.restore()
        googleInvoke.setDefaults.restore()
        googleInvoke.invokeFunction.restore()
      })

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('should run "before:invoke:invoke" promise chain', () =>
        googleInvoke.hooks['before:invoke:invoke']().then(() => {
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(validateStub.calledOnce).toEqual(true)
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(setDefaultsStub.calledAfter(validateStub)).toEqual(true)
        }))

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('should run "invoke:invoke" promise chain', () =>
        googleInvoke.hooks['invoke:invoke']().then(() => {
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(invokeFunctionStub.calledOnce).toEqual(true)
        }))
    })
  })
})
