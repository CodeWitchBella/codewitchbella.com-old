import { useEffect, useRef, useState } from 'react'
import * as Comlink from 'comlink'
import fde from 'fast-deep-equal'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useWorkerizedStepper<OutData = any, InData = any>(
  modPath: string,
  fn: string,
  inputData: InData,
) {
  const [state, setState] = useState({
    data: null as OutData | null,
    last: true,
    first: true,
  })
  const instance = useRef({} as { next?: () => void; back?: () => void })
    .current

  const callbacks = useRef({
    next() {
      instance?.next?.()
    },
    back() {
      instance?.back?.()
    },
  }).current

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let obj: any = Comlink.wrap(new Worker('/worker.js', { type: 'module' }))
    const history: OutData[] = []
    let historyPtr = 0

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    let triggerNext = () => {}

    instance.next = () => {
      if (history.length - 1 > historyPtr) {
        historyPtr++
        updateState()
      } else if (obj) {
        triggerNext()
      }
    }
    instance.back = () => {
      if (historyPtr > 0) {
        historyPtr--
        updateState()
      }
    }
    ;(async () => {
      await obj.init(modPath, fn)
      await obj.setData(inputData)
      let autostep = true
      while (true) {
        if (!autostep) {
          // eslint-disable-next-line no-loop-func
          await new Promise<void>((resolve) => {
            triggerNext = resolve
          })
        }
        autostep = false
        const { done, data } = await obj.next()
        if (data && !fde(data, history[history.length - 1])) {
          history.push(data)
          if (historyPtr === history.length - 2) {
            historyPtr++
          }
        } else {
          autostep = true
        }
        if (done) {
          obj[Comlink.releaseProxy]()
          obj = null
        }
        updateState()
        if (done) break
      }
    })()

    return () => {
      if (obj) obj[Comlink.releaseProxy]()
    }

    function updateState() {
      setState({
        data: history[historyPtr],
        last: !obj && history.length - 1 === historyPtr,
        first: historyPtr === 0,
      })
    }
  }, [fn, inputData, instance, modPath])
  return [state, callbacks] as const
}
