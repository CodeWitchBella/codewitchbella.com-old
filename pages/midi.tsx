import { useEffect, useRef, useState } from 'react'

function useMidiSupported() {
  const [v, setV] = useState<boolean | null>(null)
  useEffect(() => {
    setV(!!navigator.requestMIDIAccess)
  }, [])
  return v
}

export default function MiDi() {
  const [devices, setDevices] = useState({
    midiIn: [] as MIDIInput[],
    midiOut: [] as MIDIOutput[],
  })
  const supported = useMidiSupported()

  console.log(devices)

  return (
    <div>
      <MidiListener
        onStateChange={(midi) => {
          setDevices({
            midiIn: Array.from(midi.inputs.values()),
            midiOut: Array.from(midi.outputs.values()),
          })
        }}
      />
      {supported
        ? 'Your browser supports WebMiDi'
        : supported === false
        ? 'WebMiDi not supported on your browser'
        : 'Loading...'}
      <pre>
        <code>{JSON.stringify(devices, null, 2)}</code>
      </pre>
      {devices.midiIn.map((device, key) => (
        <MidiInputDevice key={key} device={device} />
      ))}
    </div>
  )
}

function MidiInputDevice({ device }: { device: MIDIInput }) {
  const [notesOn, setNotesOn] = useState<number[]>([])
  useEffect(() => {
    const notesOn = new Map()
    function midiMessageReceived(event: MIDIMessageEvent) {
      // MIDI commands we care about. See
      // http://webaudio.github.io/web-midi-api/#a-simple-monophonic-sine-wave-midi-synthesizer.
      const NOTE_ON = 9
      const NOTE_OFF = 8

      const cmd = event.data[0] >> 4
      const pitch = event.data[1]
      const velocity = event.data.length > 2 ? event.data[2] : 1

      // You can use the timestamp to figure out the duration of each note.
      const timestamp = Date.now()

      // Note that not all MIDI controllers send a separate NOTE_OFF command for every NOTE_ON.
      if (cmd === NOTE_OFF || (cmd === NOTE_ON && velocity === 0)) {
        setNotesOn((prev) => prev.filter((p) => p !== pitch))
        console.log(
          `🎧 from ${event.currentTarget.name} note off: pitch:${pitch}, velocity: ${velocity}`,
        )

        // Complete the note!
        const note = notesOn.get(pitch)
        if (note) {
          console.log(`🎵 pitch:${pitch}, duration:${timestamp - note} ms.`)
          notesOn.delete(pitch)
        }
      } else if (cmd === NOTE_ON) {
        setNotesOn((prev) => prev.filter((p) => p !== pitch).concat(pitch))
        console.log(
          `🎧 from ${event.currentTarget.name} note off: pitch:${pitch}, velocity: {velocity}`,
        )

        // One note can only be on at once.
        notesOn.set(pitch, timestamp)
      }
    }
    device.addEventListener('midimessage', midiMessageReceived)
    return () => {
      device.removeEventListener('midimessage', midiMessageReceived)
    }
  }, [device])
  return <div>{JSON.stringify(notesOn)}</div>
}

function MidiListener({
  onStateChange,
}: {
  onStateChange: (midi: MIDIAccess) => void
}) {
  const [midi, setMidi] = useState<MIDIAccess | null>(null)
  useEffect(() => {
    navigator.requestMIDIAccess().then(setMidi)
  }, [])

  const ref = useRef(onStateChange)
  useEffect(() => {
    ref.current = onStateChange
  })

  useEffect(() => {
    if (!midi) return
    const handleStateChange = () => {
      ref.current?.(midi)
    }
    ref.current?.(midi)
    midi?.addEventListener('statechange', handleStateChange)
    return () => {
      midi?.removeEventListener('statechange', handleStateChange)
    }
  }, [midi])

  return null
}
