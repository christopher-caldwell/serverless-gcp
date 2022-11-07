import path from 'path'
import fs from 'fs'
import stdin from 'get-stdin'

import { GoogleInvokeLocal } from '..'

export const getDataAndContext = async function (this: GoogleInvokeLocal) {
  // unless asked to preserve raw input, attempt to parse any provided objects
  if (!this.options.raw) {
    if (this.options.data) {
      try {
        this.options.data = JSON.parse(this.options.data)
      } catch (exception) {
        // do nothing if it's a simple string or object already
      }
    }
    if (this.options.context) {
      try {
        this.options.context = JSON.parse(this.options.context)
      } catch (exception) {
        // do nothing if it's a simple string or object already
      }
    }
  }

  if (!this.options.data) {
    if (this.options.path) {
      await this.loadFileInOption(this.options.path, 'data')
    } else {
      try {
        this.options.data = await stdin()
      } catch (e) {
        // continue if no stdin was provided
      }
    }
  }

  if (!this.options.context && this.options.contextPath) {
    await this.loadFileInOption(this.options.contextPath, 'context')
  }
}

export const loadFileInOption = async function (this: GoogleInvokeLocal, filePath: string, optionKey: string) {
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
