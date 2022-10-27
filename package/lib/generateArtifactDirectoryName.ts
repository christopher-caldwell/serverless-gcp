'use strict'

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

module.exports = {
  generateArtifactDirectoryName() {
    const date = new Date()
    const serviceWithStage = `${this.serverless.service.service}/${this.options.stage}`
    const dateString = `${date.getTime().toString()}-${date.toISOString()}`

    this.serverless.service.package.artifactDirectoryName = `serverless/${serviceWithStage}/${dateString}`

    return BbPromise.resolve()
  },
}
