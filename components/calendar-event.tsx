/** @jsx jsx */
import { jsx } from '@emotion/react'
import styled from '@emotion/styled'
import type { ReactNode } from 'react'

export function CalEvent({
  title,
  time,
  children,
  type,
}: {
  title: string
  time: string
  type: 'lecture' | 'seminar'
  children?: ReactNode
}) {
  return (
    <Event>
      <div css={{ fontWeight: 'bold' }}>
        {title} {type === 'lecture' ? 'přednáška' : 'cvičení'}
      </div>
      <div>{time}</div>
      {children}
    </Event>
  )
}

const Event = styled.div({
  padding: '.5rem',
  border: '1px solid gray',
  borderRadius: '.5rem',
})
