/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-interface */

interface Navigator {
  requestMIDIAccess(): Promise<any>
}

interface MIDIAccess extends EventTarget {
  readonly inputs: MIDIInputMap
  readonly outputs: MIDIOutputMap
}

interface MIDIInputMap extends ReadonlyMap<any, MIDIInput> {}

interface MIDIOutputMap extends ReadonlyMap<any, MIDIOutput> {}

interface MIDIInput extends EventTarget {
  addEventListener(
    event: 'midimessage',
    event: (event: MIDIMessageEvent) => void,
  ): void
  removeEventListener(
    event: 'midimessage',
    event: (event: MIDIMessageEvent) => void,
  ): void
  name: string
}

interface MIDIOutput {}

interface MIDIMessageEvent extends Event {
  data: Uint8Array
  currentTarget: MIDIInput
}
