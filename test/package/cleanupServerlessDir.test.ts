'use strict'

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require('path')

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'fse'.
const fse = require('fs-extra')

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../../provider/googleProvider')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GooglePack... Remove this comment to see the full error message
const GooglePackage = require('../googlePackage')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../../test/serverless')

describe('CleanupServerlessDir', () => {
  let serverless
  let googlePackage
  let pathExistsSyncStub
  let removeSyncStub

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

  afterEach(() => {
    fse.pathExistsSync.restore()
    fse.removeSync.restore()
  })

  describe('#cleanupServerlessDir()', () => {
    it('should resolve if no servicePath is given', () => {
      googlePackage.serverless.config.servicePath = false

      pathExistsSyncStub.returns()

      return googlePackage.cleanupServerlessDir().then(() => {
        expect(pathExistsSyncStub.calledOnce).toEqual(false)
        expect(removeSyncStub.calledOnce).toEqual(false)
      })
    })

    it('should remove the .serverless directory if it exists', () => {
      const serviceName = googlePackage.serverless.service.service
      googlePackage.serverless.config.servicePath = serviceName
      const serverlessDirPath = path.join(serviceName, '.serverless')

      pathExistsSyncStub.returns(true)

      return googlePackage.cleanupServerlessDir().then(() => {
        expect(pathExistsSyncStub.calledWithExactly(serverlessDirPath)).toEqual(true)
        expect(removeSyncStub.calledWithExactly(serverlessDirPath)).toEqual(true)
      })
    })

    it('should not remove the .serverless directory if does not exist', () => {
      const serviceName = googlePackage.serverless.service.service
      googlePackage.serverless.config.servicePath = serviceName
      const serverlessDirPath = path.join(serviceName, '.serverless')

      pathExistsSyncStub.returns(false)

      return googlePackage.cleanupServerlessDir().then(() => {
        expect(pathExistsSyncStub.calledWithExactly(serverlessDirPath)).toEqual(true)
        expect(removeSyncStub.calledWithExactly(serverlessDirPath)).toEqual(false)
      })
    })
  })
})
