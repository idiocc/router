/* yarn example/ */
import router from '../src'

(async () => {
  const res = await router({
    text: 'example',
  })
  console.log(res)
})()