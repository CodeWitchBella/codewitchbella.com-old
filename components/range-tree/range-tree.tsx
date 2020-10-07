/** @jsx jsx */
import { jsx } from '@emotion/react'
import {
  createContext,
  Dispatch,
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import Resizer from '@codewitchbella/react-resizer'

type Point = { x: number; y: number; id: number }
type Points = readonly Point[]
type Highlight = {
  layer: number
  id: number
  path: readonly ('left' | 'right')[]
}

type StateBase = {
  points: Points
  highlight: Highlight
  query: { xmin: number; xmax: number; ymin: number; ymax: number }
  results: readonly number[]
}
type StatePrev = StateBase & { historyPrev: StatePrev | null }
type StateNext = StateBase & { historyNext: StateNext | null }
type State = StateBase & {
  historyPrev: StatePrev | null
  historyNext: StateNext | null
}
const initialState: State = {
  points: [],
  highlight: {
    layer: 0,
    id: 0,
    path: [],
  },
  query: { xmin: 0, xmax: 0, ymin: 0, ymax: 0 },
  results: [],
  historyPrev: null,
  historyNext: null,
}

type BaseAction =
  | { type: 'setPoints'; points: Points }
  | { type: 'addPoint'; point: { x: number; y: number } }
  | { type: 'highlightGoLeft' }
  | { type: 'highlightGoRight' }
  | { type: 'highlightReset' }
  | { type: 'loadExample' }
  | { type: 'pushResult'; result: number }
  | { type: 'querySet'; key: keyof StateBase['query']; value: number }
type Action = BaseAction | { type: 'undo' } | { type: 'redo' }

function baseReducer(state: StateBase, action: Action): StateBase {
  if (action.type === 'setPoints') {
    return { ...state, points: action.points, results: [] }
  }
  if (action.type === 'addPoint') {
    const maxId = state.points.reduce((a, b) => Math.max(a, b.id), 0)
    return {
      ...state,
      points: [...state.points, { ...action.point, id: maxId + 1 }],
      results: [],
    }
  }
  if (action.type === 'querySet') {
    return { ...state, query: { ...state.query, [action.key]: action.value } }
  }
  if (action.type === 'highlightGoLeft') {
    const h = state.highlight
    return {
      ...state,
      highlight: {
        ...h,
        path: [...h.path, 'left'],
        layer: h.layer + 1,
        id: h.id * 2,
      },
    }
  }
  if (action.type === 'highlightGoRight') {
    const h = state.highlight
    return {
      ...state,
      highlight: {
        ...h,
        path: [...h.path, 'right'],
        layer: h.layer + 1,
        id: h.id * 2 + 1,
      },
    }
  }
  if (action.type === 'highlightReset') {
    return {
      ...state,
      highlight: initialState.highlight,
    }
  }
  if (action.type === 'loadExample') {
    return {
      ...state,
      highlight: initialState.highlight,
      points: [
        [3, 7],
        [4, 6],
        [6, 5],
        [1, 4],
        [5, 3],
        [2, 2],
        [7, 1],
        [0, 0],
      ].map(([x, y], i) => ({ x, y, id: i + 1 })),
      results: [],
    }
  }
  throw new Error('Unknown action')
}

function historicReducer(cur: State, action: Action): State {
  if (action.type === 'undo') {
    const prev = cur.historyPrev
    if (!prev) return cur
    const { historyPrev: deleted, ...next } = cur
    return { ...prev, historyNext: next }
  }
  if (action.type === 'redo') {
    const next = cur.historyNext
    if (!next) return cur
    const { historyNext: deleted, ...prev } = cur
    return { ...next, historyPrev: prev }
  }
  const next = baseReducer(cur, action)
  const { historyNext: deleted, ...prev } = cur
  return {
    ...next,
    historyPrev: prev,
    historyNext: null,
  }
}

const dispatchContext = createContext<Dispatch<Action> | null>(null)
function useDispatch() {
  const dispatch = useContext(dispatchContext)
  if (!dispatch) throw new Error('Missing dispatch')
  return dispatch
}

const stateContext = createContext<State | null>(null)
function useCtxState() {
  const state = useContext(stateContext)
  if (!state) throw new Error('Missing state')
  return state
}

export function RangeTree() {
  const [state, dispatch] = useReducer(historicReducer, initialState)
  const { points, highlight } = state
  const bbst = useMemo(() => makeBBST(points), [points])
  const fractal = useMemo(() => makeFractal(points), [points])
  return (
    <stateContext.Provider value={state}>
      <dispatchContext.Provider value={dispatch}>
        <div>
          <button
            type="button"
            onClick={() => dispatch({ type: 'setPoints', points: [] })}
          >
            Remove all points
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'undo' })}
            disabled={!state.historyPrev}
          >
            Undo
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'redo' })}
            disabled={!state.historyNext}
          >
            Redo
          </button>
          <PointInput
            onPoint={(point) => {
              dispatch({ type: 'addPoint', point })
            }}
          />
          <button
            type="button"
            onClick={() => {
              dispatch({ type: 'loadExample' })
            }}
          >
            Load example
          </button>
          <PointChart points={points} />
          <div>
            Query:
            <div>
              <QueryField field="ymin" />
              <QueryField field="ymax" />
            </div>
            <div>
              <QueryField field="xmin" />
              <QueryField field="xmax" />
            </div>
          </div>
          <div>
            Highlight:
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'highlightGoLeft' })
              }}
            >
              Left
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'highlightGoRight' })
              }}
            >
              Right
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'highlightReset' })
              }}
            >
              Reset highlight
            </button>
          </div>
          <div css={{ display: 'flex' }}>
            <BBSTView bbst={bbst} highlight={highlight} />
            <Fractal fractal={fractal} highlight={highlight} />
          </div>
          <div>
            <div>Results: {JSON.stringify(state.results)}</div>
          </div>
        </div>
      </dispatchContext.Provider>
    </stateContext.Provider>
  )
}

