<script setup lang="ts">
import { ref } from 'vue'
import { MtpMap, MtpLegend, type ColorStop } from 'vue-maptiler-polygons'
import parentBasins from '../data/parentBasins.json'
import childBasins from '../data/childBasins.json'
import points from '../data/points.json'
import sampleStops from '../data/sampleStops.json'

const MAP_STYLE = import.meta.env.VITE_MAP_STYLE

const sources = {
  parents: parentBasins as any,
  children: childBasins as any,
  points: points as any,
}
const colorStops: ColorStop[] = sampleStops

const displayMode = ref<'polygons' | 'points'>('polygons')

function toggle() {
  displayMode.value = displayMode.value === 'polygons' ? 'points' : 'polygons'
}
</script>

<template>
  <div>
    <h2>Points Mode</h2>
    <p>Toggle between polygon fills and circle point markers.</p>

    <div class="controls">
      <button @click="toggle">
        Switch to {{ displayMode === 'polygons' ? 'Points' : 'Polygons' }}
      </button>
      <span class="mode-label">Current mode: <strong>{{ displayMode }}</strong></span>
    </div>

    <div class="layout">
      <div class="map-area">
        <MtpMap
          :sources="sources"
          :color-stops="colorStops"
          :map-style="MAP_STYLE"
          :center="[31, 49]"
          :zoom="5"
          :display-mode="displayMode"
          min-height="500px"
        />
      </div>
      <div class="legend-area">
        <MtpLegend :color-stops="colorStops" unit="m³/s" />
      </div>
    </div>
  </div>
</template>

<style scoped>
h2 { margin-bottom: 8px; color: #082f57; }
p { margin-bottom: 16px; color: #555; }
.controls {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}
.controls button {
  padding: 8px 20px;
  background: #082f57;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
}
.controls button:hover { background: #0d4a8a; }
.mode-label { font-size: 14px; color: #666; }
.layout { display: flex; gap: 16px; }
.map-area { flex: 1; }
.legend-area { flex-shrink: 0; }
@media (max-width: 768px) {
  .layout { flex-direction: column; }
}
</style>
