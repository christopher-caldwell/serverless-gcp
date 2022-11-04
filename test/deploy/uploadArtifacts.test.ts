'use strict'

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require('fs')

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../../provider/googleProvider')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GoogleDepl... Remove this comment to see the full error message
const GoogleDeploy = require('../googleDeploy')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../../test/serverless')

describe('UploadArtifacts', () => {
  let serverless
  let googleDeploy
  let consoleLogStub
  let requestStub
  let createReadStreamStub

  beforeEach(() => {
    serverless = new Serverless()
    serverless.service = {
      service: 'my-service',
      provider: {
        deploymentBucketName: 'sls-my-service-dev-12345678',
      },
      package: {
        artifactFilePath: '/some-file-path',
        artifact: 'artifact.zip',
      },
    }
    serverless.setProvider('google', new GoogleProvider(serverless))
    const options = {
      stage: 'dev',
      region: 'us-central1',
    }
    googleDeploy = new GoogleDeploy(serverless, options)
    consoleLogStub = sinon.stub(googleDeploy.serverless.cli, 'log').returns()
    requestStub = sinon.stub(googleDeploy.provider, 'request').returns(BbPromise.resolve())
    createReadStreamStub = sinon.stub(fs, 'createReadStream').returns()
  })

  afterEach(() => {
    googleDeploy.serverless.cli.log.restore()
    googleDeploy.provider.request.restore()
    fs.createReadStream.restore()
  })

  describe('#uploadArtifacts()', () => {
    it('should upload corresponding objects to deployment bucket', () =>
      googleDeploy.uploadArtifacts().then(() => {
        expect(
          requestStub.calledWithExactly('storage', 'objects', 'insert', {
            bucket: 'sls-my-service-dev-12345678',
            resource: {
              name: '/some-file-path',
              contentType: 'application/octet-stream',
            },
            media: {
              mimeType: 'application/octet-stream',
              body: fs.createReadStream('artifact.zip'),
            },
          }),
        ).toEqual(true)
      }))

    it('should log info messages', () =>
      googleDeploy.uploadArtifacts().then(() => {
        expect(consoleLogStub.called).toEqual(true)
        expect(
          requestStub.calledWithExactly('storage', 'objects', 'insert', {
            bucket: 'sls-my-service-dev-12345678',
            resource: {
              name: '/some-file-path',
              contentType: 'application/octet-stream',
            },
            media: {
              mimeType: 'application/octet-stream',
              body: fs.createReadStream('artifact.zip'),
            },
          }),
        ).toEqual(true)
      }))

    it('should read artifact file as read stream', () =>
      googleDeploy.uploadArtifacts().then(() => {
        expect(createReadStreamStub.calledOnce).toEqual(true)
        expect(
          requestStub.calledWithExactly('storage', 'objects', 'insert', {
            bucket: 'sls-my-service-dev-12345678',
            resource: {
              name: '/some-file-path',
              contentType: 'application/octet-stream',
            },
            media: {
              mimeType: 'application/octet-stream',
              body: fs.createReadStream('artifact.zip'),
            },
          }),
        ).toEqual(true)
      }))
  })
})
