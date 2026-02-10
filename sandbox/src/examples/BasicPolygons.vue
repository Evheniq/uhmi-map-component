<script setup lang="ts">
import { MtpMap, MtpLegend, type ColorStop } from 'vue-maptiler-polygons'
import parentBasins from '../data/parentBasins.json'
import childBasins from '../data/childBasins.json'
import sampleStops from '../data/sampleStops.json'

const MAP_STYLE = import.meta.env.VITE_MAP_STYLE

const sources = {
  parents: parentBasins as any,
  children: childBasins as any,
}

const colorStops: ColorStop[] = sampleStops
</script>

<template>
  <div>
    <h2>Basic Polygons</h2>
    <p>Parent basins shown as outlines, child basins as colored fills based on their <code>value</code>.</p>

    <div class="layout">
      <div class="map-area">
        <MtpMap
          :sources="sources"
          :color-stops="colorStops"
          :map-style="MAP_STYLE"
          :center="[31, 49]"
          :zoom="5"
          min-height="500px"
        />
      </div>
      <div class="legend-area">
        <MtpLegend :color-stops="colorStops" unit="m³/s" orientation="vertical" />
      </div>
    </div>
  </div>
</template>

<style scoped>
h2 { margin-bottom: 8px; color: #082f57; }
p { margin-bottom: 16px; color: #555; }
.layout { display: flex; gap: 16px; }
.map-area { flex: 1; }
.legend-area { flex-shrink: 0; }

@media (max-width: 768px) {
  .layout { flex-direction: column; }
}
</style>
