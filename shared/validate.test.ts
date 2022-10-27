'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'validate'.
const validate = require('./validate')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../test/serverless')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleComm... Remove this comment to see the full error message
const GoogleCommand = require('../test/googleCommand')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Validate', () => {
  let serverless
  let googleCommand

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    serverless = new Serverless()
    serverless.config = {
      servicePath: true,
    }
    serverless.service = {
      service: 'some-default-service',
    }
    serverless.setProvider('google', new GoogleProvider(serverless))
    googleCommand = new GoogleCommand(serverless, {}, validate)
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#validate()', () => {
    let validateServicePathStub
    let validateServiceNameStub
    let validateHandlersStub

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
      validateServicePathStub = sinon.stub(googleCommand, 'validateServicePath').returns(BbPromise.resolve())
      validateServiceNameStub = sinon.stub(googleCommand, 'validateServiceName').returns(BbPromise.resolve())
      validateHandlersStub = sinon.stub(googleCommand, 'validateHandlers').returns(BbPromise.resolve())
    })

    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
      googleCommand.validateServicePath.restore()
      googleCommand.validateServiceName.restore()
      googleCommand.validateHandlers.restore()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should run promise chain', () =>
      googleCommand.validate().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(validateServicePathStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(validateServiceNameStub.calledAfter(validateServicePathStub))
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(validateHandlersStub.calledAfter(validateServiceNameStub))
      }))
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#validateServicePath()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should throw an error if not inside service', () => {
      serverless.config.servicePath = false

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => googleCommand.validateServicePath()).toThrow(Error)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should not throw an error if inside service', () => {
      serverless.config.servicePath = true

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => googleCommand.validateServicePath()).not.toThrow(Error)
    })
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#validateServiceName()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should throw an error if the service name contains the string "goog"', () => {
      serverless.service.service = 'service-name-with-goog-in-it'

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => googleCommand.validateServiceName()).toThrow(Error)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should throw an error if the service name contains underscores', () => {
      serverless.service.service = 'service_name'

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => googleCommand.validateServiceName()).toThrow(Error)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should not throw an error if the service name is valid', () => {
      serverless.service.service = 'service-name'

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => googleCommand.validateServiceName()).not.toThrow(Error)
    })
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#validateHandlers()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should throw an error if the handler name contains an invalid character', () => {
      googleCommand.serverless.service.functions = {
        foo: {
          handler: 'invalid.handler',
        },
        bar: {
          handler: 'invalid/handler',
        },
      }

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => googleCommand.validateHandlers()).toThrow(Error)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should not throw an error if the function handler is valid', () => {
      googleCommand.serverless.service.functions = {
        foo: {
          handler: 'validHandler',
        },
      }

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => googleCommand.validateHandlers()).not.toThrow(Error)
    })
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#validateEventsProperty()', () => {
    const functionName = 'functionName'
    const eventEvent = {
      event: {},
    }
    const httpEvent = {
      http: {},
    }
    const unknownEvent = {
      unknown: {},
    }

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should throw if the configuration of function has no events', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => validate.validateEventsProperty({}, functionName)).toThrow()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should throw if the configuration of function has an empty events array', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => validate.validateEventsProperty({ events: [] }, functionName)).toThrow()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should throw if the configuration of function has more than one events', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => validate.validateEventsProperty({ events: [eventEvent, httpEvent] }, functionName)).toThrow()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should throw if the configuration of function has an unknown event', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => validate.validateEventsProperty({ events: [unknownEvent] }, functionName)).toThrow()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should pass if the configuration of function has an http event', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => validate.validateEventsProperty({ events: [httpEvent] }, functionName)).not.toThrow()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should pass if the configuration of function has an event event', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => validate.validateEventsProperty({ events: [eventEvent] }, functionName)).not.toThrow()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should throw if the configuration of function has an http event but http event is not supported', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => validate.validateEventsProperty({ events: [unknownEvent] }, functionName, ['event'])).toThrow()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should pass if the configuration of function has an event event and event is supported', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => validate.validateEventsProperty({ events: [eventEvent] }, functionName, ['event'])).not.toThrow()
    })
  })
})
