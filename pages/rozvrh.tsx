/** @jsx jsx */
import { jsx } from '@emotion/react'
import styled from '@emotion/styled'
import { useState } from 'react'
import { CalEvent, EventProvider } from '../components/calendar-event'

export default function FEL() {
  const [showTitles, setShowTitles] = useState(false)
  return (
    <EventProvider
      value={{
        showTitles,
        names: {
          DPG: 'Datové struktury počítačové grafiky',
          APG: 'Algoritmy počítačové grafiky',
          GPU: 'Obecné výpočty na grafických procesorech',
          VG: 'Výpočetní geometrie',
          MMA: 'Multimédia a počítačová animace',
          ITT: 'Intermediální tvorba a technologie',
        },
      }}
    >
      <label>
        <input
          type="checkbox"
          onChange={(evt) => setShowTitles(evt.target.checked)}
        />
        Zobraz názvy
      </label>
      <Week>
        <Day>
          <DayTitle>Pondělí/Monday</DayTitle>
          <CalEvent type="lecture" title="DPG" time="11:00 - 12:30"></CalEvent>
          <CalEvent type="seminar" title="APG" time="12:45 - 14:15"></CalEvent>
          <CalEvent type="seminar" title="DPG" time="14:30 - 16:00"></CalEvent>
        </Day>
        <Day>
          <DayTitle>Úterý/Tuesday</DayTitle>
          <CalEvent type="lecture" title="GPU" time="11:00 - 12:30"></CalEvent>
          <CalEvent type="seminar" title="GPU" time="14:30 - 16:00"></CalEvent>
        </Day>
        <Day>
          <DayTitle>Středa/Thursday</DayTitle>
          <CalEvent type="lecture" title="APG" time="16:15 - 17:45"></CalEvent>
        </Day>
        <Day>
          <DayTitle>Čtvrtek/Wednesday</DayTitle>
          <CalEvent type="lecture" title="VG" time="9:15 - 10:45"></CalEvent>
          <CalEvent type="seminar" title="VG" time="11:00 - 12:30"></CalEvent>
          <CalEvent type="lecture" title="MMA" time="12:45 - 14:15"></CalEvent>
          <CalEvent type="seminar" title="MMA" time="14:30 - 16:00"></CalEvent>
        </Day>
        <Day>
          <DayTitle>Pátek/Friday</DayTitle>
          <CalEvent type="lecture" title="ITT" time="12:45 - 14:15"></CalEvent>
          <CalEvent type="seminar" title="ITT" time="14:30 - 16:00"></CalEvent>
        </Day>
      </Week>
    </EventProvider>
  )
}

const Week = styled.div({
  display: 'flex',
  gap: '1rem',
  justifyContent: 'space-evenly',
  flexWrap: 'wrap',
})

const Day = styled.div({
  paddingBlock: '1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '.5rem',
  minWidth: '10rem',
  // make sure that 5 cols fit
  '@media (min-width: 60rem)': {
    maxWidth: 'calc((100% - 4rem) / 5)',
  },
})

const DayTitle = styled.div({
  alignSelf: 'center',
})
