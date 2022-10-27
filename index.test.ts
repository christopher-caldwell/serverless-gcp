'use strict'

const GoogleIndex = require('./index')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleProv... Remove this comment to see the full error message
const GoogleProvider = require('./provider/googleProvider')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GooglePack... Remove this comment to see the full error message
const GooglePackage = require('./package/googlePackage')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleDepl... Remove this comment to see the full error message
const GoogleDeploy = require('./deploy/googleDeploy')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleRemo... Remove this comment to see the full error message
const GoogleRemove = require('./remove/googleRemove')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleInvo... Remove this comment to see the full error message
const GoogleInvoke = require('./invoke/googleInvoke')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleLogs... Remove this comment to see the full error message
const GoogleLogs = require('./logs/googleLogs')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'GoogleInfo... Remove this comment to see the full error message
const GoogleInfo = require('./info/googleInfo')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'Serverless... Remove this comment to see the full error message
const Serverless = require('./test/serverless')

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('GoogleIndex', () => {
  let serverless
  let options
  let googleIndex

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    serverless = new Serverless()
    options = {
      stage: 'my-stage',
      region: 'my-region',
    }
    googleIndex = new GoogleIndex(serverless, options)
  })

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('#constructor()', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set the serverless instance', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleIndex.serverless).toEqual(serverless)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should set options if provided', () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(googleIndex.options).toEqual(options)
    })

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('should add all the plugins to the Serverless PluginManager', () => {
      const addedPlugins = serverless.plugins

      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(addedPlugins).toContain(GoogleProvider)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(addedPlugins).toContain(GooglePackage)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(addedPlugins).toContain(GoogleDeploy)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(addedPlugins).toContain(GoogleRemove)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(addedPlugins).toContain(GoogleInvoke)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(addedPlugins).toContain(GoogleLogs)
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(addedPlugins).toContain(GoogleInfo)
    })
  })
})
