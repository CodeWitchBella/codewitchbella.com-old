import type { Highlight, StateBase } from './range-tree-state'

type Status = 'init' | 'lookingForSplit' | 'done'

export const nextState: {
  [key in Status]: {
    description: string
    reduce: (state: StateBase) => StateBase
  }
} = {
  init: {
    description: '',
    reduce(state) {
      return {
        ...state,
        highlight: {
          ...state.highlight,
          ymin: true,
        },
        searchState: {
          status: 'lookingForSplit',
        },
      }
    },
  },
  lookingForSplit: {
    description: 'Looking for split point',
    reduce(state) {
      const highlightLeft: Highlight = {
        id: state.highlight.id * 2,
        layer: state.highlight.layer + 1,
        path: [...state.highlight.path, 'left'],
        ymin: state.highlight.ymin,
      }
      const highlightRight = {
        ...highlightLeft,
        id: highlightLeft.id + 1,
        path: [...state.highlight.path, 'right'],
      }
      //const node = state.

      return state
    },
  },
  done: {
    description: 'Done',
    reduce(state) {
      return state
    },
  },
}
