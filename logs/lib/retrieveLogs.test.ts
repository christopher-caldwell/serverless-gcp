'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'chalk'.
const chalk = require('chalk')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../../provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleLogs... Remove this comment to see the full error message
const GoogleLogs = require('../googleLogs')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../../test/serverless')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('RetrieveLogs', () => {
  let serverless
  let googleLogs

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
    googleLogs = new GoogleLogs(serverless, options)
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#retrieveLogs()', () => {
    let getLogsStub
    let printLogsStub

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
      getLogsStub = sinon.stub(googleLogs, 'getLogs').returns(BbPromise.resolve())
      printLogsStub = sinon.stub(googleLogs, 'printLogs').returns(BbPromise.resolve())
    })

    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
      googleLogs.getLogs.restore()
      googleLogs.printLogs.restore()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should run promise chain', () =>
      googleLogs.retrieveLogs().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(getLogsStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(printLogsStub.calledAfter(getLogsStub))
      }))
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#getLogs()', () => {
    let requestStub

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
      requestStub = sinon.stub(googleLogs.provider, 'request').returns(BbPromise.resolve())
    })

    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
      googleLogs.provider.request.restore()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should return a default amount of logs for the function if the "count" option is not given', () => {
      googleLogs.options.function = 'func1'

      return googleLogs.getLogs().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(
          requestStub.calledWithExactly('logging', 'entries', 'list', {
            filter: 'resource.labels.function_name="full-function-name" AND NOT textPayload=""',
            orderBy: 'timestamp desc',
            resourceNames: ['projects/my-project'],
            pageSize: 10,
          }),
        ).toEqual(true)
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should return logs of the function if the "count" option is given', () => {
      googleLogs.options.function = 'func1'
      googleLogs.options.count = 100

      return googleLogs.getLogs().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(
          requestStub.calledWithExactly('logging', 'entries', 'list', {
            filter: 'resource.labels.function_name="full-function-name" AND NOT textPayload=""',
            orderBy: 'timestamp desc',
            resourceNames: ['projects/my-project'],
            pageSize: googleLogs.options.count,
          }),
        ).toEqual(true)
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should parse the "count" option as an integer', () => {
      googleLogs.options.function = 'func1'
      googleLogs.options.count = '100'

      return googleLogs.getLogs().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(
          requestStub.calledWithExactly('logging', 'entries', 'list', {
            filter: 'resource.labels.function_name="full-function-name" AND NOT textPayload=""',
            orderBy: 'timestamp desc',
            resourceNames: ['projects/my-project'],
            pageSize: parseInt(googleLogs.options.count, 10),
          }),
        ).toEqual(true)
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should throw an error if the function could not be found in the service', () => {
      googleLogs.options.function = 'missingFunc'

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => googleLogs.getLogs()).toThrow(Error)
    })
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#printLogs()', () => {
    let consoleLogStub

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
      consoleLogStub = sinon.stub(googleLogs.serverless.cli, 'log').returns()
    })

    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
      googleLogs.serverless.cli.log.restore()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should print the received execution result log on the console', () => {
      const logs = {
        entries: [
          {
            timestamp: '1970-01-01 00:00',
            textPayload: 'Entry 1',
            labels: { execution_id: 'foo' },
          },
          {
            timestamp: '1970-01-01 00:01',
            textPayload: 'Entry 2',
            labels: { execution_id: 'bar' },
          },
        ],
      }

      const logEntry1 = `${chalk.grey('1970-01-01 00:00:')}\t[foo]\tEntry 1`
      const logEntry2 = `${chalk.grey('1970-01-01 00:01:')}\t[bar]\tEntry 2`
      const expectedOutput = `Displaying the 2 most recent log(s):\n\n${logEntry1}\n${logEntry2}`

      return googleLogs.printLogs(logs).then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledWithExactly(expectedOutput)).toEqual(true)
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should print a default message to the console when no logs were received', () => {
      const date = `${new Date().toISOString().slice(0, 10)}:`
      const logEntry = `${chalk.grey(date)}\tThere is no log data to show...`
      const expectedOutput = `Displaying the 1 most recent log(s):\n\n${logEntry}`

      return googleLogs.printLogs({}).then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledWithExactly(expectedOutput)).toEqual(true)
      })
    })
  })
})
