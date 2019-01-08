import { resolve } from 'path'
import { debuglog } from 'util'
import read from '@wrote/read'
import write from '@wrote/write'

const LOG = debuglog('@idio/router')

const FIXTURE = resolve(__dirname, '../fixture')

/**
 * A testing context for the package.
 */
export default class Context {
  async _init() {
    LOG('init context')
  }
  get routesDir() {
    return 'test/fixture/routes'
  }
  get routesDirModules() {
    return 'test/fixture/routes-modules'
  }
  get routesDirWithFiles() {
    return 'test/fixture/routes-with-files'
  }
  /**
   * Update the file's content.
   */
  async update(path, ...args) {
    const c = await read(path)
    const cc = c.replace(...args)
    await write(path, cc)
  }
  /**
   * Example method.
   */
  example() {
    return 'OK'
  }
  /**
   * Path to the fixture file.
   */
  get FIXTURE() {
    return resolve(FIXTURE, 'test.txt')
  }
  get SNAPSHOT_DIR() {
    return resolve(__dirname, '../snapshot')
  }
  async _destroy() {
    LOG('destroy context')
  }
}