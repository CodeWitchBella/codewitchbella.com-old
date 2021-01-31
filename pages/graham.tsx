import { useMemo } from 'react'
import { useWorkerizedStepper } from '../src/use-workerized-stepper'

export default function Graham() {
  const data = useMemo(
    () => ({
      points: `
        -3.88 -2.19
        -3.18 0.33
        1.8 1.53
        4.68 -0.57
        3.46 -3.51
        -1.34 -3.87
        -0.86 -1.77
        0.74 -2.99
        2.24 -1.67
        0.54 -1.11
        2.54 0.13
        -2 0
      `
        .trim()
        .split('\n')
        .map((l) =>
          l
            .trim()
            .split(' ')
            .map((v) => Number.parseFloat(v)),
        )
        .map(([x, y]) => ({ x, y })),
    }),
    [],
  )
  const [state, controls] = useWorkerizedStepper<{
    hull: { x: number; y: number }[]
    candidate: { x: number; y: number }
  }>('/wasm/convex-hull.js', '_work_float_inexact', data)
  const limits = useMemo(
    () => ({
      minx: data.points.reduce((a, b) => Math.min(a, b.x), 1e31),
      maxx: data.points.reduce((a, b) => Math.max(a, b.x), -1e31),
      miny: data.points.reduce((a, b) => Math.min(a, b.y), 1e31),
      maxy: data.points.reduce((a, b) => Math.max(a, b.y), -1e31),
    }),
    [data.points],
  )
  const width = limits.maxx - limits.minx + 2
  const height = limits.maxy - limits.miny + 2
  const hull = state?.data?.hull || []
  return (
    <div>
      <button disabled={state.first} onClick={controls.back}>
        back
      </button>
      <button disabled={state.last} onClick={controls.next}>
        next
      </button>
      <div>
        <svg
          style={{
            width: 512,
          }}
          viewBox={`${limits.minx - 1} ${limits.miny - 1} ${width} ${height}`}
        >
          <rect
            x={limits.minx - 1}
            y={limits.miny - 1}
            width={width}
            height={height}
            fill="gray"
          />
          {data.points.map((p, i) => (
            <circle key={i} r="0.25" cx={p.x} cy={p.y} fill="black" />
          ))}

          {hull.map((point: { x: number; y: number }, i, list) =>
            i === 0 ? null : (
              <line
                key={i}
                x1={point.x}
                y1={point.y}
                x2={list[i - 1].x}
                y2={list[i - 1].y}
                stroke="blue"
                strokeWidth="0.125"
              />
            ),
          ) ?? null}

          {state.last && hull.length > 1 ? (
            <line
              x1={hull[0].x}
              y1={hull[0].y}
              x2={hull[hull.length - 1].x}
              y2={hull[hull.length - 1].y}
              stroke="blue"
              strokeWidth="0.125"
            />
          ) : null}
          {hull.map((p, i) => (
            <circle key={i} r="0.25" cx={p.x} cy={p.y} fill="red" />
          ))}
          {state.data?.candidate ? (
            <circle
              r="0.25"
              cx={state.data.candidate.x}
              cy={state.data.candidate.y}
              fill="green"
            />
          ) : null}
        </svg>
      </div>
    </div>
  )
}
