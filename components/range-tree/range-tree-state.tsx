import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useReducer,
} from 'react'
import { makeBBST } from './bbst'
import { makeFractal } from './derived'
import { nextState } from './range-tree-next-step'

export type Point = { x: number; y: number; id: number }
export type Points = readonly Point[]
export type Highlight = {
  layer: number
  id: number
  path: readonly ('left' | 'right')[]
  ymin: boolean
}

export type StateBase = {
  points: Points
  highlight: Highlight
  query: { xmin: number; xmax: number; ymin: number; ymax: number }
  results: readonly { x: number; y: number }[]
  hover: { x: number; y: number } | null

  searchState: {
    status: keyof typeof nextState
    splitPoint: Highlight
    reportBacktrack: Highlight
    reportBacktrackForm: 'xmin' | 'xmax' | 'done'
    reportedSub: boolean
  }
}

export type DerivedState = {
  derived: {
    fractal: ReturnType<typeof makeFractal>
    bbst: ReturnType<typeof makeBBST>
  }
}

function derive(
  cur: StateBase,
  cache: (StateBase & DerivedState) | null,
): DerivedState['derived'] {
  return cache?.points === cur.points
    ? cache['derived']
    : {
        fractal: makeFractal(cur.points),
        bbst: makeBBST(cur.points),
      }
}

type StatePrev = StateBase & { historyPrev: StatePrev | null }
type StateNext = StateBase & { historyNext: StateNext | null }
type State = StateBase &
  DerivedState & {
    historyPrev: StatePrev | null
    historyNext: StateNext | null
  }
export type RangeTreeState = State
const initialHighlight = {
  layer: -1,
  id: 0,
  path: [],
  ymin: false,
}
export const initialState: State = {
  points: [],
  highlight: initialHighlight,
  query: { xmin: 0, xmax: 0, ymin: 0, ymax: 0 },
  hover: null,
  results: [],
  historyPrev: null,
  historyNext: null,
  searchState: {
    status: 'init',
    splitPoint: initialHighlight,
    reportBacktrack: initialHighlight,
    reportBacktrackForm: 'xmin',
    reportedSub: false,
  },
  derived: {
    fractal: makeFractal([]),
    bbst: makeBBST([]),
  },
}

type BaseAction =
  | { type: 'setPoints'; points: Points }
  | { type: 'deletePoint'; point: any }
  | { type: 'addPoint'; point: { x: number; y: number } }
  | { type: 'loadExample' }
  | { type: 'pushResult'; result: number }
  | { type: 'querySet'; key: keyof StateBase['query']; value: number }
  | { type: 'findYMin' }
  | { type: 'step' }
  | { type: 'setHover'; value: { x: number; y: number } | null }
export type Action = BaseAction | { type: 'undo' } | { type: 'redo' }

function baseReducer(
  state: StateBase & DerivedState,
  action: Action,
): StateBase {
  if (action.type === 'setPoints') {
    return { ...state, points: action.points, results: [] }
  }
  if (action.type === 'deletePoint') {
    return {
      ...state,
      points: state.points.filter((point) => point !== action.point),
      results: [],
      searchState: initialState.searchState,
      highlight: initialState.highlight,
    }
  }
  if (action.type === 'addPoint') {
    const maxId = state.points.reduce((a, b) => Math.max(a, b.id), 0)
    return {
      ...state,
      points: [...state.points, { ...action.point, id: maxId + 1 }],
      results: [],
      searchState: initialState.searchState,
      highlight: initialState.highlight,
    }
  }
  if (action.type === 'querySet') {
    return {
      ...state,
      query: { ...state.query, [action.key]: action.value },
      results: [],
      searchState: initialState.searchState,
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
      query: {
        ymin: 4,
        ymax: 6,
        xmin: 1,
        xmax: 3,
      },
      searchState: initialState.searchState,
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
  if (action.type === 'step') {
    return nextState[state.searchState.status].reduce(state)
  }
  if (action.type === 'setHover') {
    return {
      ...state,
      hover: action.value,
    }
  }
  throw new Error('Unknown action')
}

function historicReducer(cur: State, action: Action): State {
  if (action.type === 'undo') {
    const prev = cur.historyPrev
    if (!prev) return cur
    const { historyPrev: deleted, ...next } = cur
    return { ...prev, historyNext: next, derived: derive(prev, cur) }
  }
  if (action.type === 'redo') {
    const next = cur.historyNext
    if (!next) return cur
    const { historyNext: deleted, ...prev } = cur
    return { ...next, historyPrev: prev, derived: derive(next, cur) }
  }
  const next = baseReducer(cur, action)
  const { historyNext: deleted, ...prev } = cur
  return {
    ...next,
    historyPrev: prev,
    historyNext: null,
    derived: derive(next, prev),
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
