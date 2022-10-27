'use strict'

const os = require('os')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
const google = require('googleapis').google

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('./googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../test/serverless')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('GoogleProvider', () => {
  let googleProvider
  let serverless
  let setProviderStub
  let homedirStub

  const providerRuntime = 'providerRuntime'

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    serverless = new Serverless()
    serverless.version = '1.0.0'
    serverless.service = {
      provider: {
        project: 'example-project',
        runtime: providerRuntime,
      },
    }
    setProviderStub = sinon.stub(serverless, 'setProvider').returns()
    homedirStub = sinon.stub(os, 'homedir').returns('/root')
    googleProvider = new GoogleProvider(serverless)
  })

  // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
  afterEach(() => {
    serverless.setProvider.restore()
    os.homedir.restore()
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#getProviderName()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should return the provider name', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(GoogleProvider.getProviderName()).toEqual('google')
    })
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#constructor()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should store an instance of serverless', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleProvider.serverless).toBeInstanceOf(Serverless)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should store an instance of itself', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleProvider.provider).toBeInstanceOf(GoogleProvider)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the provider with the Serverless instance', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(setProviderStub.calledOnce).toEqual(true)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the used SDKs', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleProvider.sdk.google).toBeDefined()

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleProvider.sdk.deploymentmanager).toBeDefined()

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleProvider.sdk.storage).toBeDefined()

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleProvider.sdk.logging).toBeDefined()

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleProvider.sdk.cloudfunctions).toBeDefined()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the google options', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(google._options.headers['User-Agent']) // eslint-disable-line no-underscore-dangle
        .toMatch(/Serverless\/.+ Serverless-Google-Provider\/.+ Googleapis\/.+/)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should define the schema of the provider', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(serverless.configSchemaHandler.defineProvider).toHaveBeenCalledWith('google', expect.any(Object))
    })
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#request()', () => {
    // NOTE: we're using our own custom services here to make
    // the tests SDK independent
    let savedSdk

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
      savedSdk = googleProvider.sdk
      googleProvider.sdk = {
        service: {
          resource: {
            method: {
              // will be replaced for each individual test
              bind: null,
            },
          },
        },
      }
      sinon.stub(googleProvider, 'getAuthClient').returns({
        getClient: sinon.stub().resolves(),
      })
      sinon.stub(googleProvider, 'isServiceSupported').returns()
    })

    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
      googleProvider.sdk = savedSdk
      googleProvider.getAuthClient.restore()
      googleProvider.isServiceSupported.restore()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should perform the given request', () => {
      googleProvider.sdk.service.resource.method.bind = () => sinon.stub().resolves({ data: 'result' })

      return googleProvider.request('service', 'resource', 'method', {}).then((result) => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(result).toEqual('result')
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should throw a custom error message when the project configuration is wrong', () => {
      googleProvider.sdk.service.resource.method.bind = () =>
        sinon.stub().rejects({ errors: [{ message: 'project 1043443644444' }] })

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      return expect(googleProvider.request('service', 'resource', 'method', {})).rejects.toThrow(
        /Incorrect configuration/,
      )
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should re-throw other errors', () => {
      googleProvider.sdk.service.resource.method.bind = () => sinon.stub().rejects(new Error('some error message'))

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      return expect(googleProvider.request('service', 'resource', 'method', {})).rejects.toThrow('some error message')
    })
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#getAuthClient()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should return a new authClient when using default credentials', () => {
      const authClient = googleProvider.getAuthClient()

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(authClient.keyFilename).toEqual(undefined)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(authClient).toBeInstanceOf(google.auth.GoogleAuth)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should return a new authClient when using a credentials file', () => {
      googleProvider.serverless.service.provider.credentials = '/root/.gcloud/project-1234.json'

      const authClient = googleProvider.getAuthClient()

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(authClient.keyFilename).toEqual('/root/.gcloud/project-1234.json')
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(authClient).toBeInstanceOf(google.auth.GoogleAuth)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should expand tilde characters in credentials file paths', () => {
      googleProvider.serverless.service.provider.credentials = '~/.gcloud/project-1234.json'

      const authClient = googleProvider.getAuthClient()

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(homedirStub.calledOnce).toEqual(true)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(authClient.keyFilename).toEqual('/root/.gcloud/project-1234.json')
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(authClient).toBeInstanceOf(google.auth.GoogleAuth)
    })
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#isServiceSupported()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should do nothing if service is available', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => {
        googleProvider.isServiceSupported('storage')
      }).not.toThrow(Error)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should throw error if service is not Supported', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => {
        googleProvider.isServiceSupported('unsupported')
      }).toThrow(Error)
    })
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#getRuntime()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should return the runtime of the function if defined', () => {
      const functionRuntime = 'functionRuntime'
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleProvider.getRuntime({ runtime: functionRuntime })).toEqual(functionRuntime)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should return the runtime of the provider if not defined in the function', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleProvider.getRuntime({})).toEqual(providerRuntime)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should return nodejs10 if neither the runtime of the function nor the one of the provider are defined', () => {
      serverless.service.provider.runtime = undefined
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleProvider.getRuntime({})).toEqual('nodejs10')
    })
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#getConfiguredEnvironment()', () => {
    const functionEnvironment = {
      MY_VAR: 'myVarFunctionValue',
      FUNCTION_VAR: 'functionVarFunctionValue',
    }
    const providerEnvironment = {
      MY_VAR: 'myVarProviderValue',
      PROVIDER_VAR: 'providerVarProviderValue',
    }

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should return the environment of the function if defined', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleProvider.getConfiguredEnvironment({ environment: functionEnvironment })).toEqual(functionEnvironment)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should return the environment of the provider if defined', () => {
      serverless.service.provider.environment = providerEnvironment
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleProvider.getConfiguredEnvironment({})).toEqual(providerEnvironment)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should return an empty object if neither the environment of the function nor the one of the provider are defined', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleProvider.getConfiguredEnvironment({})).toEqual({})
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should return the merged environment of the provider and the function. The function override the provider.', () => {
      serverless.service.provider.environment = providerEnvironment
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleProvider.getConfiguredEnvironment({ environment: functionEnvironment })).toEqual({
        MY_VAR: 'myVarFunctionValue',
        FUNCTION_VAR: 'functionVarFunctionValue',
        PROVIDER_VAR: 'providerVarProviderValue',
      })
    })
  })
})
