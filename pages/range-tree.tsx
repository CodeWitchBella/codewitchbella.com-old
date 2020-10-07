/** @jsx jsx */
import { jsx } from '@emotion/react'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import Resizer from '@codewitchbella/react-resizer'

type Point = { x: number; y: number; id: number }
type Points = readonly Point[]
type Highlight = {
  layer: number
  id: number
  ymin: number
  path: readonly ('left' | 'right')[]
}
export default function RangeTree() {
  const [points, setPoints] = useState<Points>([])
  const bbst = useMemo(() => makeBBST(points), [points])
  const fractal = useMemo(() => makeFractal(points), [points])
  const [highlight, setHighlight] = useState<Highlight>({
    layer: 0,
    id: 0,
    ymin: 0,
    path: [],
  })
  return (
    <div>
      <button type="button" onClick={() => setPoints([])}>
        Remove all points
      </button>
      <PointInput
        onPoint={(point) => {
          setPoints((p) => [
            ...p,
            { ...point, id: p.reduce((b, { id }) => Math.max(id, b), 0) + 1 },
          ])
        }}
      />
      <button
        type="button"
        onClick={() => {
          setPoints(
            [
              [3, 7],
              [4, 6],
              [6, 5],
              [1, 4],
              [5, 3],
              [2, 2],
              [7, 1],
              [0, 0],
            ].map(([x, y], i) => ({ x, y, id: i + 1 })),
          )
        }}
      >
        Load example
      </button>
      <PointChart points={points} />
      <div>
        <label>
          ymin:{' '}
          <input
            type="number"
            value={highlight.ymin}
            onChange={(evt) => {
              const next = Number.parseInt(evt.target?.value, 10)
              if (Number.isInteger(next))
                setHighlight((h) => ({
                  ...h,
                  ymin: next,
                }))
            }}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setHighlight((h) => ({
              layer: h.layer + 1,
              id: h.id * 2,
              ymin: h.ymin,
              path: [...h.path, 'left'],
            }))
          }}
        >
          Left
        </button>
        <button
          type="button"
          onClick={() => {
            setHighlight((h) => ({
              layer: h.layer + 1,
              id: h.id * 2 + 1,
              ymin: h.ymin,
              path: [...h.path, 'right'],
            }))
          }}
        >
          Right
        </button>
      </div>
      <div css={{ display: 'flex' }}>
        <BBSTView bbst={bbst} highlight={highlight} />
        <Fractal fractal={fractal} highlight={highlight} />
      </div>
    </div>
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
  const highlightedNode = findHighlightedNode(fractal, highlight)
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
): FractalNode | null {
  let start: FractalNode | null = fractal.root
  while (start && start.value < highlight.ymin) {
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
