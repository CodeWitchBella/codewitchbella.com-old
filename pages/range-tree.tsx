/** @jsx jsx */
import { jsx } from '@emotion/react'
import { useEffect, useRef, useState } from 'react'
import Resizer from '@codewitchbella/react-resizer'

export default function RangeTreeE() {
  const [key, setKey] = useState(0)
  return (
    <div>
      <button type="button" onClick={() => setKey((i) => i + 1)}>
        Reset
      </button>
      <RangeTree key={key} />
    </div>
  )
}

type Point = { x: number; y: number }
type Points = readonly Point[]
function RangeTree() {
  const [points, setPoints] = useState<Points>([])
  return (
    <div>
      <PointInput onPoint={(point) => setPoints((p) => [...p, point])} />
      <PointChart points={points} />
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
        viewBox={`-2 -2 ${xmax + 3} ${ymax + 3}`}
        onPointerMove={(evt) => {
          const now = Date.now()
          if (!bbRef.current || now - bbRef.current.time > 100)
            bbRef.current = {
              time: now,
              bb: evt.currentTarget.getBoundingClientRect(),
            }
          const { bb } = bbRef.current
          console.log(evt.currentTarget.clientTop)
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
            <circle cx={-0.5} cy={-0.5} r={1} data-point-id={i} />
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

function PointInput({ onPoint }: { onPoint: (point: Point) => void }) {
  return (
    <form
      onSubmit={(evt) => {
        evt.preventDefault()
        const data = new FormData(evt.currentTarget)
        const sx = data.get('x')
        const sy = data.get('y')
        console.log({ sx, sy })
        evt.currentTarget.reset()
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
