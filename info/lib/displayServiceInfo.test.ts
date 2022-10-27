'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'chalk'.
const chalk = require('chalk')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../../provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleInfo... Remove this comment to see the full error message
const GoogleInfo = require('../googleInfo')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../../test/serverless')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('DisplayServiceInfo', () => {
  let serverless
  let googleInfo

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    serverless = new Serverless()
    serverless.service.service = 'my-service'
    serverless.service.functions = {
      func1: {
        handler: 'handler',
        events: [{ http: 'foo' }],
      },
      func2: {
        handler: 'handler',
        events: [
          {
            event: {
              eventType: 'providers/cloud.pubsub/eventTypes/topic.publish',
              path: 'some/path',
              resource: 'projects/*/topics/my-test-topic',
            },
          },
        ],
      },
      'my-func3': {
        name: 'my-func3',
        handler: 'handler',
        events: [{ http: 'foo' }],
      },
    }
    serverless.service.provider = {
      project: 'my-project',
    }
    serverless.setProvider('google', new GoogleProvider(serverless))
    const options = {
      stage: 'dev',
      region: 'us-central1',
    }
    googleInfo = new GoogleInfo(serverless, options)
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#displayServiceInfo()', () => {
    let getResourcesStub
    let gatherDataStub
    let printInfoStub

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
      getResourcesStub = sinon.stub(googleInfo, 'getResources').returns(BbPromise.resolve())
      gatherDataStub = sinon.stub(googleInfo, 'gatherData').returns(BbPromise.resolve())
      printInfoStub = sinon.stub(googleInfo, 'printInfo').returns(BbPromise.resolve())
    })

    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
      googleInfo.getResources.restore()
      googleInfo.gatherData.restore()
      googleInfo.printInfo.restore()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should run promise chain', () =>
      googleInfo.displayServiceInfo().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(getResourcesStub.calledOnce).toEqual(true)
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(gatherDataStub.calledAfter(getResourcesStub))
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(printInfoStub.calledAfter(gatherDataStub))
      }))
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#getResources()', () => {
    let requestStub

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
      requestStub = sinon.stub(googleInfo.provider, 'request').returns(BbPromise.resolve())
    })

    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
      googleInfo.provider.request.restore()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should return a list with resources from the deployment', () =>
      googleInfo.getResources().then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(
          requestStub.calledWithExactly('deploymentmanager', 'resources', 'list', {
            project: 'my-project',
            deployment: 'sls-my-service-dev',
          }),
        ).toEqual(true)
      }))
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#gatherData()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should gather the relevant resource data', () => {
      const resources = {
        resources: [
          { type: 'resource.which.should.be.filterered', name: 'someResource' },
          {
            type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
            name: 'my-service-dev-func1',
          },
          {
            type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
            name: 'my-service-dev-func2',
          },
        ],
      }

      const expectedData = {
        service: 'my-service',
        project: 'my-project',
        stage: 'dev',
        region: 'us-central1',
        resources: {
          functions: [
            {
              name: 'func1',
              resource: 'https://us-central1-my-project.cloudfunctions.net/my-service-dev-func1',
            },
            {
              name: 'func2',
              resource: 'projects/*/topics/my-test-topic',
            },
          ],
        },
      }

      return googleInfo.gatherData(resources).then((data) => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(data).toEqual(expectedData)
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should gather the resource data when the function name is specified', () => {
      const resources = {
        resources: [
          { type: 'resource.which.should.be.filterered', name: 'someResource' },
          {
            type: 'gcp-types/cloudfunctions-v1:projects.locations.functions',
            name: 'my-func3',
          },
        ],
      }

      const expectedData = {
        service: 'my-service',
        project: 'my-project',
        stage: 'dev',
        region: 'us-central1',
        resources: {
          functions: [
            {
              name: 'my-func3',
              resource: 'https://us-central1-my-project.cloudfunctions.net/my-func3',
            },
          ],
        },
      }

      return googleInfo.gatherData(resources).then((data) => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(data).toEqual(expectedData)
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should resolve with empty data if resource type is not matching', () => {
      const resources = {
        resources: [{ type: 'resource.which.should.be.filterered', name: 'someResource' }],
      }

      const expectedData = {
        service: 'my-service',
        project: 'my-project',
        stage: 'dev',
        region: 'us-central1',
        resources: {
          functions: [],
        },
      }

      return googleInfo.gatherData(resources).then((data) => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(data).toEqual(expectedData)
      })
    })
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#printInfo()', () => {
    let consoleLogStub

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
      consoleLogStub = sinon.stub(googleInfo.serverless.cli, 'consoleLog').returns()
    })

    // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
    afterEach(() => {
      googleInfo.serverless.cli.consoleLog.restore()
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should print relevant data on the console', () => {
      const gatheredData = {
        service: 'my-service',
        project: 'my-project',
        stage: 'dev',
        region: 'us-central1',
        resources: {
          functions: [
            {
              name: 'func1',
              resource: 'https://us-central1-my-project.cloudfunctions.net/my-service-dev-func1',
            },
            {
              name: 'func2',
              resource: 'projects/*/topics/my-test-topic',
            },
          ],
        },
      }

      let expectedOutput = ''
      expectedOutput += `${chalk.yellow.underline('Service Information')}\n`
      expectedOutput += `${chalk.yellow('service:')} my-service\n`
      expectedOutput += `${chalk.yellow('project:')} my-project\n`
      expectedOutput += `${chalk.yellow('stage:')} dev\n`
      expectedOutput += `${chalk.yellow('region:')} us-central1\n`

      expectedOutput += '\n'

      expectedOutput += `${chalk.yellow.underline('Deployed functions')}\n`
      expectedOutput += `${chalk.yellow('func1')}\n`
      expectedOutput += '  https://us-central1-my-project.cloudfunctions.net/my-service-dev-func1\n'
      expectedOutput += `${chalk.yellow('func2')}\n`
      expectedOutput += '  projects/*/topics/my-test-topic\n'

      return googleInfo.printInfo(gatheredData).then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledWithExactly(expectedOutput)).toEqual(true)
      })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should print an info if functions are not yet deployed', () => {
      const gatheredData = {
        service: 'my-service',
        project: 'my-project',
        stage: 'dev',
        region: 'us-central1',
        resources: {
          functions: [],
        },
      }

      let expectedOutput = ''
      expectedOutput += `${chalk.yellow.underline('Service Information')}\n`
      expectedOutput += `${chalk.yellow('service:')} my-service\n`
      expectedOutput += `${chalk.yellow('project:')} my-project\n`
      expectedOutput += `${chalk.yellow('stage:')} dev\n`
      expectedOutput += `${chalk.yellow('region:')} us-central1\n`

      expectedOutput += '\n'

      expectedOutput += `${chalk.yellow.underline('Deployed functions')}\n`
      expectedOutput += 'There are no functions deployed yet\n'

      return googleInfo.printInfo(gatheredData).then(() => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(consoleLogStub.calledWithExactly(expectedOutput)).toEqual(true)
      })
    })
  })
})