function QueryField({ field }: { field: keyof State['query'] }) {
  const value = useCtxState().query[field]
  const dispatch = useDispatch()
  return (
    <label>
      {field}
      {': '}
      <input
        type="number"
        value={value}
        onChange={(evt) => {
          const next = Number.parseInt(evt.target?.value, 10)
          if (Number.isInteger(next))
            dispatch({ type: 'querySet', key: field, value: next })
        }}
        css={{ width: '5ch' }}
      />
    </label>
  )
}

// eslint-disable-next-line @typescript-eslint/ban-types
type FractalNode<Ext = {}> = Ext & {
  left: FractalNode<Ext> | null
  right: FractalNode<Ext> | null
  sibRight: FractalNode<Ext> | null
  value: number
}

function makeFractal(points: Points) {
  type FractalNodeWork = FractalNode<{ x: number; id: number }>
  let layer = [...points]
    .sort(({ x: a }, { x: b }) => a - b)
    .map(
      (point): FractalNodeWork => ({
        x: point.x,
        value: point.y,
        id: point.id,
        left: null,
        right: null,
        sibRight: null,
      }),
    )

  const layers: FractalNode[][] = [layer]
  while (layer.length > 1) {
    const newLayer: FractalNodeWork[] = []
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i]
      const right: FractalNodeWork | null = layer[i + 1] ?? null
      const nodes = [...getFractalValues(left), ...getFractalValues(right)]
        .sort(({ value: a }, { value: b }) => a - b)
        .map(
          (node, i, list): FractalNodeWork => ({
            ...node,
            // this could be more optimal but :shrug:
            left: findFirstSameOrLarger(left, node.value),
            right: findFirstSameOrLarger(right, node.value),
          }),
        )
      let j = 0
      for (const node of nodes) {
        node.sibRight = nodes[++j] ?? null
      }
      newLayer.push(nodes[0])
    }
    layers.push(newLayer)
    layer = newLayer
  }
  for (const l of layers) {
    for (const n of l) {
      delete (n as any).x
    }
  }
  return { layers: layers.reverse(), root: layer[0] }
}

