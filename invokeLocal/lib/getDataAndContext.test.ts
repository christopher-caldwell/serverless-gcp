'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../../provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleInvo... Remove this comment to see the full error message
const GoogleInvokeLocal = require('../googleInvokeLocal')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../../test/serverless')

// @ts-expect-error TS(2304): Cannot find name 'jest'.
jest.mock('get-stdin')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('getDataAndContext', () => {
  let serverless
  let googleInvokeLocal
  let loadFileInOptionStub

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    serverless = new Serverless()
    serverless.setProvider('google', new GoogleProvider(serverless))
    googleInvokeLocal = new GoogleInvokeLocal(serverless, {})
    loadFileInOptionStub = sinon.stub(googleInvokeLocal, 'loadFileInOption').resolves()
  })

  // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
  afterEach(() => {
    googleInvokeLocal.loadFileInOption.restore()
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe.each`
    key          | pathKey
    ${'data'}    | ${'path'}
    ${'context'} | ${'contextPath'}
  `('$key', ({ key, pathKey }) => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should keep the raw value if the value exist and there is the raw option', async () => {
      const rawValue = Symbol('rawValue')
      googleInvokeLocal.options[key] = rawValue
      googleInvokeLocal.options.raw = true
      await googleInvokeLocal.getDataAndContext()
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleInvokeLocal.options[key]).toEqual(rawValue)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should keep the raw value if the value exist and is not a valid JSON', async () => {
      const rawValue = 'rawValue'
      googleInvokeLocal.options[key] = rawValue
      await googleInvokeLocal.getDataAndContext()
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleInvokeLocal.options[key]).toEqual(rawValue)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should parse the raw value if the value exist and is a stringified JSON', async () => {
      googleInvokeLocal.options[key] = '{"attribute":"value"}'
      await googleInvokeLocal.getDataAndContext()
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleInvokeLocal.options[key]).toEqual({ attribute: 'value' })
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should load the file from the provided path if it exists', async () => {
      const path = 'path'
      googleInvokeLocal.options[pathKey] = path
      await googleInvokeLocal.getDataAndContext()
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(loadFileInOptionStub.calledOnceWith(path, key)).toEqual(true)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should not load the file from the provided path if the key already exists', async () => {
      const rawValue = Symbol('rawValue')
      googleInvokeLocal.options[key] = rawValue
      googleInvokeLocal.options[pathKey] = 'path'

      await googleInvokeLocal.getDataAndContext()

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(loadFileInOptionStub.notCalled).toEqual(true)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleInvokeLocal.options[key]).toEqual(rawValue)
    })
  })
})
