<template>
  <div class="mtp-map-block">
    <div v-if="props.loading" class="mtp-spinner-overlay">
      <div class="mtp-spinner" />
    </div>

    <div
      ref="mapContainer"
      :id="mapId"
      class="mtp-map-container"
      :style="{ height: props.minHeight ?? '404px' }"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onUnmounted, computed, toRef } from 'vue'
import * as maptilersdk from '@maptiler/sdk'
import '@maptiler/sdk/dist/maptiler-sdk.css'

import type {
  MapDataSources,
  ColorStop,
  MapSelection,
  PolygonLayerStyle,
  PointLayerStyle,
  HoverFeatureInfo,
} from '../types'

import {
  addLayers,
  setDisplayMode,
  applyColors,
  applySelection,
  updateSourceData,
  LAYER_IDS,
  SOURCE_IDS,
} from '../composables/useLayerManager'

import { useHover } from '../composables/useHover'
import { addMapToSyncGroup, removeMapFromSyncGroup } from '../composables/useMapSync'

interface Props {
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

const props = withDefaults(defineProps<Props>(), {
  mapStyle: '',
  apiKey: '',
  center: () => [0, 0],
  zoom: 2,
  selection: () => ({ parentCode: null, childCode: null }),
  displayMode: 'polygons',
  tooltipEnabled: true,
  minHeight: '404px',
  loading: false,
})

const emit = defineEmits<{
  (e: 'hover', info: HoverFeatureInfo | null): void
  (e: 'click', info: HoverFeatureInfo): void
  (e: 'mapReady', map: maptilersdk.Map): void
}>()

let mapIdCounter = 0
const mapId = `mtp-map-${++mapIdCounter}-${Date.now()}`

const mapContainer = ref<HTMLDivElement | null>(null)
const mapRef = ref<maptilersdk.Map | null>(null)
const styleLoaded = ref(false)

let hoverCleanup: (() => void) | null = null

onMounted(() => {
  // Set API key globally for MapTiler SDK v2
  if (props.apiKey) {
    maptilersdk.config.apiKey = props.apiKey
  }

  const styleUrl = props.mapStyle || maptilersdk.MapStyle.STREETS

  const map = new maptilersdk.Map({
    container: mapContainer.value!,
    style: styleUrl,
    center: props.center as [number, number],
    zoom: props.zoom,
    preserveDrawingBuffer: true,
    navigationControl: 'bottom-right',
    geolocateControl: false,
    terrainControl: false,
    scaleControl: false,
    fullscreenControl: false,
    projection: { type: 'mercator' },
  } as any)

  mapRef.value = map

  if (props.syncGroup) {
    addMapToSyncGroup(map as any, props.syncGroup)
  }

  map.on('load', () => {
    addLayers(map as any, {
      parents: props.sources.parents,
      children: props.sources.children,
      points: props.sources.points,
      mask: props.sources.mask,
      polygonStyle: props.polygonStyle,
      pointStyle: props.pointStyle,
    })

    // Apply initial display mode
    setDisplayMode(map as any, props.displayMode)

    // Apply initial colors
    if (props.colorStops.length) {
      applyColors(map as any, props.colorStops)
    }

    // Apply initial selection
    applySelection(map as any, props.selection)

    styleLoaded.value = true

    // Setup hover
    const maskLayerIds: string[] = []
    if (props.sources.mask) {
      maskLayerIds.push(LAYER_IDS.mask)
    }

    const { destroy } = useHover({
      map: map,
      mapContainer,
      childLayerId: LAYER_IDS.childFill,
      pointLayerId: LAYER_IDS.pointCircle,
      childSourceId: SOURCE_IDS.children,
      pointSourceId: SOURCE_IDS.points,
      maskLayerIds,
      tooltipEnabled: toRef(props, 'tooltipEnabled'),
      tooltipContent: props.tooltipContent,
      onHover: (info) => emit('hover', info),
      onClick: (info) => emit('click', info),
    })
    hoverCleanup = destroy

    emit('mapReady', map)
  })
})

// Watch sources changes
watch(
  () => props.sources,
  (sources) => {
    if (!mapRef.value || !styleLoaded.value) return
    const map = mapRef.value as any

    if (sources.parents) {
      updateSourceData(map, SOURCE_IDS.parents, sources.parents)
    }
    if (sources.children) {
      updateSourceData(map, SOURCE_IDS.children, sources.children)
    }
    if (sources.points) {
      updateSourceData(map, SOURCE_IDS.points, sources.points)
    }
    if (sources.mask) {
      updateSourceData(map, SOURCE_IDS.mask, sources.mask)
    }
  },
  { deep: true }
)

// Watch color stops
watch(
  () => props.colorStops,
  (stops) => {
    if (!mapRef.value || !styleLoaded.value || !stops.length) return
    applyColors(mapRef.value as any, stops)
  },
  { deep: true }
)

// Watch display mode
watch(
  () => props.displayMode,
  (mode) => {
    if (!mapRef.value || !styleLoaded.value) return
    setDisplayMode(mapRef.value as any, mode)
  }
)

// Watch selection
watch(
  () => props.selection,
  (sel) => {
    if (!mapRef.value || !styleLoaded.value) return
    applySelection(mapRef.value as any, sel)
  },
  { deep: true }
)

onUnmounted(() => {
  if (hoverCleanup) {
    hoverCleanup()
  }
  if (mapRef.value && props.syncGroup) {
    removeMapFromSyncGroup(mapRef.value as any, props.syncGroup)
  }
  if (mapRef.value) {
    mapRef.value.remove()
  }
})
</script>

<style scoped>
.mtp-map-block {
  display: flex;
  width: 100%;
  position: relative;
}

.mtp-map-container {
  position: relative;
  width: 100%;
  border: 1px solid #6c7681;
  border-radius: 7px;
  overflow: hidden;
}

.mtp-spinner-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
}

.mtp-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #ccc;
  border-top-color: #1d70b8;
  border-radius: 50%;
  animation: mtp-spin 0.8s linear infinite;
}

@keyframes mtp-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

<style>
/* Global styles for MapTiler popup — same as original */
.maplibregl-popup {
  z-index: 100000 !important;
  pointer-events: none !important;
}

.maplibregl-popup-content {
  z-index: 100000 !important;
  pointer-events: none !important;
}

.mtp-tooltip {
  z-index: 100000 !important;
  position: relative;
  pointer-events: none;
}

.mtp-tooltip-inner {
  position: relative;
  background: rgba(255, 255, 255, 1);
  border-radius: 5px;
  padding: 11px 17px;
  z-index: 100000;
  box-sizing: border-box;
  font-family: Manrope, sans-serif;
  font-size: 16px;
  line-height: 24px;
}

@media (max-width: 767px) {
  .maplibregl-popup {
    max-width: calc(100vw - 20px) !important;
  }

  .maplibregl-popup-content {
    max-width: calc(100vw - 20px) !important;
    padding: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
  }

  .maplibregl-popup-tip {
    display: none !important;
  }

  .mtp-tooltip-inner {
    padding: 8px 10px;
    font-size: 14px;
    line-height: 20px;
  }
}
</style>
