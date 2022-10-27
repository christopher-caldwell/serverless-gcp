'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require('fs')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
const path = require('path')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../../provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleDepl... Remove this comment to see the full error message
const GoogleDeploy = require('../googleDeploy')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../../test/serverless')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('CreateDeployment', () => {
  let serverless
  let googleDeploy
  let requestStub
  let configurationTemplateCreateFilePath

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    serverless = new Serverless()
    serverless.service.service = 'my-service'
    serverless.service.provider = {
      project: 'my-project',
    }
    serverless.config = {
      servicePath: 'tmp',
    }
    serverless.setProvider('google', new GoogleProvider(serverless))
    const options = {
      stage: 'dev',
      region: 'us-central1',
    }
    googleDeploy = new GoogleDeploy(serverless, options)
    requestStub = sinon.stub(googleDeploy.provider, 'request')
    configurationTemplateCreateFilePath = path.join(
      serverless.config.servicePath,
      '.serverless',
      'configuration-template-create.yml',
    )
  })

  // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
  afterEach(() => {
    googleDeploy.provider.request.restore()
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#createDeployment()', () => {
    let checkForExistingDeploymentStub
    let createIfNotExistsStub

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
      checkForExistingDeploymentStub = sinon
        .stub(googleDeploy, 'checkForExistingDeployment')
        .returns(BbPromise.resolve())
      createIfNotExistsStub = sinon.stub(googleDeploy, 'createIfNotExists').returns(BbPromise.resolve())
    })

    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
      googleDeploy.checkForExistingDeployment.restore()
      googleDeploy.createIfNotExists.restore()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should run promise chain', () =>
      googleDeploy.createDeployment().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(checkForExistingDeploymentStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(createIfNotExistsStub.calledAfter(checkForExistingDeploymentStub))
      }))
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#checkForExistingDeployment()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should return "undefined" if no deployments are found', () => {
      requestStub.returns(BbPromise.resolve([]))

      return googleDeploy.checkForExistingDeployment().then((foundDeployment) => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(foundDeployment).toEqual(undefined)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(
          requestStub.calledWithExactly('deploymentmanager', 'deployments', 'list', {
            project: 'my-project',
          }),
        ).toEqual(true)
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should return "undefined" if deployments do not contain deployment', () => {
      const response = {
        deployments: [{ name: 'some-other-deployment' }],
      }
      requestStub.returns(BbPromise.resolve(response))

      return googleDeploy.checkForExistingDeployment().then((foundDeployment) => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(foundDeployment).toEqual(undefined)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(
          requestStub.calledWithExactly('deploymentmanager', 'deployments', 'list', {
            project: 'my-project',
          }),
        ).toEqual(true)
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should find the existing deployment', () => {
      const response = {
        deployments: [{ name: 'sls-my-service-dev' }, { name: 'some-other-deployment' }],
      }
      requestStub.returns(BbPromise.resolve(response))

      return googleDeploy.checkForExistingDeployment().then((foundDeployment) => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(foundDeployment).toEqual(response.deployments[0])
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(
          requestStub.calledWithExactly('deploymentmanager', 'deployments', 'list', {
            project: 'my-project',
          }),
        ).toEqual(true)
      })
    })
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#createIfNotExists()', () => {
    let consoleLogStub
    let readFileSyncStub
    let monitorDeploymentStub

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
      consoleLogStub = sinon.stub(googleDeploy.serverless.cli, 'log').returns()
      readFileSyncStub = sinon.stub(fs, 'readFileSync').returns('some content')
      monitorDeploymentStub = sinon.stub(googleDeploy, 'monitorDeployment').returns(BbPromise.resolve())
    })

    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
      googleDeploy.serverless.cli.log.restore()
      fs.readFileSync.restore()
      googleDeploy.monitorDeployment.restore()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should resolve if there is no existing deployment', () => {
      const foundDeployment = true

      return googleDeploy.createIfNotExists(foundDeployment).then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledOnce).toEqual(false)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(readFileSyncStub.called).toEqual(false)
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should create and hand over to monitor the deployment if it does not exist', () => {
      const foundDeployment = false
      const params = {
        project: 'my-project',
        resource: {
          name: 'sls-my-service-dev',
          target: {
            config: {
              content: fs.readFileSync(configurationTemplateCreateFilePath).toString(),
            },
          },
        },
      }
      requestStub.returns(BbPromise.resolve())

      return googleDeploy.createIfNotExists(foundDeployment).then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(readFileSyncStub.called).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(requestStub.calledWithExactly('deploymentmanager', 'deployments', 'insert', params)).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(monitorDeploymentStub.calledWithExactly('sls-my-service-dev', 'create', 5000)).toEqual(true)
      })
    })
  })
})
