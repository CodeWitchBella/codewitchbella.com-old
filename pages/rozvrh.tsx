/** @jsx jsx */
import { jsx } from '@emotion/react'
import styled from '@emotion/styled'
import { useRouter } from 'next/dist/client/router'
import { useCallback, useState } from 'react'
import { CalEvent, EventProvider } from '../components/calendar-event'

export default function FEL() {
  const [showTitles, setShowTitles] = useState(false)
  const [english, toggleLang] = useEn()
  return (
    <EventProvider
      value={{
        showTitles,
        czech: !english,
        subjects: {
          DPG: {
            name: 'Datové struktury počítačové grafiky',
            enname: 'Data Structures for Computer Graphics',
          },
          APG: {
            name: 'Algoritmy počítačové grafiky',
            enname: 'Algorithms of Computer Graphics',
          },
          GPU: {
            name: 'Obecné výpočty na grafických procesorech',
            enname: 'General-Purpose Computing on GPU',
          },
          VG: { name: 'Výpočetní geometrie', enname: 'Computational Geometry' },
          MMA: {
            name: 'Multimédia a počítačová animace',
            enname: 'Multimedia and Computer Animation',
          },
          ITT: {
            name: 'Intermediální tvorba a technologie I',
            enname: 'Applied Multimedia and Technology I',
          },
        },
      }}
    >
      <div css={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <label>
          <input
            type="checkbox"
            onChange={(evt) => setShowTitles(evt.target.checked)}
            css={{ paddingInlineEnd: '.5rem' }}
            checked={showTitles}
          />
          Zobraz názvy
        </label>
        <button onClick={() => toggleLang()} type="button">
          <span css={english ? {} : { fontWeight: 'bold' }}>CZ</span> |{' '}
          <span css={english ? { fontWeight: 'bold' } : {}}>EN</span>
        </button>
      </div>
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

function useEn() {
  const router = useRouter()

  const current = router.query.lang === 'en'
  return [
    current,
    useCallback(() => {
      const q = { ...router.query, lang: 'en' as 'en' | undefined }
      if (current) delete q.lang
      router.replace({ query: q })
    }, [current, router]),
  ] as const
}
