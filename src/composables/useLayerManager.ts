import type { Map as MaptilerMap } from '@maptiler/sdk'
type Map = MaptilerMap
import type { ColorStop, PolygonLayerStyle, PointLayerStyle, MapSelection } from '../types'
import { DEFAULT_POLYGON_STYLE, DEFAULT_POINT_STYLE } from '../types'
import {
  buildFillColorExpression,
  buildCircleColorExpression,
  buildCircleStrokeExpression,
  buildChildFilter,
  buildParentOutlineFilter,
  buildChildOutlineFilter,
} from '../utils/layerHelpers'

// Layer IDs used by the library — prefixed with `mtp-`
export const LAYER_IDS = {
  childFill: 'mtp-child-fill',
  parentLine: 'mtp-parent-line',
  pointCircle: 'mtp-point-circle',
  childOutline: 'mtp-child-outline',
  parentOutline: 'mtp-parent-outline',
  childOutlineDots: 'mtp-child-outline-dots',
  mask: 'mtp-mask',
} as const

export const SOURCE_IDS = {
  parents: 'mtp-parents-source',
  children: 'mtp-children-source',
  points: 'mtp-points-source',
  mask: 'mtp-mask-source',
} as const

function layerExists(map: Map, id: string): boolean {
  return !!map.getLayer(id)
}

/**
 * Add all sources and layers to the map.
 */
export function addLayers(
  map: Map,
  options: {
    parents?: GeoJSON.FeatureCollection
    children?: GeoJSON.FeatureCollection
    points?: GeoJSON.FeatureCollection
    mask?: GeoJSON.FeatureCollection
    polygonStyle?: PolygonLayerStyle
    pointStyle?: PointLayerStyle
  }
) {
  const ps = { ...DEFAULT_POLYGON_STYLE, ...options.polygonStyle }
  const pts = { ...DEFAULT_POINT_STYLE, ...options.pointStyle }

  const emptyFC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }

  // Sources
  map.addSource(SOURCE_IDS.parents, { type: 'geojson', data: options.parents ?? emptyFC })
  map.addSource(SOURCE_IDS.children, { type: 'geojson', data: options.children ?? emptyFC })
  map.addSource(SOURCE_IDS.points, { type: 'geojson', data: options.points ?? emptyFC })
  if (options.mask) {
    map.addSource(SOURCE_IDS.mask, { type: 'geojson', data: options.mask })
  }

  // Child fill layer
  map.addLayer({
    id: LAYER_IDS.childFill,
    type: 'fill',
    source: SOURCE_IDS.children,
    paint: {
      'fill-opacity': ps.fillOpacity,
      'fill-outline-color': ps.fillOutlineColor,
    },
  })

  // Parent line layer
  map.addLayer({
    id: LAYER_IDS.parentLine,
    type: 'line',
    source: SOURCE_IDS.parents,
    paint: {
      'line-color': ps.parentLineColor,
      'line-width': ps.parentLineWidth,
    },
  })

  // Point circle layer
  map.addLayer({
    id: LAYER_IDS.pointCircle,
    type: 'circle',
    source: SOURCE_IDS.points,
    paint: {
      'circle-radius': pts.circleRadius,
      'circle-color': pts.circleColor,
      'circle-stroke-width': pts.circleStrokeWidth,
      'circle-stroke-color': pts.circleStrokeColor,
    },
  })

  // Selection outline for child
  map.addLayer({
    id: LAYER_IDS.childOutline,
    type: 'line',
    source: SOURCE_IDS.children,
    paint: {
      'line-color': ps.selectedLineColor,
      'line-width': ps.selectedChildLineWidth,
    },
    filter: ['==', ['get', 'code'], 999999], // hidden by default
  })

  // Outline for children when in dots mode
  map.addLayer({
    id: LAYER_IDS.childOutlineDots,
    type: 'line',
    source: SOURCE_IDS.children,
    paint: {
      'line-color': ps.parentLineColor,
      'line-width': ps.selectedChildLineWidth,
    },
    filter: ['==', ['get', 'code'], ''],
  })

  // Selection outline for parent
  map.addLayer({
    id: LAYER_IDS.parentOutline,
    type: 'line',
    source: SOURCE_IDS.parents,
    paint: {
      'line-color': ps.selectedLineColor,
      'line-width': ps.selectedParentLineWidth,
    },
    filter: ['==', ['get', 'code'], ''],
  })

  // Mask layer (dismisses tooltips)
  if (options.mask) {
    map.addLayer({
      id: LAYER_IDS.mask,
      type: 'fill',
      source: SOURCE_IDS.mask,
      paint: { 'fill-color': 'rgba(0,0,0,0)' },
    })
  }

  // Move label layers on top if they exist
  for (const label of ['City labels', 'Place labels', 'Town labels', 'Water', 'River', 'Waterway', 'Water line']) {
    if (layerExists(map, label)) {
      try { map.moveLayer(label) } catch { /* ignore */ }
    }
  }

  // Points layer on top
  if (layerExists(map, LAYER_IDS.pointCircle)) {
    map.moveLayer(LAYER_IDS.pointCircle)
  }
}

/**
 * Update the display mode — show polygons or points.
 */
export function setDisplayMode(map: Map, mode: 'polygons' | 'points') {
  if (layerExists(map, LAYER_IDS.pointCircle)) {
    map.setLayoutProperty(LAYER_IDS.pointCircle, 'visibility', mode === 'points' ? 'visible' : 'none')
  }
  if (layerExists(map, LAYER_IDS.childFill)) {
    map.setLayoutProperty(LAYER_IDS.childFill, 'visibility', mode === 'polygons' ? 'visible' : 'none')
  }
}

/**
 * Apply color stops to fill and circle layers.
 */
export function applyColors(map: Map, colorStops: ColorStop[]) {
  if (layerExists(map, LAYER_IDS.childFill)) {
    map.setPaintProperty(LAYER_IDS.childFill, 'fill-color', buildFillColorExpression(colorStops))
  }
  if (layerExists(map, LAYER_IDS.pointCircle)) {
    map.setPaintProperty(LAYER_IDS.pointCircle, 'circle-color', buildCircleColorExpression(colorStops))
    const strokeWidth = DEFAULT_POINT_STYLE.circleStrokeWidth
    map.setPaintProperty(LAYER_IDS.pointCircle, 'circle-stroke-width', buildCircleStrokeExpression(strokeWidth))
  }
}

/**
 * Apply selection filters to outline layers and child visibility.
 */
export function applySelection(map: Map, selection: MapSelection) {
  if (layerExists(map, LAYER_IDS.parentOutline)) {
    map.setFilter(LAYER_IDS.parentOutline, buildParentOutlineFilter(selection) as any)
  }
  if (layerExists(map, LAYER_IDS.childOutline)) {
    map.setFilter(LAYER_IDS.childOutline, buildChildOutlineFilter(selection) as any)
  }

  const childFilter = buildChildFilter(selection)
  if (layerExists(map, LAYER_IDS.childFill)) {
    map.setFilter(LAYER_IDS.childFill, childFilter as any)
  }
  if (layerExists(map, LAYER_IDS.pointCircle)) {
    map.setFilter(LAYER_IDS.pointCircle, childFilter as any)
  }
}

/**
 * Update source data for a given source ID.
 */
export function updateSourceData(map: Map, sourceId: string, data: GeoJSON.FeatureCollection) {
  const source = map.getSource(sourceId) as any
  if (source) {
    source.setData(data)
  }
}
