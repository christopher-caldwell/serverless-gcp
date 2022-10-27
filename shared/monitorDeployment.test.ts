'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'monitorDep... Remove this comment to see the full error message
const monitorDeployment = require('./monitorDeployment')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../test/serverless')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleComm... Remove this comment to see the full error message
const GoogleCommand = require('../test/googleCommand')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('MonitorDeployment', () => {
  let serverless
  let googleCommand
  let consoleLogStub
  let requestStub

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    serverless = new Serverless()
    serverless.service = {
      service: 'my-service',
    }
    serverless.service.provider = {
      project: 'my-project',
    }
    const options = {
      stage: 'dev',
      region: 'us-central1',
    }
    serverless.setProvider('google', new GoogleProvider(serverless))
    googleCommand = new GoogleCommand(serverless, options, monitorDeployment)
    consoleLogStub = sinon.stub(googleCommand.serverless.cli, 'log').returns()
    requestStub = sinon.stub(googleCommand.provider, 'request')
  })

  // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
  afterEach(() => {
    googleCommand.serverless.cli.log.restore()
    googleCommand.provider.request.restore()
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#monitorDeployment()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('when monitoring creations or updates', () => {
      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('should keep monitoring until "DONE" status is reached', () => {
        const deploymentName = 'sls-my-service-dev'
        const response1 = {
          deployments: [
            {
              name: deploymentName,
              operation: {
                status: 'RUNNING',
              },
            },
          ],
        }
        const response2 = {
          deployments: [
            {
              name: deploymentName,
              operation: {
                status: 'DONE',
              },
            },
          ],
        }

        requestStub.onCall(0).returns(BbPromise.resolve(response1))
        requestStub.onCall(1).returns(BbPromise.resolve(response2))

        return googleCommand.monitorDeployment(deploymentName, 'create', 10).then((deploymentStatus) => {
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(consoleLogStub.called).toEqual(true)
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(
            requestStub.calledWithExactly('deploymentmanager', 'deployments', 'list', {
              project: 'my-project',
            }),
          ).toEqual(true)
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(deploymentStatus).toEqual('DONE')
        })
      })

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('should throw an error if deployment errors out', () => {
        const deploymentName = 'sls-my-service-dev'
        const response = {
          deployments: [
            {
              name: deploymentName,
              operation: {
                error: {
                  errors: [
                    {
                      code: 'ERROR',
                      message: '{ "ResourceErrorMessage": { "details": [ "Error detail"] } }',
                    },
                  ],
                },
              },
            },
          ],
        }

        requestStub.returns(BbPromise.resolve(response))

        return googleCommand.monitorDeployment(deploymentName, 'update', 10).catch((error) => {
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(consoleLogStub.called).toEqual(true)
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(
            requestStub.calledWithExactly('deploymentmanager', 'deployments', 'list', {
              project: 'my-project',
            }),
          ).toEqual(true)
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(error.toString()).toMatch(/Error detail/)
        })
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('when monitoring removals', () => {
      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('should stop if there are no deployments and the action is "remove"', () => {
        const deploymentName = 'sls-my-service-dev'
        const response = {}

        requestStub.returns(BbPromise.resolve(response))

        return googleCommand.monitorDeployment(deploymentName, 'remove', 10).then((deploymentStatus) => {
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(consoleLogStub.called).toEqual(true)
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(
            requestStub.calledWithExactly('deploymentmanager', 'deployments', 'list', {
              project: 'my-project',
            }),
          ).toEqual(true)
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(deploymentStatus).toEqual('DONE')
        })
      })

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it('should stop if the deployment is unavailable and the action is "remove"', () => {
        const deploymentName = 'sls-my-service-dev'
        const response = {
          deployments: [{ name: 'a-different-deployment' }],
        }

        requestStub.returns(BbPromise.resolve(response))

        return googleCommand.monitorDeployment(deploymentName, 'remove', 10).then((deploymentStatus) => {
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(consoleLogStub.called).toEqual(true)
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(
            requestStub.calledWithExactly('deploymentmanager', 'deployments', 'list', {
              project: 'my-project',
            }),
          ).toEqual(true)
          // @ts-expect-error TS(2304): Cannot find name 'expect'.
          expect(deploymentStatus).toEqual('DONE')
        })
      })
    })
  })
})
