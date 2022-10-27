'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../../provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GooglePack... Remove this comment to see the full error message
const GooglePackage = require('../googlePackage')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../../test/serverless')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('CompileFunctions', () => {
  let serverless
  let googlePackage
  let consoleLogStub

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    serverless = new Serverless()
    serverless.service.service = 'my-service'
    serverless.service.package = {
      artifact: 'artifact.zip',
      artifactDirectoryName: 'some-path',
    }
    serverless.service.provider = {
      compiledConfigurationTemplate: {
        resources: [],
      },
      deploymentBucketName: 'sls-my-service-dev-12345678',
      project: 'myProject',
      region: 'us-central1',
    }
    serverless.setProvider('google', new GoogleProvider(serverless))
    const options = {
      stage: 'dev',
    }
    googlePackage = new GooglePackage(serverless, options)
    consoleLogStub = sinon.stub(googlePackage.serverless.cli, 'log').returns()
  })

  // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
  afterEach(() => {
    googlePackage.serverless.cli.log.restore()
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#compileFunctions()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should throw an error if the function has no handler property', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: null,
        },
      }

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => googlePackage.compileFunctions()).toThrow(Error)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should throw an error if the function has no events property', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: 'func1',
          events: null,
        },
      }

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => googlePackage.compileFunctions()).toThrow(Error)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should throw an error if the function has 0 events', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: 'func1',
          events: [],
        },
      }

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => googlePackage.compileFunctions()).toThrow(Error)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should throw an error if the function has more than 1 event', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: 'func1',
          events: [{ http: 'event1' }, { http: 'event2' }],
        },
      }

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => googlePackage.compileFunctions()).toThrow(Error)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should throw an error if the functions event is not supported', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: 'func1',
          events: [{ invalidEvent: 'event1' }],
        },
      }

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(() => googlePackage.compileFunctions()).toThrow(Error)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the memory size based on the functions configuration', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: 'func1',
          memorySize: 1024,
          runtime: 'nodejs10',
          events: [{ http: 'foo' }],
        },
      }

      const compiledResources = [
        {
          type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
          name: 'my-service-dev-func1',
          properties: {
            parent: 'projects/myProject/locations/us-central1',
            runtime: 'nodejs10',
            function: 'my-service-dev-func1',
            entryPoint: 'func1',
            availableMemoryMb: 1024,
            timeout: '60s',
            sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
            httpsTrigger: {
              url: 'foo',
            },
            labels: {},
          },
        },
      ]

      return googlePackage.compileFunctions().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
          compiledResources,
        )
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the memory size based on the provider configuration', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: 'func1',
          events: [{ http: 'foo' }],
        },
      }
      googlePackage.serverless.service.provider.memorySize = 1024

      const compiledResources = [
        {
          type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
          name: 'my-service-dev-func1',
          properties: {
            parent: 'projects/myProject/locations/us-central1',
            runtime: 'nodejs10',
            function: 'my-service-dev-func1',
            entryPoint: 'func1',
            availableMemoryMb: 1024,
            timeout: '60s',
            sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
            httpsTrigger: {
              url: 'foo',
            },
            labels: {},
          },
        },
      ]

      return googlePackage.compileFunctions().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
          compiledResources,
        )
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the timout based on the functions configuration', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: 'func1',
          timeout: '120s',
          events: [{ http: 'foo' }],
        },
      }

      const compiledResources = [
        {
          type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
          name: 'my-service-dev-func1',
          properties: {
            parent: 'projects/myProject/locations/us-central1',
            runtime: 'nodejs10',
            function: 'my-service-dev-func1',
            entryPoint: 'func1',
            availableMemoryMb: 256,
            timeout: '120s',
            sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
            httpsTrigger: {
              url: 'foo',
            },
            labels: {},
          },
        },
      ]

      return googlePackage.compileFunctions().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
          compiledResources,
        )
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the timeout based on the provider configuration', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: 'func1',
          events: [{ http: 'foo' }],
        },
      }
      googlePackage.serverless.service.provider.timeout = '120s'

      const compiledResources = [
        {
          type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
          name: 'my-service-dev-func1',
          properties: {
            parent: 'projects/myProject/locations/us-central1',
            runtime: 'nodejs10',
            function: 'my-service-dev-func1',
            entryPoint: 'func1',
            availableMemoryMb: 256,
            timeout: '120s',
            sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
            httpsTrigger: {
              url: 'foo',
            },
            labels: {},
          },
        },
      ]

      return googlePackage.compileFunctions().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
          compiledResources,
        )
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the labels based on the functions configuration', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: 'func1',
          labels: {
            test: 'label',
          },
          events: [{ http: 'foo' }],
        },
      }

      const compiledResources = [
        {
          type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
          name: 'my-service-dev-func1',
          properties: {
            parent: 'projects/myProject/locations/us-central1',
            runtime: 'nodejs10',
            function: 'my-service-dev-func1',
            entryPoint: 'func1',
            availableMemoryMb: 256,
            timeout: '60s',
            sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
            httpsTrigger: {
              url: 'foo',
            },
            labels: {
              test: 'label',
            },
          },
        },
      ]

      return googlePackage.compileFunctions().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
          compiledResources,
        )
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the labels based on the provider configuration', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: 'func1',
          events: [{ http: 'foo' }],
        },
      }
      googlePackage.serverless.service.provider.labels = {
        test: 'label',
      }

      const compiledResources = [
        {
          type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
          name: 'my-service-dev-func1',
          properties: {
            parent: 'projects/myProject/locations/us-central1',
            runtime: 'nodejs10',
            function: 'my-service-dev-func1',
            entryPoint: 'func1',
            availableMemoryMb: 256,
            timeout: '60s',
            sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
            httpsTrigger: {
              url: 'foo',
            },
            labels: {
              test: 'label',
            },
          },
        },
      ]

      return googlePackage.compileFunctions().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
          compiledResources,
        )
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the labels based on the merged provider and function configuration', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: 'func1',
          events: [{ http: 'foo' }],
          labels: {
            test: 'functionLabel',
          },
        },
      }
      googlePackage.serverless.service.provider.labels = {
        test: 'providerLabel',
        secondTest: 'tested',
      }

      const compiledResources = [
        {
          type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
          name: 'my-service-dev-func1',
          properties: {
            parent: 'projects/myProject/locations/us-central1',
            runtime: 'nodejs10',
            function: 'my-service-dev-func1',
            entryPoint: 'func1',
            availableMemoryMb: 256,
            timeout: '60s',
            sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
            httpsTrigger: {
              url: 'foo',
            },
            labels: {
              test: 'functionLabel',
              secondTest: 'tested',
            },
          },
        },
      ]

      return googlePackage.compileFunctions().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
          compiledResources,
        )
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the environment variables based on the function configuration', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: 'func1',
          environment: {
            TEST_VAR: 'test',
          },
          events: [{ http: 'foo' }],
        },
      }

      const compiledResources = [
        {
          type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
          name: 'my-service-dev-func1',
          properties: {
            parent: 'projects/myProject/locations/us-central1',
            runtime: 'nodejs10',
            function: 'my-service-dev-func1',
            entryPoint: 'func1',
            availableMemoryMb: 256,
            environmentVariables: {
              TEST_VAR: 'test',
            },
            timeout: '60s',
            sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
            httpsTrigger: {
              url: 'foo',
            },
            labels: {},
          },
        },
      ]

      return googlePackage.compileFunctions().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
          compiledResources,
        )
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the environment variables based on the provider configuration', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: 'func1',
          events: [{ http: 'foo' }],
        },
      }
      googlePackage.serverless.service.provider.environment = {
        TEST_VAR: 'test',
      }

      const compiledResources = [
        {
          type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
          name: 'my-service-dev-func1',
          properties: {
            parent: 'projects/myProject/locations/us-central1',
            runtime: 'nodejs10',
            function: 'my-service-dev-func1',
            entryPoint: 'func1',
            availableMemoryMb: 256,
            environmentVariables: {
              TEST_VAR: 'test',
            },
            timeout: '60s',
            sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
            httpsTrigger: {
              url: 'foo',
            },
            labels: {},
          },
        },
      ]

      return googlePackage.compileFunctions().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
          compiledResources,
        )
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should merge the environment variables on the provider configuration and function definition', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: 'func1',
          environment: {
            TEST_VAR: 'test_var',
            TEST_VALUE: 'foobar',
          },
          events: [{ http: 'foo' }],
        },
      }
      googlePackage.serverless.service.provider.environment = {
        TEST_VAR: 'test',
        TEST_FOO: 'foo',
      }

      const compiledResources = [
        {
          type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
          name: 'my-service-dev-func1',
          properties: {
            parent: 'projects/myProject/locations/us-central1',
            runtime: 'nodejs10',
            function: 'my-service-dev-func1',
            entryPoint: 'func1',
            availableMemoryMb: 256,
            environmentVariables: {
              TEST_VAR: 'test_var',
              TEST_VALUE: 'foobar',
              TEST_FOO: 'foo',
            },
            timeout: '60s',
            sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
            httpsTrigger: {
              url: 'foo',
            },
            labels: {},
          },
        },
      ]

      return googlePackage.compileFunctions().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
          compiledResources,
        )
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googlePackage.serverless.service.provider.environment).toEqual({
          TEST_VAR: 'test',
          TEST_FOO: 'foo',
        })
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the secret environment variables based on the function configuration', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: 'func1',
          secrets: {
            TEST_SECRET: {
              secret: 'secret',
              version: 'latest',
            },
          },
          events: [{ http: 'foo' }],
        },
      }

      const compiledResources = [
        {
          type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
          name: 'my-service-dev-func1',
          properties: {
            parent: 'projects/myProject/locations/us-central1',
            runtime: 'nodejs10',
            function: 'my-service-dev-func1',
            entryPoint: 'func1',
            availableMemoryMb: 256,
            secretEnvironmentVariables: [
              {
                key: 'TEST_SECRET',
                secret: 'secret',
                version: 'latest',
              },
            ],
            timeout: '60s',
            sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
            httpsTrigger: {
              url: 'foo',
            },
            labels: {},
          },
        },
      ]

      return googlePackage.compileFunctions().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
          compiledResources,
        )
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should merge the secret environment variables on the provider configuration and function definition', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: 'func1',
          secrets: {
            TEST_SECRET: { secret: 'secret1', version: 'latest' },
            TEST_SECRET2: { secret: 'secret2', version: 'latest' },
          },
          events: [{ http: 'foo' }],
        },
      }
      googlePackage.serverless.service.provider.secrets = {
        TEST_SECRET: { secret: 'secretbase', version: 'latest' },
        TEST_SECRET_PROVIDER: { secret: 'secretprovider', version: 'latest' },
      }

      const compiledResources = [
        {
          type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
          name: 'my-service-dev-func1',
          properties: {
            parent: 'projects/myProject/locations/us-central1',
            runtime: 'nodejs10',
            function: 'my-service-dev-func1',
            entryPoint: 'func1',
            availableMemoryMb: 256,
            secretEnvironmentVariables: [
              { key: 'TEST_SECRET', secret: 'secret1', version: 'latest' },
              { key: 'TEST_SECRET2', secret: 'secret2', version: 'latest' },
              { key: 'TEST_SECRET_PROVIDER', secret: 'secretprovider', version: 'latest' },
            ],
            timeout: '60s',
            sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
            httpsTrigger: {
              url: 'foo',
            },
            labels: {},
          },
        },
      ]

      return googlePackage.compileFunctions().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
          compiledResources,
        )
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googlePackage.serverless.service.provider.secrets).toEqual({
          TEST_SECRET: { secret: 'secretbase', version: 'latest' },
          TEST_SECRET_PROVIDER: { secret: 'secretprovider', version: 'latest' },
        })
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should compile "http" events properly', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: 'func1',
          events: [{ http: 'foo' }],
        },
      }

      const compiledResources = [
        {
          type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
          name: 'my-service-dev-func1',
          properties: {
            parent: 'projects/myProject/locations/us-central1',
            runtime: 'nodejs10',
            function: 'my-service-dev-func1',
            entryPoint: 'func1',
            availableMemoryMb: 256,
            timeout: '60s',
            sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
            httpsTrigger: {
              url: 'foo',
            },
            labels: {},
          },
        },
      ]

      return googlePackage.compileFunctions().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
          compiledResources,
        )
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should compile "event" events properly', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: 'func1',
          events: [
            {
              event: {
                eventType: 'foo',
                path: 'some-path',
                resource: 'some-resource',
              },
            },
          ],
        },
        func2: {
          handler: 'func2',
          events: [
            {
              event: {
                eventType: 'foo',
                resource: 'some-resource',
              },
            },
          ],
        },
      }

      const compiledResources = [
        {
          type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
          name: 'my-service-dev-func1',
          properties: {
            parent: 'projects/myProject/locations/us-central1',
            runtime: 'nodejs10',
            function: 'my-service-dev-func1',
            entryPoint: 'func1',
            availableMemoryMb: 256,
            timeout: '60s',
            sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
            eventTrigger: {
              eventType: 'foo',
              path: 'some-path',
              resource: 'some-resource',
            },
            labels: {},
          },
        },
        {
          type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
          name: 'my-service-dev-func2',
          properties: {
            parent: 'projects/myProject/locations/us-central1',
            runtime: 'nodejs10',
            function: 'my-service-dev-func2',
            entryPoint: 'func2',
            availableMemoryMb: 256,
            timeout: '60s',
            sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
            eventTrigger: {
              eventType: 'foo',
              resource: 'some-resource',
            },
            labels: {},
          },
        },
      ]

      return googlePackage.compileFunctions().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.called).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
          compiledResources,
        )
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set vpc connection base on the function configuration', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: 'func1',
          memorySize: 128,
          runtime: 'nodejs10',
          vpc: 'projects/pg-us-n-app-123456/locations/us-central1/connectors/my-vpc',
          events: [{ http: 'foo' }],
        },
      }

      const compiledResources = [
        {
          type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
          name: 'my-service-dev-func1',
          properties: {
            parent: 'projects/myProject/locations/us-central1',
            runtime: 'nodejs10',
            function: 'my-service-dev-func1',
            entryPoint: 'func1',
            availableMemoryMb: 128,
            timeout: '60s',
            sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
            httpsTrigger: {
              url: 'foo',
            },
            labels: {},
            vpcConnector: 'projects/pg-us-n-app-123456/locations/us-central1/connectors/my-vpc',
          },
        },
      ]

      return googlePackage.compileFunctions().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.called).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
          compiledResources,
        )
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set max instances on the function configuration', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: 'func1',
          memorySize: 128,
          runtime: 'nodejs10',
          maxInstances: 10,
          vpc: 'projects/pg-us-n-app-123456/locations/us-central1/connectors/my-vpc',
          events: [{ http: 'foo' }],
        },
      }

      const compiledResources = [
        {
          type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
          name: 'my-service-dev-func1',
          properties: {
            parent: 'projects/myProject/locations/us-central1',
            runtime: 'nodejs10',
            function: 'my-service-dev-func1',
            entryPoint: 'func1',
            availableMemoryMb: 128,
            timeout: '60s',
            maxInstances: 10,
            sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
            httpsTrigger: {
              url: 'foo',
            },
            labels: {},
            vpcConnector: 'projects/pg-us-n-app-123456/locations/us-central1/connectors/my-vpc',
          },
        },
      ]

      return googlePackage.compileFunctions().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.called).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
          compiledResources,
        )
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should not require max instances on each function configuration', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: 'func1',
          memorySize: 128,
          runtime: 'nodejs10',
          vpc: 'projects/pg-us-n-app-123456/locations/us-central1/connectors/my-vpc',
          events: [{ http: 'foo' }],
        },
        func2: {
          handler: 'func2',
          memorySize: 128,
          runtime: 'nodejs10',
          maxInstances: 10,
          vpc: 'projects/pg-us-n-app-123456/locations/us-central1/connectors/my-vpc',
          events: [{ http: 'bar' }],
        },
      }

      const compiledResources = [
        {
          type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
          name: 'my-service-dev-func1',
          properties: {
            parent: 'projects/myProject/locations/us-central1',
            runtime: 'nodejs10',
            function: 'my-service-dev-func1',
            entryPoint: 'func1',
            availableMemoryMb: 128,
            timeout: '60s',
            sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
            httpsTrigger: {
              url: 'foo',
            },
            labels: {},
            vpcConnector: 'projects/pg-us-n-app-123456/locations/us-central1/connectors/my-vpc',
          },
        },
        {
          type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
          name: 'my-service-dev-func2',
          properties: {
            parent: 'projects/myProject/locations/us-central1',
            runtime: 'nodejs10',
            function: 'my-service-dev-func2',
            entryPoint: 'func2',
            availableMemoryMb: 128,
            timeout: '60s',
            maxInstances: 10,
            sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
            httpsTrigger: {
              url: 'bar',
            },
            labels: {},
            vpcConnector: 'projects/pg-us-n-app-123456/locations/us-central1/connectors/my-vpc',
          },
        },
      ]

      return googlePackage.compileFunctions().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.called).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
          compiledResources,
        )
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set min instances on the function configuration', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: 'func1',
          memorySize: 128,
          runtime: 'nodejs10',
          minInstances: 5,
          vpc: 'projects/pg-us-n-app-123456/locations/us-central1/connectors/my-vpc',
          events: [{ http: 'foo' }],
        },
      }

      const compiledResources = [
        {
          type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
          name: 'my-service-dev-func1',
          properties: {
            parent: 'projects/myProject/locations/us-central1',
            runtime: 'nodejs10',
            function: 'my-service-dev-func1',
            entryPoint: 'func1',
            availableMemoryMb: 128,
            timeout: '60s',
            minInstances: 5,
            sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
            httpsTrigger: {
              url: 'foo',
            },
            labels: {},
            vpcConnector: 'projects/pg-us-n-app-123456/locations/us-central1/connectors/my-vpc',
          },
        },
      ]

      return googlePackage.compileFunctions().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.called).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
          compiledResources,
        )
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should not require min instances on each function configuration', () => {
      googlePackage.serverless.service.functions = {
        func1: {
          handler: 'func1',
          memorySize: 128,
          runtime: 'nodejs10',
          vpc: 'projects/pg-us-n-app-123456/locations/us-central1/connectors/my-vpc',
          events: [{ http: 'foo' }],
        },
        func2: {
          handler: 'func2',
          memorySize: 128,
          runtime: 'nodejs10',
          minInstances: 5,
          vpc: 'projects/pg-us-n-app-123456/locations/us-central1/connectors/my-vpc',
          events: [{ http: 'bar' }],
        },
      }

      const compiledResources = [
        {
          type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
          name: 'my-service-dev-func1',
          properties: {
            parent: 'projects/myProject/locations/us-central1',
            runtime: 'nodejs10',
            function: 'my-service-dev-func1',
            entryPoint: 'func1',
            availableMemoryMb: 128,
            timeout: '60s',
            sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
            httpsTrigger: {
              url: 'foo',
            },
            labels: {},
            vpcConnector: 'projects/pg-us-n-app-123456/locations/us-central1/connectors/my-vpc',
          },
        },
        {
          type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
          name: 'my-service-dev-func2',
          properties: {
            parent: 'projects/myProject/locations/us-central1',
            runtime: 'nodejs10',
            function: 'my-service-dev-func2',
            entryPoint: 'func2',
            availableMemoryMb: 128,
            timeout: '60s',
            minInstances: 5,
            sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
            httpsTrigger: {
              url: 'bar',
            },
            labels: {},
            vpcConnector: 'projects/pg-us-n-app-123456/locations/us-central1/connectors/my-vpc',
          },
        },
      ]

      return googlePackage.compileFunctions().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.called).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
          compiledResources,
        )
      })
    })
  })

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should allow vpc as short name', () => {
    googlePackage.serverless.service.functions = {
      func1: {
        handler: 'func1',
        memorySize: 128,
        runtime: 'nodejs10',
        vpc: 'my-vpc',
        events: [{ http: 'foo' }],
      },
    }

    const compiledResources = [
      {
        type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
        name: 'my-service-dev-func1',
        properties: {
          parent: 'projects/myProject/locations/us-central1',
          runtime: 'nodejs10',
          function: 'my-service-dev-func1',
          entryPoint: 'func1',
          availableMemoryMb: 128,
          timeout: '60s',
          sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
          httpsTrigger: {
            url: 'foo',
          },
          labels: {},
          vpcConnector: 'my-vpc',
        },
      },
    ]

    return googlePackage.compileFunctions().then(() => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(consoleLogStub.called).toEqual(true)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
        compiledResources,
      )
    })
  })

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should allow vpc egress all at function level', () => {
    googlePackage.serverless.service.functions = {
      func1: {
        handler: 'func1',
        memorySize: 128,
        runtime: 'nodejs10',
        vpc: 'my-vpc',
        vpcEgress: 'all',
        events: [{ http: 'foo' }],
      },
    }

    const compiledResources = [
      {
        type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
        name: 'my-service-dev-func1',
        properties: {
          parent: 'projects/myProject/locations/us-central1',
          runtime: 'nodejs10',
          function: 'my-service-dev-func1',
          entryPoint: 'func1',
          availableMemoryMb: 128,
          timeout: '60s',
          sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
          httpsTrigger: {
            url: 'foo',
          },
          labels: {},
          vpcConnector: 'my-vpc',
          vpcConnectorEgressSettings: 'ALL_TRAFFIC',
        },
      },
    ]

    return googlePackage.compileFunctions().then(() => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(consoleLogStub.called).toEqual(true)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
        compiledResources,
      )
    })
  })

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should allow vpc egress private at function level', () => {
    googlePackage.serverless.service.functions = {
      func1: {
        handler: 'func1',
        memorySize: 128,
        runtime: 'nodejs10',
        vpc: 'my-vpc',
        vpcEgress: 'private',
        events: [{ http: 'foo' }],
      },
    }

    const compiledResources = [
      {
        type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
        name: 'my-service-dev-func1',
        properties: {
          parent: 'projects/myProject/locations/us-central1',
          runtime: 'nodejs10',
          function: 'my-service-dev-func1',
          entryPoint: 'func1',
          availableMemoryMb: 128,
          timeout: '60s',
          sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
          httpsTrigger: {
            url: 'foo',
          },
          labels: {},
          vpcConnector: 'my-vpc',
          vpcConnectorEgressSettings: 'PRIVATE_RANGES_ONLY',
        },
      },
    ]

    return googlePackage.compileFunctions().then(() => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(consoleLogStub.called).toEqual(true)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
        compiledResources,
      )
    })
  })

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should allow vpc egress all at provider level', () => {
    googlePackage.serverless.service.functions = {
      func1: {
        handler: 'func1',
        memorySize: 128,
        runtime: 'nodejs10',
        vpc: 'my-vpc',
        events: [{ http: 'foo' }],
      },
    }

    googlePackage.serverless.service.provider.vpcEgress = 'all'

    const compiledResources = [
      {
        type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
        name: 'my-service-dev-func1',
        properties: {
          parent: 'projects/myProject/locations/us-central1',
          runtime: 'nodejs10',
          function: 'my-service-dev-func1',
          entryPoint: 'func1',
          availableMemoryMb: 128,
          timeout: '60s',
          sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
          httpsTrigger: {
            url: 'foo',
          },
          labels: {},
          vpcConnector: 'my-vpc',
          vpcConnectorEgressSettings: 'ALL_TRAFFIC',
        },
      },
    ]

    return googlePackage.compileFunctions().then(() => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(consoleLogStub.called).toEqual(true)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
        compiledResources,
      )
    })
  })

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should allow vpc egress private at provider level', () => {
    googlePackage.serverless.service.functions = {
      func1: {
        handler: 'func1',
        memorySize: 128,
        runtime: 'nodejs10',
        vpc: 'my-vpc',
        events: [{ http: 'foo' }],
      },
    }

    googlePackage.serverless.service.provider.vpcEgress = 'private'

    const compiledResources = [
      {
        type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
        name: 'my-service-dev-func1',
        properties: {
          parent: 'projects/myProject/locations/us-central1',
          runtime: 'nodejs10',
          function: 'my-service-dev-func1',
          entryPoint: 'func1',
          availableMemoryMb: 128,
          timeout: '60s',
          sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
          httpsTrigger: {
            url: 'foo',
          },
          labels: {},
          vpcConnector: 'my-vpc',
          vpcConnectorEgressSettings: 'PRIVATE_RANGES_ONLY',
        },
      },
    ]

    return googlePackage.compileFunctions().then(() => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(consoleLogStub.called).toEqual(true)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
        compiledResources,
      )
    })
  })

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should replace vpc egress private at provider level for a vpc egress all defined at function level', () => {
    googlePackage.serverless.service.functions = {
      func1: {
        handler: 'func1',
        memorySize: 128,
        runtime: 'nodejs10',
        vpc: 'my-vpc',
        events: [{ http: 'foo' }],
        vpcEgress: 'all',
      },
    }

    googlePackage.serverless.service.provider.vpcEgress = 'private'

    const compiledResources = [
      {
        type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
        name: 'my-service-dev-func1',
        properties: {
          parent: 'projects/myProject/locations/us-central1',
          runtime: 'nodejs10',
          function: 'my-service-dev-func1',
          entryPoint: 'func1',
          availableMemoryMb: 128,
          timeout: '60s',
          sourceArchiveUrl: 'gs://sls-my-service-dev-12345678/some-path/artifact.zip',
          httpsTrigger: {
            url: 'foo',
          },
          labels: {},
          vpcConnector: 'my-vpc',
          vpcConnectorEgressSettings: 'ALL_TRAFFIC',
        },
      },
    ]

    return googlePackage.compileFunctions().then(() => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(consoleLogStub.called).toEqual(true)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googlePackage.serverless.service.provider.compiledConfigurationTemplate.resources).toEqual(
        compiledResources,
      )
    })
  })
})