function Fractal({
  fractal,
  highlight,
}: {
  fractal: ReturnType<typeof makeFractal>
  highlight: Highlight
}) {
  const state = useCtxState()
  const highlightedNode = findHighlightedNode(
    fractal,
    highlight,
    state.query.ymin,
  )
  return (
    <div
      css={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
    >
      {fractal.layers.map((layer, layerKey) => (
        <div
          key={layerKey}
          css={{
            display: 'flex',
            justifyContent: 'space-evenly',
            gap: '.25rem',
          }}
        >
          {layer.map((layerStart, ni) => (
            <div key={ni}>
              [
              {getFractalNodes(layerStart).map((node, i, list) => (
                <>
                  <span
                    css={
                      node === highlightedNode ? { background: 'yellow' } : {}
                    }
                  >
                    {node.value}
                  </span>
                  {i !== list.length - 1 ? ',' : null}
                </>
              ))}
              ]
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
function findHighlightedNode(
  fractal: ReturnType<typeof makeFractal>,
  highlight: Highlight,
  ymin: number,
): FractalNode | null {
  let start: FractalNode | null = fractal.root
  while (start && start.value < ymin) {
    start = start.sibRight
  }
  if (!start) return null

  return highlight.path.reduce<FractalNode | null>(
    (v, cur) => v?.[cur] ?? null,
    start,
  )
}

function findFirstSameOrLarger<T>(node: FractalNode<T>, value: number) {
  for (let n: FractalNode<T> | null = node; n; n = n.sibRight) {
    if (n.value >= value) return n
  }
  return null
}

function getFractalValues<T>(a: FractalNode<T> | null): FractalNode<T>[] {
  return getFractalNodes(a).map((node) => ({
    ...node,
    left: null,
    right: null,
    sibRight: null,
  }))
}

function getFractalNodes<T>(a: FractalNode<T> | null): FractalNode<T>[] {
  const nodes: FractalNode<T>[] = []
  for (let node: FractalNode<T> | null = a; node; node = node.sibRight) {
    nodes.push(node)
  }
  return nodes
}

type BBSTNode = { value: number; left: BBSTNode | null; right: BBSTNode | null }

function makeBBST(points: Points) {
  let layer = points
    .map(({ x }): BBSTNode => ({ value: x, left: null, right: null }))
    .sort(({ value: a }, { value: b }) => a - b)
  const layers: BBSTNode[][] = [layer]
  while (layer.length > 1) {
    const newLayer: BBSTNode[] = []
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i]
      const right = i + 1 >= layer.length ? null : layer[i + 1]
      newLayer.push({ value: findMax(left) ?? left.value, left, right })
    }
    layers.unshift(newLayer)
    layer = newLayer
  }
  return { root: layer[0], layers }
}

function findMax(node: BBSTNode | null): number | null {
  if (!node) return null
  return Math.max(
    node.value,
    findMax(node.left) ?? Number.NEGATIVE_INFINITY,
    findMax(node.right) ?? Number.NEGATIVE_INFINITY,
  )
}

function BBSTView({
  bbst,
  highlight,
}: {
  bbst: ReturnType<typeof makeBBST>
  highlight: Highlight
}) {
  return (
    <div css={{ display: 'flex' }}>
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        {bbst.layers.map((layer, li) => (
          <div
            key={li}
            css={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '.5rem',
            }}
          >
            <span />
            {layer.map((node, ni) => (
              <span
                key={ni}
                css={
                  highlight.layer === li && highlight.id === ni
                    ? { background: 'yellow' }
                    : {}
                }
              >
                {node.value}
              </span>
            ))}
            <span />
          </div>
        ))}
      </div>
    </div>
  )
}

let isSSR = true
function useSSR() {
  const [localIsSSR, setState] = useState(isSSR)
  useEffect(() => {
    if (localIsSSR) {
      setState(false)
      isSSR = true
    }
  }, [localIsSSR])
  return localIsSSR
}

function PointChart({ points }: { points: Points }) {
  const label = useRef<HTMLDivElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const [labelValue, setLabelValue] = useState('')
  const bbRef = useRef<{ time: number; bb: DOMRect }>()

  if (useSSR()) return null
  const xmax = points.reduce((b, { x: a }) => Math.max(a, b), 1)
  const ymax = points.reduce((b, { y: a }) => Math.max(a, b), 1)

  return (
    <Resizer
      direction="horizontal"
      style={{
        width: 200,
        position: 'relative',
      }}
      ref={wrap}
      css={{
        '&:hover .label': {
          display: 'block',
        },
      }}
    >
      <svg
        style={{
          left: 0,
          right: 0,
          position: 'absolute',
          background: 'lightgray',
        }}
        viewBox={`-1 -1 ${xmax + 2} ${ymax + 2}`}
        onPointerMove={(evt) => {
          const now = Date.now()
          if (!bbRef.current || now - bbRef.current.time > 100)
            bbRef.current = {
              time: now,
              bb: evt.currentTarget.getBoundingClientRect(),
            }
          const { bb } = bbRef.current
          const x = evt.clientX - bb.left + window.scrollX
          const y = evt.clientY - bb.top + window.scrollY
          const l = label.current
          if (!l) return
          l.style.left = x + 10 + 'px'
          l.style.top = y + 10 + 'px'
        }}
        onPointerOver={(evt) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const target: any = evt.target
          const pointIdString = target?.dataset?.pointId
          if (typeof pointIdString !== 'string') {
            clear()
            return
          }
          const pointId = Number.parseInt(pointIdString, 10)
          const point = points[pointId]
          if (!point) {
            clear()
            return
          }

          setLabelValue(`${point.x}:${point.y}`)

          function clear() {
            setLabelValue('')
          }
        }}
      >
        {points.map(({ x, y }, i) => (
          <g key={i} css={{ ':hover': {} }} transform={`translate(${x}, ${y})`}>
            <circle r={0.5} data-point-id={i} />
          </g>
        ))}
      </svg>
      <div
        ref={label}
        className="label"
        css={{
          position: 'absolute',
          display: 'none',
          pointerEvents: 'none',
          background: 'white',
          paddingInline: '.5rem',
          paddingBlock: '.25rem',
          opacity: labelValue ? 1 : 0,
          border: '1px solid black',
        }}
      >
        {labelValue}
      </div>
      <div
        style={{
          paddingBottom: (ymax / xmax) * 100 + '%',
          pointerEvents: 'none',
        }}
      />
    </Resizer>
  )
}

function PointInput({
  onPoint,
}: {
  onPoint: (point: { x: number; y: number }) => void
}) {
  return (
    <form
      onSubmit={(evt) => {
        evt.preventDefault()
        const data = new FormData(evt.currentTarget)
        const sx = data.get('x')
        const sy = data.get('y')
        console.log({ sx, sy })
        evt.currentTarget.reset()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(evt.currentTarget.querySelector('input[name=x]') as any)?.focus?.()
        if (typeof sx !== 'string' || typeof sy !== 'string') return
        const x = Number.parseInt(sx, 10)
        const y = Number.parseInt(sy, 10)
        console.log({ x, y })
        if (!Number.isInteger(x) || !Number.isInteger(y)) return
        onPoint({ x, y })
      }}
    >
      <label>
        X: <input type="number" required min={0} max={100} step={1} name="x" />
      </label>
      <label>
        Y: <input type="number" required min={0} max={100} step={1} name="y" />
      </label>
      <button>Add point</button>
    </form>
  )
}
