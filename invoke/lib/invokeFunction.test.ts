'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'chalk'.
const chalk = require('chalk')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../../provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleInvo... Remove this comment to see the full error message
const GoogleInvoke = require('../googleInvoke')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../../test/serverless')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('InvokeFunction', () => {
  let serverless
  let googleInvoke

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    serverless = new Serverless()
    serverless.service = {
      service: 'my-service',
    }
    serverless.service.provider = {
      project: 'my-project',
    }
    serverless.service.functions = {
      func1: {
        handler: 'foo',
        name: 'full-function-name',
      },
    }
    serverless.setProvider('google', new GoogleProvider(serverless))
    const options = {
      stage: 'dev',
      region: 'us-central1',
    }
    googleInvoke = new GoogleInvoke(serverless, options)
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#invokeFunction()', () => {
    let invokeStub
    let printResultStub

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
      invokeStub = sinon.stub(googleInvoke, 'invoke').returns(BbPromise.resolve())
      printResultStub = sinon.stub(googleInvoke, 'printResult').returns(BbPromise.resolve())
    })

    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
      googleInvoke.invoke.restore()
      googleInvoke.printResult.restore()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should run promise chain', () =>
      googleInvoke.invokeFunction().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(invokeStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(printResultStub.calledAfter(invokeStub))
      }))
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#invoke()', () => {
    let requestStub

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
      requestStub = sinon.stub(googleInvoke.provider, 'request').returns(BbPromise.resolve())
    })

    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
      googleInvoke.provider.request.restore()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should invoke the provided function without data option', () => {
      googleInvoke.options.function = 'func1'

      return googleInvoke.invoke().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(
          requestStub.calledWithExactly('cloudfunctions', 'projects', 'locations', 'functions', 'call', {
            name: 'projects/my-project/locations/us-central1/functions/full-function-name',
            resource: {
              data: '',
            },
          }),
        ).toEqual(true)
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should invoke the provided function with the data option', () => {
      googleInvoke.options.function = 'func1'
      googleInvoke.options.data = '{ "some": "json" }'

      return googleInvoke.invoke().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(
          requestStub.calledWithExactly('cloudfunctions', 'projects', 'locations', 'functions', 'call', {
            name: 'projects/my-project/locations/us-central1/functions/full-function-name',
            resource: {
              data: googleInvoke.options.data,
            },
          }),
        ).toEqual(true)
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should throw an error if the function could not be found in the service', () => {
      googleInvoke.options.function = 'missingFunc'

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => googleInvoke.invoke()).toThrow(Error)
    })
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#printResult()', () => {
    let consoleLogStub

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
      consoleLogStub = sinon.stub(googleInvoke.serverless.cli, 'log').returns()
    })

    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
      googleInvoke.serverless.cli.log.restore()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should print the received execution result on the console', () => {
      const result = {
        executionId: 'wasdqwerty',
        result: 'Foo bar',
      }

      const expectedOutput = `${chalk.grey('wasdqwerty')} Foo bar`

      return googleInvoke.printResult(result).then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledWithExactly(expectedOutput)).toEqual(true)
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should print an error message to the console when no result was received', () => {
      const result = {}

      const expectedOutput = `${chalk.grey('error')} An error occurred while executing your function...`

      return googleInvoke.printResult(result).then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledWithExactly(expectedOutput)).toEqual(true)
      })
    })
  })
})
