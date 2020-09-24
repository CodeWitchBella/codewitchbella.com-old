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
  const subject = ctx.subjects[title]
  return (
    <Event>
      <div css={{ fontWeight: 'bold' }}>
        {title}{' '}
        {!ctx.czech ? type : type === 'lecture' ? 'přednáška' : 'cvičení'}
      </div>
      <div>{time}</div>
      {ctx.showTitles ? (
        <div>
          {ctx.czech ? subject?.name : subject?.enname ?? subject?.name ?? ''}
        </div>
      ) : null}
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
  subjects: {} as {
    [key: string]: { name: string; enname?: string } | undefined
  },
  showTitles: false,
  czech: true,
})
export const EventProvider = eventContext.Provider
