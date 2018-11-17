import { equal, ok } from 'zoroaster/assert'
import Context from '../context'
import router from '../../src'

/** @type {Object.<string, (c: Context)>} */
const T = {
  context: Context,
  'is a function'() {
    equal(typeof router, 'function')
  },
  async 'calls package without error'() {
    await router()
  },
  async 'gets a link to the fixture'({ FIXTURE }) {
    const res = await router({
      text: FIXTURE,
    })
    ok(res, FIXTURE)
  },
}

export default T