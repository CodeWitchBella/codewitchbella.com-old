/** @jsx jsx */
import { jsx } from '@emotion/react'
import styled from '@emotion/styled'
import { useRouter } from 'next/dist/client/router'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalEvent,
  Cz,
  Deets,
  En,
  EventProvider,
  Room,
} from '../../components/calendar-event'
import { DateTime, Interval } from 'luxon'

function WeekNumber({ children }: { children: JSX.Element | JSX.Element[] }) {
  const [week, setWeek] = useState<null | number>(null)

  useEffect(() => {
    const int = Interval.fromDateTimes(
      DateTime.fromObject({ year: 2021, month: 2, day: 1 }),
      DateTime.local(),
    ).toDuration()
    const week = int.as('week') - 2
    setWeek(Math.floor(week <= 0 ? week : week + 1))
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
  const [room, setRoom] = useBooleanQueryParam('room', false)
  const [links, setLinks] = useLocalStorage('rozvrh:links')

  useSetOnWindow('setLink', (type: string, value: string) => {
    setLinks({ ...links, [type]: value })
  })

  return (
    <EventProvider
      value={{
        showTitles,
        czech: !english,
        deets,
        room,
        subjects: {
          PSA: {
            longcode: 'B3B04PSA',
            name: 'Akademické psaní',
            enname: 'Academic Writing',
            deets: <></>,
          },
          TAL: {
            longcode: 'B4M01TAL',
            name: 'Teorie algoritmů',
            enname: 'Theory of Algorithms',
            deets: <></>,
          },
          GVG: {
            longcode: 'B4M33GVG',
            name: 'Geometrie počítačového vidění a grafiky',
            enname: 'Geometry of Computer Vision and Graphics',
            deets: (
              <>
                <Link to="https://cw.fel.cvut.cz/wiki/courses/gvg/start">
                  CourseWare
                </Link>
              </>
            ),
          },
          KO: {
            longcode: 'B4M35KO',
            name: 'Kombinatorická optimalizace',
            enname: 'Combinatorial Optimization',
            deets: (
              <>
                <div>Hanzálek</div>
                <Link to="https://cw.fel.cvut.cz/wiki/courses/ko/start">
                  CourseWare
                </Link>
              </>
            ),
          },
          VIZ: {
            longcode: 'B4M39VIZ',
            name: 'Vizualizace',
            enname: 'Visualization',
            deets: (
              <>
                <div>Čmolík</div>
                <Link to="https://moodle.fel.cvut.cz/course/view.php?id=5728">
                  Moodle
                </Link>
              </>
            ),
          },
          ITT: {
            longcode: 'B0M39ITT2',
            name: 'Intermediální tvorba a technologie II',
            enname: 'Applied Multimedia and Technology II',
            deets: (
              <>
                <div>
                  Teams
                  <br />
                  <Link to="https://cw.fel.cvut.cz/wiki/courses/b0m39itt2/start">
                    CourseWare
                  </Link>
                </div>
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
        <label>
          <input
            type="checkbox"
            onChange={(evt) => setRoom(evt.target.checked)}
            css={{ paddingInlineEnd: '.5rem' }}
            checked={room}
          />
          <Cz>Zobrazit místnosti</Cz>
          <En>Show rooms</En>
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
          <CalEvent type="seminar" title="PSA" time="9:15 - 10:45">
            <Room>T2:E1-106</Room>
          </CalEvent>
          <CalEvent type="lecture" title="GVG" time="12:45 - 14:15">
            <Room>KN:E-126</Room>
          </CalEvent>
          <CalEvent type="seminar" title="GVG" time="14:30 - 16:00">
            <Room>KN:E-230</Room>
          </CalEvent>
        </Day>
        <Day>
          <DayTitle>
            <Cz>Úterý/</Cz>Tuesday
          </DayTitle>
          <CalEvent type="lecture" title="TAL" time="08:15 - 10:45">
            <Room>T2:D3-209 (Dejvice)</Room>
          </CalEvent>
          <CalEvent type="lecture" title="KO" time="11:45 - 14:15">
            <Room>T2:D3-309 (Dejvice)</Room>
          </CalEvent>
          <CalEvent type="seminar" title="KO" time="14:30 - 16:00">
            <Room>T2:H1-131 (Dejvice)</Room>
          </CalEvent>
        </Day>
        <Day>
          <DayTitle>
            <Cz>Středa/</Cz>Wednesday
          </DayTitle>
          <CalEvent type="seminar" title="TAL" time="12:45 - 14:15">
            <Room>T2:C3-52 (Dejvice)</Room>
          </CalEvent>
        </Day>
        <Day>
          <DayTitle>
            <Cz>Čtvrtek/</Cz>Thursday
          </DayTitle>
          <CalEvent type="lecture" title="VIZ" time="11:00 - 12:30">
            <Room>KN:E-301 (Šrámkova posluchárna)</Room>
            <Deets>
              <div>Youtube</div>
            </Deets>
          </CalEvent>
          <CalEvent type="seminar" title="VIZ" time="14:30 - 16:00">
            <Room>KN:E-327 (Solarium)</Room>
          </CalEvent>
        </Day>
        <Day>
          <DayTitle>
            <Cz>Pátek/</Cz>Friday
          </DayTitle>
          <CalEvent type="lab" title="ITT" time="12:45 - 16:00">
            <Room>T2:H1-24c (Dejvice)</Room>
          </CalEvent>
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
