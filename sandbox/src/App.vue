<script setup lang="ts">
import { ref, shallowRef, markRaw, type Component } from 'vue'
import BasicPolygons from './examples/BasicPolygons.vue'
import HierarchicalSelection from './examples/HierarchicalSelection.vue'
import PointsMode from './examples/PointsMode.vue'
import CompareMode from './examples/CompareMode.vue'
const examples = [
  { label: 'Basic Polygons', component: markRaw(BasicPolygons) },
  { label: 'Hierarchical Selection', component: markRaw(HierarchicalSelection) },
  { label: 'Points Mode', component: markRaw(PointsMode) },
  { label: 'Compare Mode', component: markRaw(CompareMode) },
]

const activeIdx = ref(0)
</script>

<template>
  <div class="sandbox">
    <header class="sandbox-header">
      <h1>vue-maptiler-polygons</h1>
      <nav class="tabs">
        <button
          v-for="(ex, i) in examples"
          :key="i"
          :class="{ active: activeIdx === i }"
          @click="activeIdx = i"
        >
          {{ ex.label }}
        </button>
      </nav>
    </header>

    <main class="sandbox-main">
      <component :is="examples[activeIdx].component" />
    </main>
  </div>
</template>

<style>
.sandbox {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px;
}

.sandbox-header {
  margin-bottom: 24px;
}

.sandbox-header h1 {
  font-size: 24px;
  margin-bottom: 12px;
  color: #082f57;
}

.tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tabs button {
  padding: 8px 16px;
  border: 1px solid #6c7681;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  color: #333;
  transition: all 0.2s;
}

.tabs button:hover {
  background: #e8f0fe;
}

.tabs button.active {
  background: #082f57;
  color: #fff;
  border-color: #082f57;
}

.sandbox-main {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}
</style>
