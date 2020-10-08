/** @jsx jsx */
import { jsx } from '@emotion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import Resizer from '@codewitchbella/react-resizer'
import {
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
  findHighlightedNodeFractal,
  getFractalNodes,
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
  const { points } = state
  return (
    <div
      css={{
        fontFamily: 'sans-serif',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '3rem',
      }}
    >
      <div css={{ textDecoration: 'underline' }}>isbl.cz/range-tree</div>

      <div css={{ paddingBlock: '1rem' }}>
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
        <button
          type="button"
          onClick={() => dispatch({ type: 'setPoints', points: [] })}
        >
          Remove all points
        </button>
      </div>

      <PointChart points={points} />
      <div css={{ paddingBlock: '1rem' }}>
        Query:
        <div css={{ display: 'flex', gap: '1ch' }}>
          <QueryField field="ymin" />
          <QueryField field="ymax" />
        </div>
        <div css={{ display: 'flex', gap: '1ch' }}>
          <QueryField field="xmin" />
          <QueryField field="xmax" />
        </div>
      </div>
      {state.points.length > 0 ? (
        <>
          <div>
            Next step: {nextState[state.searchState.status].description}{' '}
          </div>
          <div css={{ display: 'flex', alignItems: 'stretch' }}>
            <button
              type="button"
              onClick={() => dispatch({ type: 'undo' })}
              disabled={!state.historyPrev}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'step' })
              }}
              disabled={state.searchState.status === 'done'}
            >
              Perform
            </button>

            <button
              type="button"
              onClick={() => dispatch({ type: 'redo' })}
              disabled={!state.historyNext}
            >
              →
            </button>
          </div>

          <div css={{ display: 'flex', gap: '2rem', paddingTop: '1rem' }}>
            <BBSTView />
            <Fractal />
            <div>
              <div>Legend</div>
              <div>
                <span css={{ background: 'yellow' }}>x</span> active node
              </div>
              <div>
                <span css={{ textDecoration: 'underline' }}>x</span> split point
              </div>
              <div>
                <span css={{ fontWeight: 'bold' }}>x</span> search position
              </div>
            </div>
          </div>
          <div
            css={{
              marginTop: '1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div>Results:</div>
            <div
              css={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '.5rem',
              }}
            >
              {state.results.length < 1 ? 'Empty' : ''}
              {state.results.map(({ x, y }, i) => (
                <div key={i} css={{ border: '1px solid gray' }}>
                  {x}:{y}
                </div>
              ))}
            </div>
            <div css={{ minHeight: '100vh' }} />
          </div>
        </>
      ) : null}
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
        value={value + ''}
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

function Fractal() {
  const state = useRangeTreeState()
  const { highlight } = state
  const { fractal } = state.derived
  const highlightedNode = useMemo(() => {
    if (!state.highlight.ymin) return null
    return findHighlightedNodeFractal(fractal, highlight, state.query.ymin)
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

function BBSTView() {
  const {
    derived: { bbst },
    highlight,
    searchState: { splitPoint, reportBacktrack },
  } = useRangeTreeState()
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
                  {
                    background:
                      highlight.layer === li && highlight.id === ni
                        ? 'yellow'
                        : undefined,
                    textDecoration:
                      splitPoint.layer === li && splitPoint.id === ni
                        ? 'underline'
                        : undefined,
                    fontWeight:
                      reportBacktrack.layer === li && reportBacktrack.id === ni
                        ? 'bold'
                        : reportBacktrack.layer < 0 &&
                          highlight.layer === li &&
                          highlight.id === ni
                        ? 'bold'
                        : undefined,
                    position: 'relative',
                  },
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
  const { query } = useRangeTreeState()
  const label = useRef<HTMLDivElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const [labelValue, setLabelValue] = useState('')
  const bbRef = useRef<{ time: number; bb: DOMRect }>()
  const dispatch = useRangeTreeDispatch()

  if (useSSR()) return null
  const xmax = points.reduce((b, { x: a }) => Math.max(a, b), query.xmax)
  const ymax = points.reduce((b, { y: a }) => Math.max(a, b), query.ymax)

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
          const x = evt.clientX - bb.left
          const y = evt.clientY - bb.top
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
        {Array.from({ length: ymax + 1 }).map((_, i) => (
          <line
            key={i}
            x1={0}
            x2={xmax}
            y1={i}
            y2={i}
            style={{ stroke: 'blue', strokeWidth: 0.1 }}
            strokeLinecap="round"
          />
        ))}
        {Array.from({ length: xmax + 1 }).map((_, i) => (
          <line
            key={i}
            x1={i}
            x2={i}
            y1={0}
            y2={ymax}
            style={{ stroke: 'blue', strokeWidth: 0.1 }}
            strokeLinecap="round"
          />
        ))}
        <rect
          x={query.xmin - 0.5}
          y={query.ymin - 0.5}
          width={query.xmax - query.xmin + 1}
          height={query.ymax - query.ymin + 1}
          fill="green"
        />
        {points.map((point, i) => (
          <g
            key={i}
            css={{ cursor: 'pointer' }}
            transform={`translate(${point.x}, ${point.y})`}
            onClick={() => {
              dispatch({ type: 'deletePoint', point })
            }}
          >
            <circle r={0.3} data-point-id={i} />
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
          paddingBottom: ((ymax + 2) / (xmax + 2)) * 100 + '%',
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
        if (!Number.isInteger(x) || !Number.isInteger(y)) return
        onPoint({ x, y })
      }}
    >
      <label>
        X:{' '}
        <input
          type="number"
          required
          min={0}
          max={100}
          step={1}
          name="x"
          css={{ maxWidth: '5ch', marginRight: '1ch' }}
        />
      </label>
      <label>
        Y:{' '}
        <input
          type="number"
          required
          min={0}
          max={100}
          step={1}
          name="y"
          css={{ maxWidth: '5ch' }}
        />
      </label>
      <button>Add point</button>
    </form>
  )
}
