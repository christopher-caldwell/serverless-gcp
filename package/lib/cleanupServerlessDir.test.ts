'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
const path = require('path')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fse'.
const fse = require('fs-extra')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../../provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GooglePack... Remove this comment to see the full error message
const GooglePackage = require('../googlePackage')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../../test/serverless')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('CleanupServerlessDir', () => {
  let serverless
  let googlePackage
  let pathExistsSyncStub
  let removeSyncStub

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    serverless = new Serverless()
    serverless.service.service = 'my-service'
    serverless.config = {
      servicePath: false,
    }
    serverless.setProvider('google', new GoogleProvider(serverless))
    const options = {
      stage: 'dev',
      region: 'us-central1',
    }
    googlePackage = new GooglePackage(serverless, options)
    pathExistsSyncStub = sinon.stub(fse, 'pathExistsSync')
    removeSyncStub = sinon.stub(fse, 'removeSync').returns()
  })

  // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
  afterEach(() => {
    fse.pathExistsSync.restore()
    fse.removeSync.restore()
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#cleanupServerlessDir()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should resolve if no servicePath is given', () => {
      googlePackage.serverless.config.servicePath = false

      pathExistsSyncStub.returns()

      return googlePackage.cleanupServerlessDir().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(pathExistsSyncStub.calledOnce).toEqual(false)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(removeSyncStub.calledOnce).toEqual(false)
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should remove the .serverless directory if it exists', () => {
      const serviceName = googlePackage.serverless.service.service
      googlePackage.serverless.config.servicePath = serviceName
      const serverlessDirPath = path.join(serviceName, '.serverless')

      pathExistsSyncStub.returns(true)

      return googlePackage.cleanupServerlessDir().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(pathExistsSyncStub.calledWithExactly(serverlessDirPath)).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(removeSyncStub.calledWithExactly(serverlessDirPath)).toEqual(true)
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should not remove the .serverless directory if does not exist', () => {
      const serviceName = googlePackage.serverless.service.service
      googlePackage.serverless.config.servicePath = serviceName
      const serverlessDirPath = path.join(serviceName, '.serverless')

      pathExistsSyncStub.returns(false)

      return googlePackage.cleanupServerlessDir().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(pathExistsSyncStub.calledWithExactly(serverlessDirPath)).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(removeSyncStub.calledWithExactly(serverlessDirPath)).toEqual(false)
      })
    })
  })
})
