<script setup lang="ts">
import { MtpMap, MtpLegend, type ColorStop } from 'vue-maptiler-polygons'
import parentBasins from '../data/parentBasins.json'
import childBasins from '../data/childBasins.json'
import sampleStops from '../data/sampleStops.json'

const MAP_STYLE = import.meta.env.VITE_MAP_STYLE

const colorStops: ColorStop[] = sampleStops

// Create two variations of child data with different values
const childData1 = JSON.parse(JSON.stringify(childBasins))
const childData2 = JSON.parse(JSON.stringify(childBasins))

// Second dataset has shifted values (simulating a different scenario)
for (const f of childData2.features) {
  if (f.properties.value !== 'null' && f.properties.value !== 'undefined') {
    f.properties.value = Math.max(0, f.properties.value * 1.3 + 2)
  }
}

const sources1 = { parents: parentBasins as any, children: childData1 as any }
const sources2 = { parents: parentBasins as any, children: childData2 as any }
</script>

<template>
  <div>
    <h2>Compare Mode</h2>
    <p>Two maps synced together — panning or zooming one moves the other. The right map shows modified values.</p>

    <div class="compare-grid">
      <div class="compare-cell">
        <div class="compare-label">Scenario A (original)</div>
        <MtpMap
          :sources="sources1"
          :color-stops="colorStops"
          :map-style="MAP_STYLE"
          :center="[31, 49]"
          :zoom="5"
          sync-group="compare-demo"
          min-height="400px"
        />
      </div>
      <div class="compare-cell">
        <div class="compare-label">Scenario B (modified)</div>
        <MtpMap
          :sources="sources2"
          :color-stops="colorStops"
          :map-style="MAP_STYLE"
          :center="[31, 49]"
          :zoom="5"
          sync-group="compare-demo"
          min-height="400px"
        />
      </div>
    </div>
    <MtpLegend :color-stops="colorStops" unit="m³/s" orientation="horizontal" />
  </div>
</template>

<style scoped>
h2 { margin-bottom: 8px; color: #082f57; }
p { margin-bottom: 16px; color: #555; }
.compare-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
.compare-cell { position: relative; }
.compare-label {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  background: rgba(255,255,255,0.9);
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #082f57;
}
@media (max-width: 768px) {
  .compare-grid { grid-template-columns: 1fr; }
}
</style>
