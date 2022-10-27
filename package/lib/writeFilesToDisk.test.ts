'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
const path = require('path')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../../provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GooglePack... Remove this comment to see the full error message
const GooglePackage = require('../googlePackage')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../../test/serverless')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('WriteFilesToDisk', () => {
  let serverless
  let googlePackage
  let writeFileSyncStub

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    serverless = new Serverless()
    serverless.service.service = 'my-service'
    serverless.service.provider = {
      compiledConfigurationTemplate: {
        foo: 'bar',
      },
    }
    serverless.config = {
      servicePath: 'foo/my-service',
    }
    serverless.setProvider('google', new GoogleProvider(serverless))
    const options = {
      stage: 'dev',
      region: 'us-central1',
    }
    googlePackage = new GooglePackage(serverless, options)
    writeFileSyncStub = sinon.stub(googlePackage.serverless.utils, 'writeFileSync')
  })

  // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
  afterEach(() => {
    googlePackage.serverless.utils.writeFileSync.restore()
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#saveCreateTemplateFile()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should write the template file into the services .serverless directory', () => {
      const createFilePath = path.join(
        googlePackage.serverless.config.servicePath,
        '.serverless',
        'configuration-template-create.yml',
      )

      return googlePackage.saveCreateTemplateFile().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(
          writeFileSyncStub.calledWithExactly(
            createFilePath,
            googlePackage.serverless.service.provider.compiledConfigurationTemplate,
          ),
        ).toEqual(true)
      })
    })
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#saveUpdateTemplateFile()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should write the template file into the services .serverless directory', () => {
      const updateFilePath = path.join(
        googlePackage.serverless.config.servicePath,
        '.serverless',
        'configuration-template-update.yml',
      )

      return googlePackage.saveUpdateTemplateFile().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(
          writeFileSyncStub.calledWithExactly(
            updateFilePath,
            googlePackage.serverless.service.provider.compiledConfigurationTemplate,
          ),
        ).toEqual(true)
      })
    })
  })
})
