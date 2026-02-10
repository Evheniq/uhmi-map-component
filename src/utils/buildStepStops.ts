import type { ColorStop } from '../types'

/**
 * Builds a MapTiler `step` expression stops array from color stops.
 *
 * Given sorted `[{value, color}]` entries, produces:
 *   `[defaultColor, threshold1, color1, threshold2, color2, ...]`
 *
 * This is used inside `['step', ['get', 'value'], ...stops]` expressions.
 */
export function buildStepStops(data: ColorStop[]): (string | number)[] {
  const sorted = [...data].sort((a, b) => a.value - b.value)

  const [first, ...rest] = sorted
  const stops: (string | number)[] = [first.color] // default color (below first threshold)

  for (const { value, color } of rest) {
    stops.push(value, color)
  }

  return stops
}
