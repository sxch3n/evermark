import fileUtils from './fileUtils'
import logger from './logger'

const debug = require('debug')('config')

export const APP_NAME = 'Evermark'
export const APP_DB_NAME = 'evermark.db'
export const APP_CONFIG_NAME = 'evermark.json'

export function* getConfigPath() {
  const configPath = yield fileUtils.searchFile(APP_CONFIG_NAME)
  debug('configPath: %s', configPath)
  if (!configPath) {
    throw new Error('Please run `evermark init [destination]` to init a new Evermark folder')
  }
  return configPath
}

export function* readConfig() {
  const configPath = yield getConfigPath()

  let config = null
  try {
    const configStr = yield fileUtils.readFile(configPath)
    config = JSON.parse(configStr)
  } catch (e) {
    throw new Error(`Please write to ${configPath}:\n\n{\n  "token": "xxx",\n  "china": xxx\n}`, e)
  }

  if (!config.token) {
    throw new Error(`Please write developer token to ${configPath}\n\n` +
      'To get a developer token, please visit:\n  ' +
      'https://www.evernote.com/api/DeveloperToken.action or ' +
      'https://app.yinxiang.com/api/DeveloperToken.action')
  }

  debug('config: %o', config)
  return config
}

export function* getOrSetConfig(name, value) {
  const config = yield readConfig()

  if (!name) {
    logger.info(config)
    return
  }

  if (!value) {
    logger.info(`${name}: ${config[name]}`)
    return
  }

  const preValue = config[name]
  if (preValue === value) {
    logger.info(`The config ${name} is not changed: ${value}`)
    return
  }

  config[name] = value

  const configPath = yield getConfigPath()
  yield saveConfig(configPath, config)
}

export function* initConfig(destination = '.') {
  const config = { token: 'Your developer token', china: true }
  yield saveConfig(`${destination}/${APP_CONFIG_NAME}`, config)
  logger.info('Evermark folder has been initialized, you can add some notes now.')
}

function* saveConfig(file, config) {
  debug('file: %s', file)
  debug('config: %o', config)

  try {
    // Beautify json string and save to config file
    const configStr = JSON.stringify(config, null, 2)
    yield fileUtils.writeFile(file, configStr)
    logger.info(`Successfully saved config:\n\n${configStr}`)
  } catch (e) {
    throw new Error(e)
  }
}