import { makeTestSuite } from 'zoroaster'
import Context from '../context'
import router from '../../src'

const ts = makeTestSuite('test/result', {
  async getResults(input) {
    const res = await router({
      text: input,
    })
    return res
  },
  context: Context,
})

// export default ts