import * as Comlink from 'https://unpkg.com/comlink/dist/esm/comlink.mjs'

async function init(Module, fn) {
  let started = false
  return {
    setData(data) {
      Module.input_data = data
    },
    async next() {
      let prom = new Promise((resolve) => {
        Module.step_finished = resolve
      })
      if (started) {
        Module.resume()
      } else {
        started = true
        Module[fn]()
      }
      return await prom
    },
    getData() {
      return Module.step_data
    },
  }
}

let ref

Comlink.expose({
  async init(path, fn) {
    const Factory = (await import(path)).default
    const Module = await Factory()
    ref = await init(Module, fn)
  },
  async setData(data) {
    ref.setData(JSON.stringify(data))
  },
  async next(data) {
    return {
      done: await ref.next(),
      data: ref.getData(),
    }
  },
})
