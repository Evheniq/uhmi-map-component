// Components
export { default as MtpMap } from './components/MtpMap.vue'
export { default as MtpLegend } from './components/MtpLegend.vue'
export { default as MtpTooltip } from './components/MtpTooltip.vue'

// Types
export type {
  ColorStop,
  MapSelection,
  MapDataSources,
  PolygonLayerStyle,
  PointLayerStyle,
  HoverFeatureInfo,
  MtpMapProps,
  MtpLegendProps,
  MtpMapEmits,
} from './types'

export { DEFAULT_POLYGON_STYLE, DEFAULT_POINT_STYLE } from './types'

// Utilities
export { buildStepStops } from './utils/buildStepStops'
export {
  buildFillColorExpression,
  buildCircleColorExpression,
  buildCircleStrokeExpression,
  buildChildFilter,
  buildParentOutlineFilter,
  buildChildOutlineFilter,
} from './utils/layerHelpers'

// Composables
export { addMapToSyncGroup, removeMapFromSyncGroup, getSyncGroupSize } from './composables/useMapSync'
export { useHover } from './composables/useHover'
export {
  addLayers,
  setDisplayMode,
  applyColors,
  applySelection,
  updateSourceData,
  LAYER_IDS,
  SOURCE_IDS,
} from './composables/useLayerManager'
