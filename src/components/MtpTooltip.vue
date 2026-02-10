<script setup lang="ts">
import type { HoverFeatureInfo } from '../types'

interface Props {
  info: HoverFeatureInfo | null
}

defineProps<Props>()
</script>

<template>
  <div v-if="info" class="mtp-standalone-tooltip">
    <div class="mtp-standalone-tooltip-inner">
      <div class="mtp-tooltip-title">{{ info.name }}</div>
      <div v-if="info.value !== null" class="mtp-tooltip-value">
        Value: <strong>{{ info.value }}</strong>
      </div>
      <div v-else class="mtp-tooltip-nodata">No data</div>
      <slot :info="info" />
    </div>
  </div>
</template>

<style scoped>
.mtp-standalone-tooltip {
  position: relative;
  pointer-events: none;
}

.mtp-standalone-tooltip-inner {
  background: rgba(255, 255, 255, 1);
  border-radius: 5px;
  padding: 11px 17px;
  box-sizing: border-box;
  font-family: Manrope, sans-serif;
  font-size: 16px;
  line-height: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.mtp-tooltip-title {
  font-weight: 700;
  color: #082f57;
  margin-bottom: 4px;
}

.mtp-tooltip-value {
  color: #333;
}

.mtp-tooltip-nodata {
  color: #999;
  font-style: italic;
}

@media (max-width: 767px) {
  .mtp-standalone-tooltip-inner {
    padding: 8px 10px;
    font-size: 14px;
    line-height: 20px;
  }
}
</style>
