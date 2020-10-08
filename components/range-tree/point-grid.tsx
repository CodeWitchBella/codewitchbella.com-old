/** @jsx jsx */
import { jsx } from '@emotion/react'
import { Fragment, useMemo, useRef, useState } from 'react'
import { useRangeTreeDispatch, useRangeTreeState } from './range-tree-state'
import Resizer from '@codewitchbella/react-resizer'

export function PointGrid({ xmax, ymax }: { xmax: number; ymax: number }) {
  const { query, points, hover } = useRangeTreeState()
  const label = useRef<HTMLDivElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const [labelValue, setLabelValue] = useState('')
  const bbRef = useRef<{ time: number; bb: DOMRect }>()
  const dispatch = useRangeTreeDispatch()

  const map = useMemo(() => {
    const xmap = new Map<number, Map<number, number>>()
    let i = 0
    for (const point of points) {
      let ymap = xmap.get(point.x)
      if (!ymap) {
        ymap = new Map()
        xmap.set(point.x, ymap)
      }
      ymap.set(point.y, i++)
    }
    return xmap
  }, [points])

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
          const pointString: string = target?.dataset?.point
          if (!pointString) {
            clear()
            return
          }
          const [x, y] = pointString
            .split(':')
            .map((i) => Number.parseInt(i, 10))
          if (!Number.isInteger(x) || !Number.isInteger(y)) {
            clear()
            return
          }
          setLabelValue(`[${x},${y}]`)

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
        {Array.from({ length: xmax + 1 }).map((_, x) => (
          <Fragment key={x}>
            {Array.from({ length: ymax + 1 }).map((_, y) => {
              const pointId = map.get(x)?.get(y)
              return (
                <Fragment key={y}>
                  <g
                    css={{ cursor: 'pointer' }}
                    transform={`translate(${x}, ${ymax - y})`}
                    onClick={() => {
                      if (typeof pointId === 'number')
                        dispatch({
                          type: 'deletePoint',
                          point: points[pointId],
                        })
                      else dispatch({ type: 'addPoint', point: { x, y } })
                    }}
                  >
                    <circle
                      r={0.3}
                      data-point-id={pointId}
                      data-point={`${x}:${y}`}
                      css={{
                        fill:
                          hover && hover.x === x && hover.y === y
                            ? 'lime'
                            : typeof pointId === 'number'
                            ? 'black'
                            : 'transparent',
                      }}
                    />
                  </g>
                </Fragment>
              )
            })}
          </Fragment>
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
