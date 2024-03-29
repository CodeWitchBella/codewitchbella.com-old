/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled'
import { useRouter } from 'next/dist/client/router'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalEvent,
  Cz,
  Deets,
  En,
  EventProvider,
} from '../../components/calendar-event'
import { DateTime, Interval } from 'luxon'

function WeekNumber({ children }: { children: JSX.Element | JSX.Element[] }) {
  const [week, setWeek] = useState<null | number>(null)

  useEffect(() => {
    const int = Interval.fromDateTimes(
      DateTime.fromObject({ year: 2020, month: 9, day: 21 }),
      DateTime.local(),
    ).toDuration()
    setWeek(Math.floor(int.as('week') + 1))
  }, [])
  if (week === null) return null
  return (
    <>
      {children}
      {week}
    </>
  )
}

export default function FEL() {
  const [showTitles, setShowTitles] = useBooleanQueryParam('titles', false)
  const [english, toggleLang] = useEn()
  const [deets, setDeets] = useBooleanQueryParam('deets', true)
  const [links, setLinks] = useLocalStorage('rozvrh:links')

  useSetOnWindow('setLink', (type: string, value: string) => {
    setLinks({ ...links, [type]: value })
  })

  return (
    <EventProvider
      value={{
        room: false,
        showTitles,
        czech: !english,
        deets,
        subjects: {
          DPG: {
            longcode: 'B4M39DPG',
            name: 'Datové struktury počítačové grafiky',
            enname: 'Data Structures for Computer Graphics',
            deets: (
              <>
                Havran
                <br />
                Teams
                <br />
                <Link to="https://cw.fel.cvut.cz/wiki/courses/b4m39dpg/start">
                  CourseWare
                </Link>
              </>
            ),
          },
          APG: {
            longcode: 'B4M39APG',
            name: 'Algoritmy počítačové grafiky',
            enname: 'Algorithms of Computer Graphics',
            deets: (
              <>
                Teams
                <br />
                <Link to="https://cw.fel.cvut.cz/wiki/courses/b4m39apg/start">
                  CourseWare
                </Link>
                <br />
                <Link to="https://cw.felk.cvut.cz/brute/student/course/B4M39APG">
                  Brute
                </Link>
              </>
            ),
          },
          GPU: {
            longcode: 'B4M39GPU',
            name: 'Obecné výpočty na grafických procesorech',
            enname: 'General-Purpose Computing on GPU',
            deets: (
              <>
                <MaybeLink to={links?.GPU}>Zoom</MaybeLink>
                <br />
                <Link to="https://cent.felk.cvut.cz/courses/GPU/index.html">
                  <En>Website</En>
                  <Cz>Stránky</Cz>
                </Link>
              </>
            ),
          },
          VG: {
            longcode: 'B4M39VG',
            name: 'Výpočetní geometrie',
            enname: 'Computational Geometry',
            deets: (
              <>
                <MaybeLink to={links?.CG}>Zoom</MaybeLink>
                <br />
                <Link to="https://cw.fel.cvut.cz/wiki/courses/cg/start">
                  CourseWare
                </Link>
                <br />
                <Link to="https://cw.felk.cvut.cz/brute/student/course/CG">
                  Brute
                </Link>
              </>
            ),
          },
          MMA: {
            longcode: 'B4M39MMA',
            name: 'Multimédia a počítačová animace',
            enname: 'Multimedia and Computer Animation',
            deets: (
              <>
                Teams
                <br />
                <Link to="https://cw.fel.cvut.cz/wiki/courses/b4m39mma/start">
                  CourseWare
                </Link>
              </>
            ),
          },
          ITT: {
            longcode: 'B0M39ITT1',
            name: 'Intermediální tvorba a technologie I',
            enname: 'Applied Multimedia and Technology I',
            deets: (
              <>
                <div>
                  Teams
                  <br />
                  <Link to="https://cw.fel.cvut.cz/wiki/courses/b0m39itt1/start">
                    CourseWare
                  </Link>
                </div>
                <Link to="https://www.purrdata.net/">purrdata</Link> <Cz>a</Cz>
                <En>and</En> <Link to="https://vvvv.org">vvvv</Link>
              </>
            ),
          },
        },
      }}
    >
      <div css={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button onClick={() => toggleLang()} type="button">
          <span css={english ? {} : { fontWeight: 'bold' }}>CZ</span> |{' '}
          <span css={english ? { fontWeight: 'bold' } : {}}>EN</span>
        </button>
        <label>
          <input
            type="checkbox"
            onChange={(evt) => setShowTitles(evt.target.checked)}
            css={{ paddingInlineEnd: '.5rem' }}
            checked={showTitles}
          />
          <Cz>Zobraz názvy</Cz>
          <En>Show names</En>
        </label>
        <label>
          <input
            type="checkbox"
            onChange={(evt) => setDeets(evt.target.checked)}
            css={{ paddingInlineEnd: '.5rem' }}
            checked={deets}
          />
          <Cz>Detaily</Cz>
          <En>Details</En>
        </label>
      </div>
      <div>
        <WeekNumber>
          <Cz>Týden semestru:</Cz>
          <En>Week number:</En>
          <> </>
        </WeekNumber>
      </div>
      <Week>
        <Day>
          <DayTitle>
            <Cz>Pondělí/</Cz>Monday
          </DayTitle>
          <CalEvent type="lecture" title="DPG" time="11:00 - 12:30"></CalEvent>
          <CalEvent type="seminar" title="APG" time="12:45 - 14:15"></CalEvent>
          <CalEvent type="seminar" title="DPG" time="14:30 - 16:00">
            <Deets>
              <Cz>V tom spešl týmu + dělá docházku</Cz>
              <En>In separate team + takes attendance</En>
              <br />
              <Cz>Odevzdávání ve 13. týdnu</Cz>
              <En>Project deadline: week 13</En>
            </Deets>
          </CalEvent>
        </Day>
        <Day>
          <DayTitle>
            <Cz>Úterý/</Cz>Tuesday
          </DayTitle>
          <CalEvent type="lecture" title="GPU" time="11:00 - 12:30"></CalEvent>
          <CalEvent type="seminar" title="GPU" time="14:30 - 16:00"></CalEvent>
        </Day>
        <Day>
          <DayTitle>
            <Cz>Středa/</Cz>Wednesday
          </DayTitle>
          <CalEvent type="lecture" title="APG" time="16:15 - 17:45"></CalEvent>
        </Day>
        <Day>
          <DayTitle>
            <Cz>Čtvrtek/</Cz>Thursday
          </DayTitle>
          <CalEvent type="lecture" title="VG" time="9:15 - 10:45"></CalEvent>
          <CalEvent type="seminar" title="VG" time="11:00 - 12:30"></CalEvent>
          <CalEvent type="lecture" title="MMA" time="12:45 - 14:15"></CalEvent>
          <CalEvent type="seminar" title="MMA" time="14:30 - 16:00"></CalEvent>
        </Day>
        <Day>
          <DayTitle>
            <Cz>Pátek/</Cz>Friday
          </DayTitle>
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

function useQueryParam(param: string) {
  const router = useRouter()

  const current = router.query[param]
  return [
    current,
    useCallback(
      (value: string | null) => {
        const q = { ...router.query, [param]: value }
        if (value === null) delete q[param]
        router.replace({ query: q })
      },
      [router, param],
    ),
  ] as const
}

function useBooleanQueryParam(param: string, def: boolean) {
  const [v, setV] = useQueryParam(param)
  return [
    def ? v !== 'false' : v === 'true',
    useCallback(
      (value: boolean) => {
        setV(value ? (def ? null : 'true') : def ? 'false' : null)
      },
      [def, setV],
    ),
  ] as const
}

function Link({ to, children }: { to: string; children: ReactNode }) {
  return (
    <a
      href={to}
      target="_blank"
      rel="noopener noreferrer"
      css={{ color: 'black' }}
    >
      {children}
    </a>
  )
}

function MaybeLink({
  to,
  children,
}: {
  to: string | null
  children: React.ReactNode
}) {
  if (!to) return <>{children}</>
  return <Link to={to}>{children}</Link>
}

function useSetOnWindow(name: string, value: unknown) {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyWindow = typeof window !== 'undefined' ? (window as any) : null
    if (!anyWindow) return
    const prev = anyWindow[name]
    anyWindow[name] = value
    return () => {
      if (!prev) delete anyWindow[name]
      else anyWindow[name] = prev
    }
  }, [name, value])
}

function safeParse(v: string | null) {
  if (v === null) return null
  try {
    return JSON.parse(v)
  } catch {
    return null
  }
}

let isSSR = true

function useLocalStorage(key: string) {
  const [value, setValue] = useState(() => {
    if (isSSR) return null
    return localStorage.getItem(key) ?? null
  })
  useEffect(() => {
    setValue((v) => (v === null ? localStorage.getItem(key) ?? null : v))
    isSSR = false
    window.addEventListener('storage', (event) => {
      if (event.key !== key) return
      setValue(event.newValue)
    })
  }, [key])
  return [
    useMemo(() => safeParse(value), [value]),
    useCallback(
      (value: unknown) => {
        const json = value === null ? null : JSON.stringify(value)
        if (json === null) localStorage.removeItem(key)
        else localStorage.setItem(key, json)
        setValue(json)
      },
      [key],
    ),
  ] as const
}
