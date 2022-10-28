'use strict'

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../provider/googleProvider')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GoogleInvo... Remove this comment to see the full error message
const GoogleInvoke = require('./googleInvoke')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../test/serverless')

describe('GoogleInvoke', () => {
  let serverless
  let options
  let googleInvoke

  beforeEach(() => {
    serverless = new Serverless()
    options = {
      stage: 'my-stage',
      region: 'my-region',
    }
    serverless.setProvider('google', new GoogleProvider(serverless))
    googleInvoke = new GoogleInvoke(serverless, options)
  })

  describe('#constructor()', () => {
    it('should set the serverless instance', () => {
      expect(googleInvoke.serverless).toEqual(serverless)
    })

    it('should set options if provided', () => {
      expect(googleInvoke.options).toEqual(options)
    })

    it('should make the provider accessible', () => {
      expect(googleInvoke.provider).toBeInstanceOf(GoogleProvider)
    })

    describe('hooks', () => {
      let validateStub
      let setDefaultsStub
      let invokeFunctionStub

      beforeEach(() => {
        validateStub = sinon.stub(googleInvoke, 'validate').returns(BbPromise.resolve())
        setDefaultsStub = sinon.stub(googleInvoke, 'setDefaults').returns(BbPromise.resolve())
        invokeFunctionStub = sinon.stub(googleInvoke, 'invokeFunction').returns(BbPromise.resolve())
      })

      afterEach(() => {
        googleInvoke.validate.restore()
        googleInvoke.setDefaults.restore()
        googleInvoke.invokeFunction.restore()
      })

      it('should run "before:invoke:invoke" promise chain', () =>
        googleInvoke.hooks['before:invoke:invoke']().then(() => {
          expect(validateStub.calledOnce).toEqual(true)
          expect(setDefaultsStub.calledAfter(validateStub)).toEqual(true)
        }))

      it('should run "invoke:invoke" promise chain', () =>
        googleInvoke.hooks['invoke:invoke']().then(() => {
          expect(invokeFunctionStub.calledOnce).toEqual(true)
        }))
    })
  })
})
