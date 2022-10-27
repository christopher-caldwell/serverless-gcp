'use strict'

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../../provider/googleProvider')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GooglePack... Remove this comment to see the full error message
const GooglePackage = require('../googlePackage')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../../test/serverless')

describe('MergeServiceResources', () => {
  let serverless
  let googlePackage

  beforeEach(() => {
    serverless = new Serverless()
    serverless.service.service = 'my-service'
    serverless.service.provider = {
      compiledConfigurationTemplate: {},
    }
    serverless.setProvider('google', new GoogleProvider(serverless))
    const options = {
      stage: 'dev',
      region: 'us-central1',
    }
    googlePackage = new GooglePackage(serverless, options)
  })

  it('should resolve if service resources are not defined', () =>
    googlePackage.mergeServiceResources().then(() => {
      expect(serverless.service.provider.compiledConfigurationTemplate).toEqual({})
    }))

  it('should resolve if service resources is empty', () => {
    serverless.service.resources = {}

    return googlePackage.mergeServiceResources().then(() => {
      expect(serverless.service.provider.compiledConfigurationTemplate).toEqual({})
    })
  })

  it('should merge all the resources if provided', () => {
    serverless.service.provider.compiledConfigurationTemplate = {
      resources: [
        {
          name: 'resource1',
          type: 'type1',
          properties: {
            property1: 'value1',
          },
        },
      ],
    }

    serverless.service.resources = {
      resources: [
        {
          name: 'resource2',
          type: 'type2',
          properties: {
            property1: 'value1',
          },
        },
      ],
      imports: [
        {
          path: 'path/to/template.jinja',
          name: 'my-template',
        },
      ],
    }

    const expectedResult = {
      resources: [
        {
          name: 'resource1',
          type: 'type1',
          properties: {
            property1: 'value1',
          },
        },
        {
          name: 'resource2',
          type: 'type2',
          properties: {
            property1: 'value1',
          },
        },
      ],
      imports: [
        {
          path: 'path/to/template.jinja',
          name: 'my-template',
        },
      ],
    }

    return googlePackage.mergeServiceResources().then(() => {
      expect(serverless.service.provider.compiledConfigurationTemplate).toEqual(expectedResult)
    })
  })
})
