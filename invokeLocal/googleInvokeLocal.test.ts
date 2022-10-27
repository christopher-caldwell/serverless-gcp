'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleInvo... Remove this comment to see the full error message
const GoogleInvokeLocal = require('./googleInvokeLocal')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../test/serverless')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('GoogleInvokeLocal', () => {
  let serverless
  const functionName = 'myFunction'
  const rawOptions = {
    f: functionName,
  }
  const processedOptions = {
    function: functionName,
  }
  let googleInvokeLocal

  // @ts-expect-error TS(2304): Cannot find name 'beforeAll'.
  beforeAll(() => {
    serverless = new Serverless()
    serverless.setProvider('google', new GoogleProvider(serverless))
    googleInvokeLocal = new GoogleInvokeLocal(serverless, rawOptions)
    serverless.processedInput.options = processedOptions
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#constructor()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the serverless instance', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleInvokeLocal.serverless).toEqual(serverless)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the raw options if provided', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleInvokeLocal.options).toEqual(rawOptions)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should make the provider accessible', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleInvokeLocal.provider).toBeInstanceOf(GoogleProvider)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it.each`
      method
      ${'validate'}
      ${'setDefaults'}
      ${'getDataAndContext'}
      ${'invokeLocalNodeJs'}
      ${'loadFileInOption'}
      ${'validateEventsProperty'}
      ${'addEnvironmentVariablesToProcessEnv'}
    `('should declare $method method', ({ method }) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleInvokeLocal[method]).toBeDefined()
    })

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('hooks', () => {
      let validateStub
      let setDefaultsStub
      let getDataAndContextStub
      let invokeLocalStub

      // @ts-expect-error TS(2304): Cannot find name 'beforeAll'.
      beforeAll(() => {
        validateStub = sinon.stub(googleInvokeLocal, 'validate').resolves()
        setDefaultsStub = sinon.stub(googleInvokeLocal, 'setDefaults').resolves()
        getDataAndContextStub = sinon.stub(googleInvokeLocal, 'getDataAndContext').resolves()
        invokeLocalStub = sinon.stub(googleInvokeLocal, 'invokeLocal').resolves()
      })

      // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
      afterEach(() => {
        googleInvokeLocal.validate.resetHistory()
        googleInvokeLocal.setDefaults.resetHistory()
        googleInvokeLocal.getDataAndContext.resetHistory()
        googleInvokeLocal.invokeLocal.resetHistory()
      })

      // @ts-expect-error TS(2304): Cannot find name 'afterAll'.
      afterAll(() => {
        googleInvokeLocal.validate.restore()
        googleInvokeLocal.setDefaults.restore()
        googleInvokeLocal.getDataAndContext.restore()
        googleInvokeLocal.invokeLocal.restore()
      })

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it.each`
        hook
        ${'initialize'}
        ${'before:invoke:local:invoke'}
        ${'invoke:local:invoke'}
      `('should declare $hook hook', ({ hook }) => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googleInvokeLocal.hooks[hook]).toBeDefined()
      })

      // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
      describe('initialize hook', () => {
        // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
        it('should override raw options with processed options', () => {
          googleInvokeLocal.hooks.initialize()
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(googleInvokeLocal.options).toEqual(processedOptions)
        })
      })

      // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
      describe('before:invoke:local:invoke hook', () => {
        // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
        it('should validate the configuration', async () => {
          await googleInvokeLocal.hooks['before:invoke:local:invoke']()
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(validateStub.calledOnce).toEqual(true)
        })

        // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
        it('should set the defaults values', async () => {
          await googleInvokeLocal.hooks['before:invoke:local:invoke']()
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(setDefaultsStub.calledOnce).toEqual(true)
        })

        // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
        it('should resolve the data and the context of the invocation', async () => {
          await googleInvokeLocal.hooks['before:invoke:local:invoke']()
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(getDataAndContextStub.calledOnce).toEqual(true)
        })
      })

      // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
      describe('invoke:local:invoke hook', () => {
        // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
        it('should invoke the function locally', () => {
          googleInvokeLocal.hooks['invoke:local:invoke']()
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(invokeLocalStub.calledOnce).toEqual(true)
        })
      })
    })
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#invokeLocal()', () => {
    const functionObj = Symbol('functionObj')
    const data = Symbol('data')
    const context = Symbol('context')
    const runtime = 'nodejs14'
    let getFunctionStub
    let validateEventsPropertyStub
    let getRuntimeStub
    let invokeLocalNodeJsStub

    // @ts-expect-error TS(2304): Cannot find name 'beforeAll'.
    beforeAll(() => {
      googleInvokeLocal.options = {
        ...processedOptions, // invokeLocal is called after the initialize hook which override the options
        data, // data and context are populated by getDataAndContext in before:invoke:local:invoke hook
        context,
      }
      getFunctionStub = sinon.stub(serverless.service, 'getFunction').returns(functionObj)
      validateEventsPropertyStub = sinon.stub(googleInvokeLocal, 'validateEventsProperty').returns()
      getRuntimeStub = sinon.stub(googleInvokeLocal.provider, 'getRuntime').returns(runtime)

      invokeLocalNodeJsStub = sinon.stub(googleInvokeLocal, 'invokeLocalNodeJs').resolves()
    })

    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
      serverless.service.getFunction.resetHistory()
      googleInvokeLocal.validateEventsProperty.resetHistory()
      googleInvokeLocal.provider.getRuntime.resetHistory()
      googleInvokeLocal.invokeLocalNodeJs.resetHistory()
    })

    // @ts-expect-error TS(2304): Cannot find name 'afterAll'.
    afterAll(() => {
      serverless.service.getFunction.restore()
      googleInvokeLocal.validateEventsProperty.restore()
      googleInvokeLocal.provider.getRuntime.restore()
      googleInvokeLocal.invokeLocalNodeJs.restore()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should get the function configuration', async () => {
      await googleInvokeLocal.invokeLocal()
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(getFunctionStub.calledOnceWith(functionName)).toEqual(true)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should validate the function configuration', async () => {
      await googleInvokeLocal.invokeLocal()
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(validateEventsPropertyStub.calledOnceWith(functionObj, functionName)).toEqual(true)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should get the runtime', async () => {
      await googleInvokeLocal.invokeLocal()
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(getRuntimeStub.calledOnceWith(functionObj)).toEqual(true)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should invoke locally the function with node js', async () => {
      await googleInvokeLocal.invokeLocal()
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(invokeLocalNodeJsStub.calledOnceWith(functionObj, data, context)).toEqual(true)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should throw if the runtime is not node js', async () => {
      getRuntimeStub.returns('python3')
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      await expect(googleInvokeLocal.invokeLocal()).rejects.toThrow(
        'Local invocation with runtime python3 is not supported',
      )
    })
  })
})
