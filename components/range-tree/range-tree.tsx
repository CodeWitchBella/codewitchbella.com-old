/** @jsx jsx */
import { jsx } from '@emotion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import Resizer from '@codewitchbella/react-resizer'
import {
  Highlight,
  Points,
  RangeTreeProvider,
  RangeTreeState,
  useRangeTreeDispatch,
  useRangeTreeState,
} from './range-tree-state'
import { ArrowEnd, ArrowStart } from './range-tree-arrow'
import styled from '@emotion/styled'
import { nextState } from './range-tree-next-step'
import {
  comesFrom,
  findHighlightedNode,
  getFractalNodes,
  makeFractal,
} from './derived'

export function RangeTree() {
  return (
    <RangeTreeProvider>
      <RangeTreeView />
    </RangeTreeProvider>
  )
}

function RangeTreeView() {
  const state = useRangeTreeState()
  const dispatch = useRangeTreeDispatch()
  const { points, highlight } = state
  const bbst = useMemo(() => makeBBST(points), [points])
  return (
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
      <div>
        Next action: {nextState[state.searchState.status].description}{' '}
        <button
          type="button"
          onClick={() => {
            dispatch({ type: 'step' })
          }}
          disabled={state.searchState.status === 'done'}
        >
          Perform
        </button>
      </div>
      <div>Last action: {JSON.stringify(state.action)}</div>
      <div css={{ display: 'flex', gap: '2rem' }}>
        <BBSTView bbst={bbst} highlight={highlight} />
        <Fractal highlight={highlight} />
      </div>
      <div>
        <div>Results: {JSON.stringify(state.results)}</div>
      </div>
    </div>
  )
}

function QueryField({ field }: { field: keyof RangeTreeState['query'] }) {
  const value = useRangeTreeState().query[field]
  const dispatch = useRangeTreeDispatch()
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

const TreeRoot = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '.5rem',
})

const TreeLine = styled.div({
  display: 'flex',
  justifyContent: 'space-evenly',
  gap: '.25rem',
})

function Fractal({ highlight }: { highlight: Highlight }) {
  const state = useRangeTreeState()
  const { fractal } = state.derived
  const highlightedNode = useMemo(() => {
    if (!state.highlight.ymin) return null
    return findHighlightedNode(fractal, highlight, state.query.ymin)
  }, [fractal, highlight, state.highlight.ymin, state.query.ymin])
  return (
    <TreeRoot>
      {fractal.layers.map((layer, layerKey) => (
        <TreeLine key={layerKey}>
          {layer.map((layerStart, ni) => (
            <div key={ni}>
              [
              {getFractalNodes(layerStart).map((node, i, list) => (
                <>
                  <span
                    css={[
                      node === highlightedNode ? { background: 'yellow' } : {},
                      {
                        position: 'relative',
                        cursor: 'pointer',
                        padding: 2,
                        '.arrow': {
                          pointerEvents: 'none',
                          opacity: comesFrom(node, highlightedNode) ? 1 : 0,
                        },
                        ':hover .arrow': {
                          opacity: 1,
                        },
                      },
                    ]}
                  >
                    {node.value}
                    <ArrowEnd
                      id={`frac:${node.key}`}
                      css={{ position: 'absolute', top: 0, left: '50%' }}
                    />
                    {node.left ? (
                      <ArrowStart
                        id={`frac:${node.left.key}`}
                        css={{ position: 'absolute', bottom: 0, left: '50%' }}
                        className="arrow"
                      />
                    ) : null}
                    {node.right ? (
                      <ArrowStart
                        id={`frac:${node.right.key}`}
                        css={{ position: 'absolute', bottom: 0, left: '50%' }}
                        className="arrow"
                      />
                    ) : null}
                  </span>
                  {i !== list.length - 1 ? ',' : null}
                </>
              ))}
              ]
            </div>
          ))}
        </TreeLine>
      ))}
    </TreeRoot>
  )
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
      <TreeRoot>
        {bbst.layers.map((layer, li) => (
          <div
            key={li}
            css={{
              display: 'flex',
              justifyContent: 'space-evenly',
              gap: '.5rem',
            }}
          >
            {layer.map((node, ni) => (
              <span
                key={ni}
                css={[
                  highlight.layer === li && highlight.id === ni
                    ? { background: 'yellow' }
                    : {},
                  { position: 'relative' },
                ]}
              >
                {node.value}
                <ArrowEnd
                  id={`bbst:${li}:${ni}`}
                  css={{ position: 'absolute', top: 0, left: '50%' }}
                />
                <ArrowStart
                  id={`bbst:${li + 1}:${ni * 2}`}
                  css={{ position: 'absolute', bottom: 0, left: '50%' }}
                />
                <ArrowStart
                  id={`bbst:${li + 1}:${ni * 2 + 1}`}
                  css={{ position: 'absolute', bottom: 0, left: '50%' }}
                />
              </span>
            ))}
          </div>
        ))}
      </TreeRoot>
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
