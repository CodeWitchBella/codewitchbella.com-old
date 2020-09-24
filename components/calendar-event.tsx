/** @jsx jsx */
import { jsx } from '@emotion/react'
import styled from '@emotion/styled'
import { ReactNode, useContext, createContext } from 'react'

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
  const ctx = useContext(eventContext)
  return (
    <Event>
      <div css={{ fontWeight: 'bold' }}>
        {title} {type === 'lecture' ? 'přednáška' : 'cvičení'}
      </div>
      <div>{time}</div>
      {ctx.showTitles ? <div>{ctx.names[title]}</div> : null}
      {children}
    </Event>
  )
}

const Event = styled.div({
  padding: '.5rem',
  border: '1px solid gray',
  borderRadius: '.5rem',
})

const eventContext = createContext({
  names: {} as { [key: string]: string },
  showTitles: false,
})
export const EventProvider = eventContext.Provider
