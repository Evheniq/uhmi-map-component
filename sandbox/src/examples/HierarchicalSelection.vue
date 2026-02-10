<script setup lang="ts">
import { ref, computed } from 'vue'
import { MtpMap, MtpLegend, type ColorStop, type MapSelection, type HoverFeatureInfo } from 'vue-maptiler-polygons'
import parentBasins from '../data/parentBasins.json'
import childBasins from '../data/childBasins.json'
import sampleStops from '../data/sampleStops.json'

const MAP_STYLE = import.meta.env.VITE_MAP_STYLE

const sources = {
  parents: parentBasins as any,
  children: childBasins as any,
}
const colorStops: ColorStop[] = sampleStops

const selectedParent = ref<string | null>(null)
const selectedChild = ref<string | null>(null)

const selection = computed<MapSelection>(() => ({
  parentCode: selectedParent.value,
  childCode: selectedChild.value,
}))

const parents = (parentBasins as any).features.map((f: any) => f.properties)
const children = (childBasins as any).features.map((f: any) => f.properties)

const filteredChildren = computed(() =>
  selectedParent.value
    ? children.filter((c: any) => c.parentCode === selectedParent.value)
    : []
)

function selectParent(code: string | null) {
  selectedParent.value = code
  selectedChild.value = null
}

function handleClick(info: HoverFeatureInfo) {
  if (info.parentCode) {
    selectedParent.value = info.parentCode
    selectedChild.value = info.code
  }
}
</script>

<template>
  <div>
    <h2>Hierarchical Selection</h2>
    <p>Select a parent basin, then a child. The map highlights the selection with outlines.</p>

    <div class="controls">
      <div class="control-group">
        <label>Parent Basin:</label>
        <select @change="selectParent(($event.target as HTMLSelectElement).value || null)">
          <option value="">All</option>
          <option v-for="p in parents" :key="p.code" :value="p.code">{{ p.name }}</option>
        </select>
      </div>
      <div class="control-group" v-if="filteredChildren.length">
        <label>Child Basin:</label>
        <select v-model="selectedChild">
          <option :value="null">All children</option>
          <option v-for="c in filteredChildren" :key="c.code" :value="c.code">{{ c.name }}</option>
        </select>
      </div>
      <div class="current-selection">
        Selection: <code>{{ JSON.stringify(selection) }}</code>
      </div>
    </div>

    <div class="layout">
      <div class="map-area">
        <MtpMap
          :sources="sources"
          :color-stops="colorStops"
          :map-style="MAP_STYLE"
          :center="[31, 49]"
          :zoom="5"
          :selection="selection"
          min-height="500px"
          @click="handleClick"
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
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}
.control-group { display: flex; align-items: center; gap: 8px; }
.control-group label { font-weight: 600; font-size: 14px; }
.control-group select {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
}
.current-selection { font-size: 13px; color: #666; }
.layout { display: flex; gap: 16px; }
.map-area { flex: 1; }
.legend-area { flex-shrink: 0; }
@media (max-width: 768px) {
  .layout { flex-direction: column; }
}
</style>
