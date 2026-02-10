import type { ColorStop, MapSelection } from '../types'
import { buildStepStops } from './buildStepStops'

/**
 * Build a `fill-color` paint expression for polygon layers.
 * Returns a `case` expression that handles undefined/null values,
 * then falls through to a `step` color ramp.
 */
export function buildFillColorExpression(colorStops: ColorStop[]): any[] {
  const stops = buildStepStops(colorStops)
  return [
    'case',
    ['any', ['==', ['get', 'value'], 'undefined'], ['==', ['get', 'value'], 'null']],
    '#ffffff',
    ['step', ['coalesce', ['get', 'value'], 0], ...stops],
  ]
}

/**
 * Build a `circle-color` paint expression for point layers.
 * Same as fill but treats 'undefined' as transparent (hidden).
 */
export function buildCircleColorExpression(colorStops: ColorStop[]): any[] {
  const stops = buildStepStops(colorStops)
  return [
    'case',
    ['==', ['get', 'value'], 'undefined'],
    'rgba(0,0,0,0)',
    ['==', ['get', 'value'], 'null'],
    '#ffffff',
    ['step', ['coalesce', ['get', 'value'], 0], ...stops],
  ]
}

/**
 * Build a `circle-stroke-width` expression that hides strokes for undefined values.
 */
export function buildCircleStrokeExpression(strokeWidth: number): any[] {
  return ['case', ['==', ['get', 'value'], 'undefined'], 0, strokeWidth]
}

/**
 * Build a filter expression for showing children of a selected parent,
 * or a specific child, or all features.
 */
export function buildChildFilter(selection: MapSelection): any[] | null {
  const { parentCode, childCode } = selection

  if (parentCode && childCode && parentCode !== childCode) {
    // Specific parent selected — show all its children
    return ['==', ['get', 'parentCode'], parentCode]
  }
  if (parentCode && parentCode === childCode) {
    // Parent selected as a single polygon (big basin mode) — show only this code
    return ['==', ['get', 'code'], parentCode]
  }
  // Show all
  return null
}

/**
 * Build a filter for the parent selection outline layer.
 */
export function buildParentOutlineFilter(selection: MapSelection): any[] {
  if (!selection.parentCode) {
    // Hide — match nothing
    return ['==', ['get', 'code'], '']
  }
  return ['==', ['get', 'code'], selection.parentCode]
}

/**
 * Build a filter for the child selection outline layer.
 */
export function buildChildOutlineFilter(selection: MapSelection): any[] {
  if (!selection.childCode || selection.childCode === selection.parentCode) {
    // Hide — match nothing
    return ['==', ['get', 'code'], 999999]
  }
  return ['==', ['get', 'code'], selection.childCode]
}
