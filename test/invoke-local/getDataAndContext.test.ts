'use strict'

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'sinon'.
const sinon = require('sinon')

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('../../provider/googleProvider')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GoogleInvo... Remove this comment to see the full error message
const GoogleInvokeLocal = require('../googleInvokeLocal')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('../../test/serverless')

jest.mock('get-stdin')

describe('getDataAndContext', () => {
  let serverless
  let googleInvokeLocal
  let loadFileInOptionStub

  beforeEach(() => {
    serverless = new Serverless()
    serverless.setProvider('google', new GoogleProvider(serverless))
    googleInvokeLocal = new GoogleInvokeLocal(serverless, {})
    loadFileInOptionStub = sinon.stub(googleInvokeLocal, 'loadFileInOption').resolves()
  })

  afterEach(() => {
    googleInvokeLocal.loadFileInOption.restore()
  })

  describe.each`
    key          | pathKey
    ${'data'}    | ${'path'}
    ${'context'} | ${'contextPath'}
  `('$key', ({ key, pathKey }) => {
    it('should keep the raw value if the value exist and there is the raw option', async () => {
      const rawValue = Symbol('rawValue')
      googleInvokeLocal.options[key] = rawValue
      googleInvokeLocal.options.raw = true
      await googleInvokeLocal.getDataAndContext()
      expect(googleInvokeLocal.options[key]).toEqual(rawValue)
    })

    it('should keep the raw value if the value exist and is not a valid JSON', async () => {
      const rawValue = 'rawValue'
      googleInvokeLocal.options[key] = rawValue
      await googleInvokeLocal.getDataAndContext()
      expect(googleInvokeLocal.options[key]).toEqual(rawValue)
    })

    it('should parse the raw value if the value exist and is a stringified JSON', async () => {
      googleInvokeLocal.options[key] = '{"attribute":"value"}'
      await googleInvokeLocal.getDataAndContext()
      expect(googleInvokeLocal.options[key]).toEqual({ attribute: 'value' })
    })

    it('should load the file from the provided path if it exists', async () => {
      const path = 'path'
      googleInvokeLocal.options[pathKey] = path
      await googleInvokeLocal.getDataAndContext()
      expect(loadFileInOptionStub.calledOnceWith(path, key)).toEqual(true)
    })

    it('should not load the file from the provided path if the key already exists', async () => {
      const rawValue = Symbol('rawValue')
      googleInvokeLocal.options[key] = rawValue
      googleInvokeLocal.options[pathKey] = 'path'

      await googleInvokeLocal.getDataAndContext()

      expect(loadFileInOptionStub.notCalled).toEqual(true)
      expect(googleInvokeLocal.options[key]).toEqual(rawValue)
    })
  })
})
