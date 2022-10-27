'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
const path = require('path')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../../provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleInvo... Remove this comment to see the full error message
const GoogleInvokeLocal = require('../googleInvokeLocal')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../../test/serverless')

// @ts-expect-error TS(2304): Cannot find name 'jest'.
jest.spyOn(console, 'log')
// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('invokeLocalNodeJs', () => {
  const myVarValue = 'MY_VAR_VALUE'
  let serverless
  let googleInvokeLocal

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    serverless = new Serverless()
    serverless.setProvider('google', new GoogleProvider(serverless))
    serverless.service.provider.environment = {
      MY_VAR: myVarValue,
    }
    serverless.serviceDir = path.join(process.cwd(), 'invokeLocal', 'lib', 'testMocks') // To load the index.js of the mock folder
    // @ts-expect-error TS(2304): Cannot find name 'jest'.
    serverless.cli.consoleLog = jest.fn()
    googleInvokeLocal = new GoogleInvokeLocal(serverless, {})
  })
  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('event', () => {
    const eventName = 'eventName'
    const contextName = 'contextName'
    const event = {
      name: eventName,
    }
    const context = {
      name: contextName,
    }
    const baseConfig = {
      events: [{ event: {} }],
    }
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should invoke a sync handler', async () => {
      const functionConfig = {
        ...baseConfig,
        handler: 'eventSyncHandler',
      }
      await googleInvokeLocal.invokeLocalNodeJs(functionConfig, event, context)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith('EVENT_SYNC_HANDLER')
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(serverless.cli.consoleLog).toHaveBeenCalledWith(`{\n    "result": "${eventName}"\n}`)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should handle errors in a sync handler', async () => {
      const functionConfig = {
        ...baseConfig,
        handler: 'eventSyncHandlerWithError',
      }
      await googleInvokeLocal.invokeLocalNodeJs(functionConfig, event, context)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith('EVENT_SYNC_HANDLER')
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(serverless.cli.consoleLog).toHaveBeenCalledWith(expect.stringContaining('"errorMessage": "SYNC_ERROR"'))
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should invoke an async handler', async () => {
      const functionConfig = {
        ...baseConfig,
        handler: 'eventAsyncHandler',
      }
      await googleInvokeLocal.invokeLocalNodeJs(functionConfig, event, context)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith('EVENT_ASYNC_HANDLER')
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(serverless.cli.consoleLog).toHaveBeenCalledWith(`{\n    "result": "${contextName}"\n}`)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should handle errors in an async handler', async () => {
      const functionConfig = {
        ...baseConfig,
        handler: 'eventAsyncHandlerWithError',
      }
      await googleInvokeLocal.invokeLocalNodeJs(functionConfig, event, context)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith('EVENT_ASYNC_HANDLER')
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(serverless.cli.consoleLog).toHaveBeenCalledWith(expect.stringContaining('"errorMessage": "ASYNC_ERROR"'))
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should give the environment variables to the handler', async () => {
      const functionConfig = {
        ...baseConfig,
        handler: 'eventEnvHandler',
      }
      await googleInvokeLocal.invokeLocalNodeJs(functionConfig, event, context)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith(myVarValue)
    })
  })
  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('http', () => {
    const message = 'httpBodyMessage'
    const req = {
      body: { message },
    }
    const context = {}
    const baseConfig = {
      events: [{ http: '' }],
    }
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should invoke a sync handler', async () => {
      const functionConfig = {
        ...baseConfig,
        handler: 'httpSyncHandler',
      }
      await googleInvokeLocal.invokeLocalNodeJs(functionConfig, req, context)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith('HTTP_SYNC_HANDLER')
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(serverless.cli.consoleLog).toHaveBeenCalledWith(
        JSON.stringify(
          {
            status: 200,
            headers: {
              'x-test': 'headerValue',
              'content-type': 'application/json; charset=utf-8',
              'content-length': '37',
              etag: 'W/"25-F1uWAIMs2TbWZIN1zJauHXahSdU"',
            },
            body: { responseMessage: message },
          },
          null,
          4,
        ),
      )
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should handle errors in a sync handler', async () => {
      const functionConfig = {
        ...baseConfig,
        handler: 'httpSyncHandlerWithError',
      }
      await googleInvokeLocal.invokeLocalNodeJs(functionConfig, req, context)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith('HTTP_SYNC_HANDLER')
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(serverless.cli.consoleLog).toHaveBeenCalledWith(expect.stringContaining('"errorMessage": "SYNC_ERROR"'))
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should invoke an async handler', async () => {
      const functionConfig = {
        ...baseConfig,
        handler: 'httpAsyncHandler',
      }
      await googleInvokeLocal.invokeLocalNodeJs(functionConfig, req, context)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith('HTTP_ASYNC_HANDLER')
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(serverless.cli.consoleLog).toHaveBeenCalledWith(JSON.stringify({ status: 404, headers: {} }, null, 4))
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should handle errors in an async handler', async () => {
      const functionConfig = {
        ...baseConfig,
        handler: 'httpAsyncHandlerWithError',
      }
      await googleInvokeLocal.invokeLocalNodeJs(functionConfig, req, context)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith('HTTP_ASYNC_HANDLER')
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(serverless.cli.consoleLog).toHaveBeenCalledWith(expect.stringContaining('"errorMessage": "ASYNC_ERROR"'))
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should give the environment variables to the handler', async () => {
      const functionConfig = {
        ...baseConfig,
        handler: 'httpEnvHandler',
      }
      await googleInvokeLocal.invokeLocalNodeJs(functionConfig, req, context)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith(myVarValue)
    })
  })
})
