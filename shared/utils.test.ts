'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'setDefault... Remove this comment to see the full error message
const setDefaults = require('./utils')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../test/serverless')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleComm... Remove this comment to see the full error message
const GoogleCommand = require('../test/googleCommand')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Utils', () => {
  let serverless
  let googleCommand

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    serverless = new Serverless()
    serverless.setProvider('google', new GoogleProvider(serverless))
    googleCommand = new GoogleCommand(serverless, {}, setDefaults)
    // mocking the standard value passed in from Serverless here
    googleCommand.serverless.service.provider = {
      region: 'us-east-1',
    }
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#setDefaults()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set default values for options if not provided', () =>
      googleCommand.setDefaults().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googleCommand.options.stage).toEqual('dev')
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googleCommand.options.region).toEqual('us-central1')
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googleCommand.options.runtime).toEqual('nodejs10')
      }))

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the options when they are provided', () => {
      googleCommand.options.stage = 'my-stage'
      googleCommand.options.region = 'my-region'
      googleCommand.options.runtime = 'nodejs6'

      return googleCommand.setDefaults().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googleCommand.options.stage).toEqual('my-stage')
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googleCommand.options.region).toEqual('my-region')
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googleCommand.options.runtime).toEqual('nodejs6')
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the provider values for stage and region if provided', () => {
      googleCommand.serverless.service.provider = {
        region: 'my-region',
        stage: 'my-stage',
      }

      return googleCommand.setDefaults().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googleCommand.options.region).toEqual('my-region')
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googleCommand.options.stage).toEqual('my-stage')
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('shoud default to the us-central1 region when no region is provided', () =>
      googleCommand.setDefaults().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googleCommand.options.region).toEqual('us-central1')
      }))
  })
})
