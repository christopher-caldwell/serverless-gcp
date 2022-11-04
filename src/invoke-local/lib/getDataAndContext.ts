import path from 'path'
import fs from 'fs'
import stdin from 'get-stdin'
import { GoogleInvokeLocal } from '..'

export const getDataAndContext = async function (this: GoogleInvokeLocal) {
  // unless asked to preserve raw input, attempt to parse any provided objects
  //@ts-expect-error not on options
  if (!this.options.raw) {
    //@ts-expect-error not on options
    if (this.options.data) {
      try {
        //@ts-expect-error not on options
        this.options.data = JSON.parse(this.options.data)
      } catch (exception) {
        // do nothing if it's a simple string or object already
      }
    }
    //@ts-expect-error not on options
    if (this.options.context) {
      try {
        //@ts-expect-error not on options
        this.options.context = JSON.parse(this.options.context)
      } catch (exception) {
        // do nothing if it's a simple string or object already
      }
    }
  }

  //@ts-expect-error not on options
  if (!this.options.data) {
    //@ts-expect-error not on options
    if (this.options.path) {
      //@ts-expect-error not on options
      await this.loadFileInOption(this.options.path, 'data')
    } else {
      try {
        //@ts-expect-error not on options
        this.options.data = await stdin()
      } catch (e) {
        // continue if no stdin was provided
      }
    }
  }

  //@ts-expect-error not on options
  if (!this.options.context && this.options.contextPath) {
    //@ts-expect-error not on options
    await this.loadFileInOption(this.options.contextPath, 'context')
  }
}

export const loadFileInOption = async function (this: GoogleInvokeLocal, filePath: string, optionKey: string) {
  //@ts-expect-error serviceDir not on serverless
  const serviceDir = this.serverless.serviceDir as string
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(serviceDir, filePath)

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`The file you provided does not exist: ${absolutePath}`)
  }
  if (absolutePath.endsWith('.js')) {
    // to support js - export as an input data
    this.options[optionKey] = require(absolutePath)
    return
  }
  this.options[optionKey] = await this.serverless.utils.readFile(absolutePath)
}
