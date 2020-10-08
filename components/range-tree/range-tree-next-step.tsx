import type { BBSTNode } from './bbst'
import { findHighlightedNodeFractal, FractalNode } from './derived'
import {
  DerivedState,
  Highlight,
  initialState,
  StateBase,
} from './range-tree-state'

type Status =
  | 'init'
  | 'lookingForSplit'
  | 'lookingForXmin'
  | 'lookingForXmax'
  | 'reportSubtree'
  | 'done'

export const nextState: {
  [key in Status]: {
    description: string
    reduce: (state: StateBase & DerivedState) => StateBase
  }
} = {
  init: {
    description: 'Find first element matching ymin (binary search)',
    reduce(state) {
      return {
        ...state,
        highlight: {
          ...state.highlight,
          ymin: true,
        },
        searchState: {
          ...state.searchState,
          status: 'lookingForSplit',
        },
      }
    },
  },
  lookingForSplit: {
    description: 'Looking for split point in x',
    reduce(state): StateBase {
      const highlightLeft: Highlight = {
        id: state.highlight.id * 2,
        layer: state.highlight.layer + 1,
        path: [...state.highlight.path, 'left'],
        ymin: state.highlight.ymin,
      }
      if (state.highlight.layer < 0)
        return { ...state, highlight: highlightLeft }
      const highlightRight: Highlight = {
        ...highlightLeft,
        id: highlightLeft.id + 1,
        path: [...state.highlight.path, 'right'],
      }
      const node = getBBSTHighlighted(state)
      if (node.value >= state.query.xmin && node.value >= state.query.xmax) {
        return { ...state, highlight: highlightLeft }
      }
      if (node.value < state.query.xmin && node.value < state.query.xmax) {
        return { ...state, highlight: highlightRight }
      }

      return {
        ...state,
        searchState: {
          ...state.searchState,
          status: 'lookingForXmin',
          splitPoint: state.highlight,
          reportedSub: true,
        },
      }
    },
  },
  lookingForXmin: {
    description: 'Looking for xmin',
    reduce(state): StateBase {
      const highlightLeft: Highlight = {
        id: state.highlight.id * 2,
        layer: state.highlight.layer + 1,
        path: [...state.highlight.path, 'left'],
        ymin: state.highlight.ymin,
      }
      const highlightRight: Highlight = {
        ...highlightLeft,
        id: highlightLeft.id + 1,
        path: [...state.highlight.path, 'right'],
      }
      const nodeLeft = getBBSTHighlighted(state, highlightLeft)
      const nodeRight = getBBSTHighlighted(state, highlightRight)
      const node = getBBSTHighlighted(state)
      if (!nodeLeft && !nodeRight) {
        // leaf
        if (state.query.xmin <= node.value) {
          return {
            ...state,
            searchState: {
              ...state.searchState,
              status: 'reportSubtree',
              reportBacktrackForm: 'xmax',
              reportBacktrack: state.searchState.splitPoint,
            },
          }
        } else {
          return {
            ...state,
            searchState: {
              ...state.searchState,
              status: 'lookingForXmax',
              reportedSub: true,
              reportBacktrack: initialState.highlight,
              reportBacktrackForm: 'xmax',
            },
          }
        }
      }
      if (!nodeRight) {
        return {
          ...state,
          highlight: highlightLeft,
          searchState: { ...state.searchState, reportedSub: false },
        }
      }
      if (state.query.xmin <= node.value) {
        if (state.searchState.reportedSub) {
          return {
            ...state,
            highlight: highlightLeft,
            searchState: { ...state.searchState, reportedSub: false },
          }
        } else {
          return {
            ...state,
            highlight: highlightRight,
            searchState: {
              ...state.searchState,
              status: 'reportSubtree',
              reportBacktrack: state.highlight,
              reportBacktrackForm: 'xmin',
            },
          }
        }
      } else {
        return {
          ...state,
          highlight: highlightRight,
          searchState: { ...state.searchState, reportedSub: false },
        }
      }
    },
  },
  lookingForXmax: {
    description: 'Looking for xmax',
    reduce(state) {
      const highlightLeft: Highlight = {
        id: state.highlight.id * 2,
        layer: state.highlight.layer + 1,
        path: [...state.highlight.path, 'left'],
        ymin: state.highlight.ymin,
      }
      const highlightRight: Highlight = {
        ...highlightLeft,
        id: highlightLeft.id + 1,
        path: [...state.highlight.path, 'right'],
      }
      const nodeLeft = getBBSTHighlighted(state, highlightLeft)
      const nodeRight = getBBSTHighlighted(state, highlightRight)
      const node = getBBSTHighlighted(state)

      if (!nodeLeft && !nodeRight) {
        // leaf
        if (node.value <= state.query.xmax) {
          return {
            ...state,
            searchState: {
              ...state.searchState,
              status: 'reportSubtree',
              reportBacktrackForm: 'done',
              reportBacktrack: initialState.highlight,
            },
          }
        } else {
          return {
            ...state,
            highlight: initialState.highlight,
            searchState: {
              ...state.searchState,
              reportBacktrack: initialState.highlight,
              reportedSub: true,
              status: 'done',
            },
          }
        }
      }
      if (!nodeRight) {
        return {
          ...state,
          highlight: highlightLeft,
          searchState: { ...state.searchState, reportedSub: false },
        }
      }

      if (node.value < state.query.xmax) {
        if (state.searchState.reportedSub) {
          return {
            ...state,
            highlight: highlightRight,
            searchState: { ...state.searchState, reportedSub: false },
          }
        } else {
          return {
            ...state,
            highlight: highlightLeft,
            searchState: {
              ...state.searchState,
              status: 'reportSubtree',
              reportBacktrack: state.highlight,
              reportBacktrackForm: 'xmax',
            },
          }
        }
      } else {
        return {
          ...state,
          highlight: highlightLeft,
          searchState: { ...state.searchState, reportedSub: false },
        }
      }
    },
  },
  reportSubtree: {
    description: 'Report subset',
    reduce(state) {
      const node = findHighlightedNodeFractal(
        state.derived.fractal,
        state.highlight,
        state.query.ymin,
      )
      return {
        ...state,
        highlight: state.searchState.reportBacktrack,
        results: [...state.results, ...collectUntil(node, state.query.ymax)],
        searchState: {
          ...state.searchState,
          reportBacktrack: initialState.highlight,
          reportedSub: true,
          status:
            state.searchState.reportBacktrackForm === 'xmin'
              ? 'lookingForXmin'
              : state.searchState.reportBacktrackForm === 'xmax'
              ? 'lookingForXmax'
              : 'done',
        },
      }
    },
  },
  done: {
    description: 'Done',
    reduce(state) {
      return state
    },
  },
}

function collectUntil(node: FractalNode | null, max: number) {
  const ret: { x: number; y: number }[] = []
  console.log(node?.value, max)
  while (node && node.value <= max) {
    ret.push({ y: node.value, x: node.x })
    node = node.sibRight
  }
  return ret
}

function getBBSTHighlighted(
  state: StateBase & DerivedState,
  highlight = state.highlight,
) {
  return state.derived.bbst.layers?.[highlight.layer]?.[highlight.id]
}
