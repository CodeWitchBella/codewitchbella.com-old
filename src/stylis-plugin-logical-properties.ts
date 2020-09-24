import type { StylisElement } from '@emotion/cache'

export function stylisPluginLogicalProperties(
  element: StylisElement,
  index: number,
  children: Array<StylisElement>,
): string | undefined {
  if (element.type === 'decl') {
    const decl = element.value.substring(0, element.value.indexOf(';'))
    const [name, value] = decl.split(':')
    for (const [suffix, repl] of suffixes) {
      if (name.endsWith(suffix)) {
        const prefix = name.substring(0, name.length - suffix.length)
        const values = value.trim().split(/ +/g)

        return (
          repl
            .map((rep, i) => prefix + rep + ':' + values[i % values.length])
            .join(';') + ';'
        )
      }
    }
  }
  return undefined
}

const suffixes = Object.entries({
  '-inline': ['-inline-start', '-inline-end'],
  '-block': ['-block-start', '-block-end'],
})

Object.defineProperty(stylisPluginLogicalProperties, 'name', {
  value: 'stylis-plugin-logical-properties',
})
