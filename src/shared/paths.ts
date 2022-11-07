import path from 'path'

import { GoogleFunctionDefinition } from './types'
import { _Plugin } from './utils'

export const getFunctionPath = function (this: _Plugin, functionObj: GoogleFunctionDefinition) {
  // index.js and function.js are the two files supported by default by a cloud-function
  // TODO add the file pointed by the main key of the package.json
  const serviceDir = this.serverless.serviceDir
  // const paths = ['index.js', 'function.js'].map((fileName) => path.join(serviceDir, fileName))
  const [sourcePath, handlerName = 'event'] = functionObj.handler.split('.')
  const fullPath = path.join(serviceDir, sourcePath)
  if (!fullPath) {
    throw new Error(`Failed to join paths to the targeted function`)
  }
  if (handlerName !== 'event' && handlerName !== 'http') {
    throw new Error(
      `The only supported function names are "event" and "http". You provided ${handlerName}. 
      
Blame Google, not me.`,
    )
  }

  const handlerContainer = tryToRequirePaths(fullPath)
  if (!handlerContainer) {
    throw new Error(`Failed to require ${fullPath}`)
  }

  return {
    handlerName,
    fullPath,
    handlerContainer,
  }
}

/** Returns the module for the handler. */
const tryToRequirePaths = (path: string) => {
  try {
    return require(path) as Record<string, any>
  } catch (e) {
    // pass
  }
}
