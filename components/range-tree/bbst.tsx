import type { Points } from './range-tree-state'

export type BBSTNode = {
  value: number
  left: BBSTNode | null
  right: BBSTNode | null
}

export function makeBBST(points: Points) {
  let layer = points
    .map(({ x }): BBSTNode => ({ value: x, left: null, right: null }))
    .sort(({ value: a }, { value: b }) => a - b)
  const layers: BBSTNode[][] = [layer]
  while (layer.length > 1) {
    const newLayer: BBSTNode[] = []
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i]
      const right = i + 1 >= layer.length ? null : layer[i + 1]
      newLayer.push({ value: findMax(left) ?? left.value, left, right })
    }
    layers.unshift(newLayer)
    layer = newLayer
  }
  return { root: layer[0], layers }
}

function findMax(node: BBSTNode | null): number | null {
  if (!node) return null
  return Math.max(
    node.value,
    findMax(node.left) ?? Number.NEGATIVE_INFINITY,
    findMax(node.right) ?? Number.NEGATIVE_INFINITY,
  )
}
