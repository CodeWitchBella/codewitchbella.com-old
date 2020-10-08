import type { Points } from './range-tree-state'

export type BBSTNode = {
  value: number
  y: number
  left: BBSTNode | null
  right: BBSTNode | null
}

export function makeBBST(points: Points) {
  let layer = points
    .map(({ x, y }): BBSTNode => ({ value: x, left: null, right: null, y }))
    .sort(({ value: a }, { value: b }) => a - b)
  const layers: BBSTNode[][] = [layer]
  while (layer.length > 1) {
    const newLayer: BBSTNode[] = []
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i]
      const right = i + 1 >= layer.length ? null : layer[i + 1]
      const max = findMax(left)
      newLayer.push({
        value: max?.value ?? left.value,
        left,
        right,
        y: max?.y ?? left.y,
      })
    }
    layers.unshift(newLayer)
    layer = newLayer
  }
  return { root: layer[0], layers }
}

function findMax(node: BBSTNode | null): BBSTNode | null {
  if (!node) return null

  const left = findMax(node.left)
  const right = findMax(node.right)
  return max(left, max(right, node))
}

function max(a: BBSTNode | null, b: BBSTNode | null) {
  if (!a && !b) return null
  if (!a) return b
  if (!b) return a
  if (a.value > b.value) return a
  return b
}
