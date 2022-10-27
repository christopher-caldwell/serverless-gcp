'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
const path = require('path')
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fse'.
const fse = require('fs-extra')

module.exports = {
  cleanupServerlessDir() {
    if (this.serverless.config.servicePath) {
      const serverlessDirPath = path.join(this.serverless.config.servicePath, '.serverless')

      if (fse.pathExistsSync(serverlessDirPath)) {
        fse.removeSync(serverlessDirPath)
      }
    }

    return BbPromise.resolve()
  },
}
