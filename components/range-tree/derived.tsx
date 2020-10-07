import type { Highlight, Points } from './range-tree-state'

export function makeFractal(points: Points) {
  type FractalNodeWork = FractalNode<{ x: number; id: number }>
  let keyGen = 1
  let layer = [...points]
    .sort(({ x: a }, { x: b }) => a - b)
    .map(
      (point): FractalNodeWork => ({
        x: point.x,
        value: point.y,
        id: point.id,
        left: null,
        right: null,
        sibRight: null,
        key: ++keyGen,
      }),
    )

  const layers: FractalNode[][] = [layer]
  while (layer.length > 1) {
    const newLayer: FractalNodeWork[] = []
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i]
      const right: FractalNodeWork | null = layer[i + 1] ?? null
      const nodes = [...getFractalValues(left), ...getFractalValues(right)]
        .sort(({ value: a }, { value: b }) => a - b)
        .map(
          // eslint-disable-next-line no-loop-func
          (node, i, list): FractalNodeWork => ({
            ...node,
            // this could be more optimal but :shrug:
            left: findFirstSameOrLarger(left, node.value),
            right: findFirstSameOrLarger(right, node.value),
            key: ++keyGen,
          }),
        )
      let j = 0
      for (const node of nodes) {
        node.sibRight = nodes[++j] ?? null
      }
      newLayer.push(nodes[0])
    }
    layers.push(newLayer)
    layer = newLayer
  }

  return { layers: layers.reverse(), root: layer[0] }
}

function findFirstSameOrLarger<T>(node: FractalNode<T>, value: number) {
  for (let n: FractalNode<T> | null = node; n; n = n.sibRight) {
    if (n.value >= value) return n
  }
  return null
}

function getFractalValues<T>(a: FractalNode<T> | null): FractalNode<T>[] {
  return getFractalNodes(a).map((node) => ({
    ...node,
    left: null,
    right: null,
    sibRight: null,
  }))
}

export function getFractalNodes<T>(a: FractalNode<T> | null): FractalNode<T>[] {
  const nodes: FractalNode<T>[] = []
  for (let node: FractalNode<T> | null = a; node; node = node.sibRight) {
    nodes.push(node)
  }
  return nodes
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type FractalNode<Ext = {}> = Ext & {
  left: FractalNode<Ext> | null
  right: FractalNode<Ext> | null
  sibRight: FractalNode<Ext> | null
  value: number
  key: number
  x: number
}

export function comesFrom(node: FractalNode, from: FractalNode | null) {
  if (from === null) return false
  if (node === from) return true
  if (comesFrom(node, from.left)) return true
  if (comesFrom(node, from.right)) return true
  return false
}

export function findHighlightedNodeFractal(
  fractal: ReturnType<typeof makeFractal>,
  highlight: Highlight,
  ymin: number,
): FractalNode | null {
  let start: FractalNode | null = fractal.root
  while (start && start.value < ymin) {
    start = start.sibRight
  }
  if (!start) return null

  return highlight.path
    .slice(1)
    .reduce<FractalNode | null>((v, cur) => v?.[cur] ?? null, start)
}
