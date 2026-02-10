<script setup lang="ts">
import { computed } from 'vue'
import type { ColorStop } from '../types'

interface Props {
  colorStops: ColorStop[]
  unit?: string
  orientation?: 'vertical' | 'horizontal' | 'auto'
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  orientation: 'auto',
})

const sortedStops = computed(() =>
  [...props.colorStops].sort((a, b) => a.value - b.value)
)
</script>

<template>
  <div
    class="mtp-legend-wrapper"
    :class="{
      'mtp-legend--vertical': props.orientation === 'vertical',
      'mtp-legend--horizontal': props.orientation === 'horizontal',
    }"
  >
    <div v-if="props.unit" class="mtp-units-label mtp-hide-desktop">{{ props.unit }}</div>
    <div class="mtp-legend">
      <div
        class="mtp-legend-item"
        v-for="(stop, index) in sortedStops"
        :key="`${stop.value}-${stop.color}`"
      >
        <div class="mtp-square" :style="{ backgroundColor: stop.color }"></div>
        <div class="mtp-line"></div>
        <div class="mtp-value" :class="{ 'mtp-hide-mobile': index === 0 }">
          <template v-if="index === 0">{{ props.unit }}</template>
          <template v-else>
            <svg v-if="index === 1" class="mtp-arrow-icon" width="10" height="10" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.25036 2.81543L2.15113 2.98908L2.32478 3.08831L10.9202 7.99998L2.32412 12.9117L2.15038 13.0109L2.24973 13.1846L2.91173 14.342L3.01099 14.5155L3.18456 14.4163L14.1099 8.17364L14.4138 7.99999L14.1099 7.82634L3.18456 1.58367L3.01092 1.48445L2.91169 1.6581L2.25036 2.81543Z" fill="#6C7681" stroke="#6C7681" stroke-width="0.4"/>
            </svg>
            <svg v-if="index === sortedStops.length - 1" class="mtp-arrow-icon mtp-arrow-rotated" width="10" height="10" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.25036 2.81543L2.15113 2.98908L2.32478 3.08831L10.9202 7.99998L2.32412 12.9117L2.15038 13.0109L2.24973 13.1846L2.91173 14.342L3.01099 14.5155L3.18456 14.4163L14.1099 8.17364L14.4138 7.99999L14.1099 7.82634L3.18456 1.58367L3.01092 1.48445L2.91169 1.6581L2.25036 2.81543Z" fill="#6C7681" stroke="#6C7681" stroke-width="0.4"/>
            </svg>
            {{ sortedStops[index - 1].value }}
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mtp-legend-wrapper {
  display: flex;
  flex-direction: column;
}

/* Auto orientation: vertical on desktop, horizontal on mobile */
@media (max-width: 1200px) {
  .mtp-legend-wrapper:not(.mtp-legend--vertical) {
    flex-direction: row;
    align-items: flex-end;
  }
}

/* Force horizontal */
.mtp-legend--horizontal {
  flex-direction: row !important;
  align-items: flex-end !important;
}

.mtp-units-label {
  display: none;
  color: #6c7681;
  font-size: 16px;
  line-height: 7px;
  font-weight: 700;
  margin-right: 8px;
  margin-bottom: 8px;
}

@media (max-width: 1200px) {
  .mtp-legend-wrapper:not(.mtp-legend--vertical) .mtp-units-label {
    display: block;
  }
}

.mtp-legend--horizontal .mtp-units-label {
  display: block !important;
}

.mtp-hide-desktop {
  /* visible only on mobile by default */
}

.mtp-legend {
  position: relative;
  margin-top: 24px;
  margin-left: 32px;
  min-width: 102px;
}

/* Horizontal layout (mobile or forced) */
@media (max-width: 1200px) {
  .mtp-legend-wrapper:not(.mtp-legend--vertical) .mtp-legend {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    margin-left: 0;
    margin-top: 0;
    padding: 0 16px 0 0;
    min-width: auto;
    width: 100%;
  }
}

