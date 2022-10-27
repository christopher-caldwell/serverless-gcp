'use strict'

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require('fs')
// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require('path')

// @ts-expect-error TS(2451) FIXME: Cannot redeclare block-scoped variable 'BbPromise'... Remove this comment to see the full error message
const BbPromise = require('bluebird')

module.exports = {
  updateDeployment() {
    return BbPromise.bind(this).then(this.getDeployment).then(this.update)
  },

  getDeployment() {
    const params = {
      project: this.serverless.service.provider.project,
    }

    return this.provider.request('deploymentmanager', 'deployments', 'list', params).then((response) => {
      const deployment = response.deployments.find((dep) => {
        const name = `sls-${this.serverless.service.service}-${this.options.stage}`
        return dep.name === name
      })

      return deployment
    })
  },

  update(deployment) {
    this.serverless.cli.log('Updating deployment...')

    const filePath = path.join(this.serverless.config.servicePath, '.serverless', 'configuration-template-update.yml')

    const deploymentName = `sls-${this.serverless.service.service}-${this.options.stage}`

    const params = {
      project: this.serverless.service.provider.project,
      deployment: deploymentName,
      resource: {
        name: deploymentName,
        fingerprint: deployment.fingerprint,
        target: {
          config: {
            content: fs.readFileSync(filePath).toString(),
          },
        },
      },
    }

    return this.provider
      .request('deploymentmanager', 'deployments', 'update', params)
      .then(() => this.monitorDeployment(deploymentName, 'update', 5000))
  },
}
