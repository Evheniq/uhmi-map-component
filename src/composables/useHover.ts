import { ref, nextTick, type Ref } from 'vue'
import * as maptilersdk from '@maptiler/sdk'
import type { HoverFeatureInfo } from '../types'

export interface UseHoverOptions {
  map: maptilersdk.Map
  mapContainer: Ref<HTMLDivElement | null>
  childLayerId: string
  pointLayerId: string
  childSourceId: string
  pointSourceId: string
  maskLayerIds?: string[]
  tooltipEnabled: Ref<boolean>
  tooltipContent?: (info: HoverFeatureInfo) => string
  onHover?: (info: HoverFeatureInfo | null) => void
  onClick?: (info: HoverFeatureInfo) => void
}

export function useHover(options: UseHoverOptions) {
  const {
    map,
    mapContainer,
    childLayerId,
    pointLayerId,
    childSourceId,
    pointSourceId,
    maskLayerIds = [],
    tooltipEnabled,
    tooltipContent,
    onHover,
    onClick,
  } = options

  const hoveredFeatureId = ref<number | null>(null)
  const currentHoverInfo = ref<HoverFeatureInfo | null>(null)

  const popup = new maptilersdk.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: [-235, 10],
    maxWidth: 'none',
  })

  function adjustPopupPosition(pointX: number) {
    const screenWidth = window.innerWidth

    requestAnimationFrame(() => {
      const containerEl = mapContainer.value
      if (!containerEl) return

      const popupEl = containerEl.querySelector('.maplibregl-popup') as HTMLElement
      if (!popupEl) return

      const contentEl = popupEl.querySelector('.mtp-tooltip-inner') as HTMLElement
      if (!contentEl) {
        setTimeout(() => adjustPopupPosition(pointX), 100)
        return
      }

      const rect = contentEl.getBoundingClientRect()
      const padding = 10
      let translateX = 0

      if (rect.left < padding) {
        translateX = padding - rect.left
      } else if (rect.right > screenWidth - padding) {
        translateX = screenWidth - padding - rect.right
      }

      contentEl.style.transform = translateX !== 0 ? `translateX(${translateX}px)` : ''
    })
  }

  function buildFeatureInfo(feat: any, lngLat: { lng: number; lat: number }): HoverFeatureInfo {
    const props = feat.properties || {}
    return {
      code: String(props.code ?? ''),
      name: String(props.name ?? ''),
      value: props.value === 'null' || props.value === 'undefined' ? null : Number(props.value),
      parentCode: props.parentCode ? String(props.parentCode) : undefined,
      properties: { ...props },
      lngLat,
    }
  }

  function handleMove(layerId: string, sourceId: string) {
    return (e: any) => {
      map.getCanvas().style.cursor = 'pointer'
      if (!e.features?.[0] || e.features[0].properties.value === 'undefined') return

      const feat = e.features[0]
      const id = feat.id != null ? +feat.id : null
      const mouse = map.unproject([e.point.x, e.point.y])

      const info = buildFeatureInfo(feat, { lng: mouse.lng, lat: mouse.lat })
      currentHoverInfo.value = info
      onHover?.(info)

      if (!tooltipEnabled.value) return

      // Mobile offset
      const isMobile = window.innerWidth < 768
      popup.setOffset(isMobile ? [0, 15] : [-235, 10])

      // Render tooltip HTML
      let html: string
      if (tooltipContent) {
        html = `<div class="mtp-tooltip"><div class="mtp-tooltip-inner">${tooltipContent(info)}</div></div>`
      } else {
        const valueStr = info.value !== null ? String(info.value) : 'N/A'
        html = `<div class="mtp-tooltip"><div class="mtp-tooltip-inner"><strong>${info.name}</strong><br/>Value: ${valueStr}</div></div>`
      }

      popup.setLngLat(mouse).setHTML(html).addTo(map)
      setTimeout(() => adjustPopupPosition(e.point.x), 150)

      // Reset previous hover state
      if (hoveredFeatureId.value !== null) {
        map.setFeatureState({ source: sourceId, id: hoveredFeatureId.value }, { hover: false })
      }
      hoveredFeatureId.value = id

      // Set new hover state
      if (id !== null) {
        map.setFeatureState({ source: sourceId, id }, { hover: true })
      }
    }
  }

  function handleClick(layerId: string) {
    return (e: any) => {
      if (!e.features?.[0]) return
      const feat = e.features[0]
      const mouse = map.unproject([e.point.x, e.point.y])
      const info = buildFeatureInfo(feat, { lng: mouse.lng, lat: mouse.lat })
      onClick?.(info)
    }
  }

  function resetHover() {
    if (hoveredFeatureId.value !== null) {
      try {
        map.setFeatureState({ source: childSourceId, id: hoveredFeatureId.value }, { hover: false })
      } catch {
        // source may not exist
      }
    }
    hoveredFeatureId.value = null
    currentHoverInfo.value = null
    onHover?.(null)
  }

  // Attach handlers
  map.on('mousemove', childLayerId, handleMove(childLayerId, childSourceId))
  map.on('mousemove', pointLayerId, handleMove(pointLayerId, pointSourceId))
  map.on('click', childLayerId, handleClick(childLayerId))
  map.on('click', pointLayerId, handleClick(pointLayerId))

  // Mask layers dismiss tooltip
  for (const maskId of maskLayerIds) {
    map.on('mousemove', maskId, () => {
      map.getCanvas().style.cursor = ''
      popup.remove()
      resetHover()
    })
  }

  // Close tooltip when mouse leaves the map
  function handleMouseLeave() {
    popup.remove()
    resetHover()
  }
  map.on('mouseleave', childLayerId, handleMouseLeave)
  map.on('mouseleave', pointLayerId, handleMouseLeave)

  function destroy() {
    popup.remove()
    resetHover()
  }

  return {
    hoveredFeatureId,
    currentHoverInfo,
    destroy,
  }
}
