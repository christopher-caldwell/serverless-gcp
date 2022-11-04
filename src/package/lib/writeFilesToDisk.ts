import path from 'path'

import { GooglePackage } from '../'

export const saveCreateTemplateFile = function (this: GooglePackage) {
  const filePath = path.join(this.serverless.config.servicePath, '.serverless', 'configuration-template-create.yml')

  // @ts-expect-error compiledConfigurationTemplate
  const template = this.serverless.service.provider.compiledConfigurationTemplate as string
  this.serverless.utils.writeFileSync(filePath, template)
}

export const saveUpdateTemplateFile = function (this: GooglePackage) {
  const filePath = path.join(this.serverless.config.servicePath, '.serverless', 'configuration-template-update.yml')

  // @ts-expect-error compiledConfigurationTemplate
  const template = this.serverless.service.provider.compiledConfigurationTemplate as string

  this.serverless.utils.writeFileSync(filePath, template)
}
