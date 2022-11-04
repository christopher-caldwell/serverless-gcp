import BbPromise from 'bluebird'
import path from 'path'
import fse from 'fs-extra'

import { GooglePackage } from '..'

export function cleanupServerlessDir(this: GooglePackage) {
  if (this.serverless.config.servicePath) {
    const serverlessDirPath = path.join(this.serverless.config.servicePath, '.serverless')

    if (fse.pathExistsSync(serverlessDirPath)) {
      fse.removeSync(serverlessDirPath)
    }
  }

  return BbPromise.resolve()
}
