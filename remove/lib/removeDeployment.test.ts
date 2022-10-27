'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../../provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleRemo... Remove this comment to see the full error message
const GoogleRemove = require('../googleRemove')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../../test/serverless')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('RemoveDeployment', () => {
  let serverless
  let googleRemove
  let requestStub

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    serverless = new Serverless()
    serverless.service.service = 'my-service'
    serverless.service.provider = {
      project: 'my-project',
    }
    serverless.setProvider('google', new GoogleProvider(serverless))
    const options = {
      stage: 'dev',
      region: 'us-central1',
    }
    googleRemove = new GoogleRemove(serverless, options)
    requestStub = sinon.stub(googleRemove.provider, 'request')
  })

  // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
  afterEach(() => {
    googleRemove.provider.request.restore()
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#removeDeployment()', () => {
    let consoleLogStub
    let monitorDeploymentStub

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
      consoleLogStub = sinon.stub(googleRemove.serverless.cli, 'log').returns()
      monitorDeploymentStub = sinon.stub(googleRemove, 'monitorDeployment').returns(BbPromise.resolve())
    })

    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
      googleRemove.serverless.cli.log.restore()
      googleRemove.monitorDeployment.restore()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should remove and hand over to monitor the deployment', () => {
      const params = {
        project: 'my-project',
        deployment: 'sls-my-service-dev',
      }
      requestStub.returns(BbPromise.resolve())

      return googleRemove.removeDeployment().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(requestStub.calledWithExactly('deploymentmanager', 'deployments', 'delete', params)).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(monitorDeploymentStub.calledWithExactly('sls-my-service-dev', 'remove', 5000)).toEqual(true)
      })
    })
  })
})