.mtp-legend--horizontal .mtp-legend {
  display: flex !important;
  flex-direction: row !important;
  overflow-x: auto;
  margin-left: 0 !important;
  margin-top: 0 !important;
  padding: 0 16px 0 0;
  min-width: auto !important;
  width: 100%;
}

.mtp-legend-item {
  display: flex;
}

@media (max-width: 1200px) {
  .mtp-legend-wrapper:not(.mtp-legend--vertical) .mtp-legend-item {
    flex-direction: column;
    align-items: center;
  }
}

.mtp-legend--horizontal .mtp-legend-item {
  flex-direction: column !important;
  align-items: center !important;
}

.mtp-square {
  width: 24px;
  height: 40px;
}

@media (max-width: 1200px) {
  .mtp-legend-wrapper:not(.mtp-legend--vertical) .mtp-square {
    width: 40px;
    height: 24px;
  }
}

.mtp-legend--horizontal .mtp-square {
  width: 40px !important;
  height: 24px !important;
}

.mtp-value {
  color: #6c7681;
  margin-left: 8px;
  margin-top: -10px;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 2px;
}

@media (max-width: 1200px) {
  .mtp-legend-wrapper:not(.mtp-legend--vertical) .mtp-value {
    margin-left: 0;
    margin-top: 8px;
    text-align: left;
    font-size: 12px;
    white-space: nowrap;
  }
  .mtp-legend-wrapper:not(.mtp-legend--vertical) .mtp-legend-item:not(:first-child) .mtp-value {
    margin-left: -40px;
  }
}

.mtp-legend--horizontal .mtp-value {
  margin-left: 0 !important;
  margin-top: 8px !important;
  text-align: left;
  font-size: 12px !important;
  white-space: nowrap;
}

.mtp-legend--horizontal .mtp-legend-item:not(:first-child) .mtp-value {
  margin-left: -40px !important;
}

.mtp-line {
  border-right: 2px solid #6c7681;
  border-bottom: 2px solid #6c7681;
  width: 10px;
  margin-left: 16px;
}

@media (max-width: 1200px) {
  .mtp-legend-wrapper:not(.mtp-legend--vertical) .mtp-line {
    border-right: none;
    border-bottom: 2px solid #6c7681;
    border-left: 2px solid #6c7681;
    width: 40px;
    height: 10px;
    margin-left: 0;
    margin-top: 8px;
  }
  .mtp-legend-wrapper:not(.mtp-legend--vertical) .mtp-legend-item:first-child .mtp-line {
    border-left: none;
  }
}

.mtp-legend--horizontal .mtp-line {
  border-right: none !important;
  border-bottom: 2px solid #6c7681 !important;
  border-left: 2px solid #6c7681 !important;
  width: 40px !important;
  height: 10px !important;
  margin-left: 0 !important;
  margin-top: 8px !important;
}

.mtp-legend--horizontal .mtp-legend-item:first-child .mtp-line {
  border-left: none !important;
}

.mtp-legend-item:last-child .mtp-line {
  border-bottom: none;
}

@media (max-width: 1200px) {
  .mtp-legend-wrapper:not(.mtp-legend--vertical) .mtp-legend-item:last-child .mtp-line {
    border-bottom: 2px solid #6c7681;
    border-right: none;
  }
}

.mtp-legend--horizontal .mtp-legend-item:last-child .mtp-line {
  border-bottom: 2px solid #6c7681 !important;
  border-right: none !important;
}

.mtp-hide-mobile {
  /* Hidden on mobile */
}

@media (max-width: 1200px) {
  .mtp-legend-wrapper:not(.mtp-legend--vertical) .mtp-hide-mobile {
    display: none;
  }
}

.mtp-legend--horizontal .mtp-hide-mobile {
  display: none !important;
}

.mtp-arrow-icon {
  flex-shrink: 0;
}

.mtp-arrow-rotated {
  transform: rotate(180deg);
}
</style>
