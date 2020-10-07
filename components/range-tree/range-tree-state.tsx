import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useReducer,
} from 'react'

type Point = { x: number; y: number; id: number }
export type Points = readonly Point[]
export type Highlight = {
  layer: number
  id: number
  path: readonly ('left' | 'right')[]
  ymin: boolean
}

type StateBase = {
  action: Action | null
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
export type RangeTreeState = State
const initialState: State = {
  action: null,
  points: [],
  highlight: {
    layer: -1,
    id: 0,
    path: [],
    ymin: false,
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
  | { type: 'findYMin' }
export type Action = BaseAction | { type: 'undo' } | { type: 'redo' }

function baseReducer(
  state: StateBase,
  action: Action,
): Omit<StateBase, 'action'> {
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
    return {
      ...state,
      query: { ...state.query, [action.key]: action.value },
      highlight: initialState.highlight,
    }
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
  if (action.type === 'findYMin') {
    return {
      ...state,
      highlight: {
        ...state.highlight,
        ymin: true,
      },
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
    action,
  }
}

const dispatchContext = createContext<Dispatch<Action> | null>(null)
export function useRangeTreeDispatch() {
  const dispatch = useContext(dispatchContext)
  if (!dispatch) throw new Error('Missing dispatch')
  return dispatch
}

const stateContext = createContext<State | null>(null)
export function useRangeTreeState() {
  const state = useContext(stateContext)
  if (!state) throw new Error('Missing state')
  return state
}
export function useRangeTree() {
  return [useRangeTreeState(), useRangeTreeDispatch()] as const
}

export function RangeTreeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(historicReducer, initialState)
  return (
    <stateContext.Provider value={state}>
      <dispatchContext.Provider value={dispatch}>
        {children}
      </dispatchContext.Provider>
    </stateContext.Provider>
  )
}
