'use strict'

const GoogleIndex = require('./index')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('./provider/googleProvider')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GooglePack... Remove this comment to see the full error message
const GooglePackage = require('./package/googlePackage')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GoogleDepl... Remove this comment to see the full error message
const GoogleDeploy = require('./deploy/googleDeploy')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GoogleRemo... Remove this comment to see the full error message
const GoogleRemove = require('./remove/googleRemove')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GoogleInvo... Remove this comment to see the full error message
const GoogleInvoke = require('./invoke/googleInvoke')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GoogleLogs... Remove this comment to see the full error message
const GoogleLogs = require('./logs/googleLogs')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'GoogleInfo... Remove this comment to see the full error message
const GoogleInfo = require('./info/googleInfo')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('./test/serverless')

describe('GoogleIndex', () => {
  let serverless
  let options
  let googleIndex

  beforeEach(() => {
    serverless = new Serverless()
    options = {
      stage: 'my-stage',
      region: 'my-region',
    }
    googleIndex = new GoogleIndex(serverless, options)
  })

  describe('#constructor()', () => {
    it('should set the serverless instance', () => {
      expect(googleIndex.serverless).toEqual(serverless)
    })

    it('should set options if provided', () => {
      expect(googleIndex.options).toEqual(options)
    })

    it('should add all the plugins to the Serverless PluginManager', () => {
      const addedPlugins = serverless.plugins

      expect(addedPlugins).toContain(GoogleProvider)
      expect(addedPlugins).toContain(GooglePackage)
      expect(addedPlugins).toContain(GoogleDeploy)
      expect(addedPlugins).toContain(GoogleRemove)
      expect(addedPlugins).toContain(GoogleInvoke)
      expect(addedPlugins).toContain(GoogleLogs)
      expect(addedPlugins).toContain(GoogleInfo)
    })
  })
})
