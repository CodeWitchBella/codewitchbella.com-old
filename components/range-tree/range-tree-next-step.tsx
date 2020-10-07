import type { DerivedState, Highlight, StateBase } from './range-tree-state'

type Status =
  | 'init'
  | 'lookingForSplit'
  | 'lookingForXmin'
  | 'lookingForXmax'
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
    reduce(state) {
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
        searchState: { status: 'lookingForXmin', splitPoint: state.highlight },
      }
    },
  },
  lookingForXmin: {
    description: 'Looking for xmin',
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
        return {
          ...state,
          highlight: state.searchState.splitPoint,
          searchState: { ...state.searchState, status: 'lookingForXmax' },
        }
      }
      if (!nodeRight) {
        return { ...state, highlight: highlightLeft }
      }
      if (state.query.xmin <= node.value) {
        return { ...state, highlight: highlightLeft }
      } else {
        return { ...state, highlight: highlightRight }
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
        return {
          ...state,
          highlight: { layer: -1, id: 0, path: [], ymin: false },
          searchState: { ...state.searchState, status: 'done' },
        }
      }
      if (!nodeRight) {
        return { ...state, highlight: highlightLeft }
      }
      if (node.value < state.query.xmax) {
        return { ...state, highlight: highlightRight }
      } else {
        return { ...state, highlight: highlightLeft }
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

function getBBSTHighlighted(
  state: StateBase & DerivedState,
  highlight = state.highlight,
) {
  return state.derived.bbst.layers?.[highlight.layer]?.[highlight.id]
}
