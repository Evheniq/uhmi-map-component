import type { Map } from '@maptiler/sdk'

/** A single color stop in the step legend */
export interface ColorStop {
  value: number
  color: string
}

/** Which parent / child is selected */
export interface MapSelection {
  parentCode: string | null
  childCode: string | null
}

/** GeoJSON sources supplied by the consumer */
export interface MapDataSources {
  /** Parent polygons — shown as outlines. Features need `code`, `name` */
  parents?: GeoJSON.FeatureCollection
  /** Child polygons — shown as colored fills. Features need `code`, `name`, `parentCode`, `value` */
  children?: GeoJSON.FeatureCollection
  /** Point markers — shown as circles. Features need `code`, `name`, `value`, optional `parentCode` */
  points?: GeoJSON.FeatureCollection
  /** Mask layer — transparent fill used to dismiss tooltips outside data area */
  mask?: GeoJSON.FeatureCollection
}

/** Style overrides for polygon layers */
export interface PolygonLayerStyle {
  fillOpacity?: number
  fillOutlineColor?: string
  parentLineColor?: string
  parentLineWidth?: number
  selectedLineColor?: string
  selectedParentLineWidth?: number
  selectedChildLineWidth?: number
}

/** Style overrides for point (circle) layers */
export interface PointLayerStyle {
  circleRadius?: number
  circleColor?: string
  circleStrokeWidth?: number
  circleStrokeColor?: string
}

/** Information about a hovered / clicked feature */
export interface HoverFeatureInfo {
  /** Feature code (unique ID) */
  code: string
  /** Feature display name */
  name: string
  /** Current data value (may be null for no-data) */
  value: number | null
  /** Parent code (for child features) */
  parentCode?: string
  /** All feature properties */
  properties: Record<string, any>
  /** Longitude / latitude of the hover point */
  lngLat: { lng: number; lat: number }
}

/** Props accepted by MtpMap */
export interface MtpMapProps {
  sources: MapDataSources
  colorStops: ColorStop[]
  mapStyle?: string
  apiKey?: string
  center?: [number, number]
  zoom?: number
  selection?: MapSelection
  displayMode?: 'polygons' | 'points'
  polygonStyle?: PolygonLayerStyle
  pointStyle?: PointLayerStyle
  tooltipEnabled?: boolean
  tooltipContent?: (info: HoverFeatureInfo) => string
  syncGroup?: string
  minHeight?: string
  loading?: boolean
}

/** Props accepted by MtpLegend */
export interface MtpLegendProps {
  colorStops: ColorStop[]
  unit?: string
  orientation?: 'vertical' | 'horizontal' | 'auto'
}

/** Events emitted by MtpMap */
export interface MtpMapEmits {
  (e: 'hover', info: HoverFeatureInfo | null): void
  (e: 'click', info: HoverFeatureInfo): void
  (e: 'mapReady', map: Map): void
}

/** Default polygon styles — matching the original project */
export const DEFAULT_POLYGON_STYLE: Required<PolygonLayerStyle> = {
  fillOpacity: 0.75,
  fillOutlineColor: 'rgba(255,255,255,.9)',
  parentLineColor: '#8a9db2',
  parentLineWidth: 3,
  selectedLineColor: 'rgba(17,59,102,1)',
  selectedParentLineWidth: 3,
  selectedChildLineWidth: 1.5,
}

/** Default point styles — matching the original project */
export const DEFAULT_POINT_STYLE: Required<PointLayerStyle> = {
  circleRadius: 10,
  circleColor: '#6C7681',
  circleStrokeWidth: 1.1,
  circleStrokeColor: 'rgba(0,0,0,.7)',
}
