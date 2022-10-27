'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleLogs... Remove this comment to see the full error message
const GoogleLogs = require('./googleLogs')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../test/serverless')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('GoogleLogs', () => {
  let serverless
  let options
  let googleLogs

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    serverless = new Serverless()
    options = {
      stage: 'my-stage',
      region: 'my-region',
    }
    serverless.setProvider('google', new GoogleProvider(serverless))
    googleLogs = new GoogleLogs(serverless, options)
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#constructor()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the serverless instance', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleLogs.serverless).toEqual(serverless)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set options if provided', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleLogs.options).toEqual(options)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should make the provider accessible', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleLogs.provider).toBeInstanceOf(GoogleProvider)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should have the command "logs"', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleLogs.commands.logs).not.toEqual(undefined)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should have the lifecycle event "logs" for the "logs" command', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleLogs.commands.logs.lifecycleEvents).toEqual(['logs'])
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should have the option "count" with the "c" shortcut', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleLogs.commands.logs.options.count).not.toEqual(undefined)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleLogs.commands.logs.options.count.shortcut).toEqual('c')
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should have the option "count"', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleLogs.commands.logs.options.count).not.toEqual(undefined)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should have the option "count" with type "string"', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleLogs.commands.logs.options.count.type).toEqual('string')
    })

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('hooks', () => {
      let validateStub
      let setDefaultsStub
      let retrieveLogsStub

      // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
      beforeEach(() => {
        validateStub = sinon.stub(googleLogs, 'validate').returns(BbPromise.resolve())
        setDefaultsStub = sinon.stub(googleLogs, 'setDefaults').returns(BbPromise.resolve())
        retrieveLogsStub = sinon.stub(googleLogs, 'retrieveLogs').returns(BbPromise.resolve())
      })

      // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
      afterEach(() => {
        googleLogs.validate.restore()
        googleLogs.setDefaults.restore()
        googleLogs.retrieveLogs.restore()
      })

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('should run "before:logs:logs" promise chain', () =>
        googleLogs.hooks['before:logs:logs']().then(() => {
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(validateStub.calledOnce).toEqual(true)
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(setDefaultsStub.calledAfter(validateStub)).toEqual(true)
        }))

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('should run "logs:logs" promise chain', () =>
        googleLogs.hooks['logs:logs']().then(() => {
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(retrieveLogsStub.calledOnce).toEqual(true)
        }))
    })
  })
})
