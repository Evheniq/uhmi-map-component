import type { Map as MaptilerMap } from '@maptiler/sdk'

interface Handlers {
  move: () => void
  zoom: () => void
  rotate: () => void
}

/** Module-level registry: syncGroup → set of maps */
const groups = new globalThis.Map<string, Set<MaptilerMap>>()
const handlers = new WeakMap<MaptilerMap, Handlers>()
const syncing = new Set<string>()

function runWithoutLoop(group: string, cb: () => void) {
  if (syncing.has(group)) return
  syncing.add(group)
  cb()
  requestAnimationFrame(() => {
    syncing.delete(group)
  })
}

function attachListeners(map: MaptilerMap, group: string) {
  const maps = groups.get(group)!

  const move = () =>
    runWithoutLoop(group, () => {
      const center = map.getCenter()
      maps.forEach((m: MaptilerMap) => m !== map && m.setCenter(center))
    })

  const zoom = () =>
    runWithoutLoop(group, () => {
      const z = map.getZoom()
      maps.forEach((m: MaptilerMap) => m !== map && m.setZoom(z))
    })

  const rotate = () =>
    runWithoutLoop(group, () => {
      const brg = map.getBearing()
      maps.forEach((m: MaptilerMap) => m !== map && m.setBearing(brg))
    })

  map.on('moveend', move)
  map.on('zoomend', zoom)
  map.on('rotateend', rotate)

  handlers.set(map, { move, zoom, rotate })
}

function detachListeners(map: MaptilerMap) {
  const h = handlers.get(map)
  if (!h) return
  map.off('moveend', h.move)
  map.off('zoomend', h.zoom)
  map.off('rotateend', h.rotate)
  handlers.delete(map)
}

/**
 * Register a map instance in a sync group.
 * Maps in the same group will sync pan, zoom, and rotation.
 */
export function addMapToSyncGroup(map: MaptilerMap, group: string) {
  if (!groups.has(group)) {
    groups.set(group, new Set())
  }
  const set = groups.get(group)!
  if (set.has(map)) return

  // Sync initial viewport to existing map in the group
  if (set.size > 0) {
    const base = set.values().next().value!
    map.setCenter(base.getCenter())
    map.setZoom(base.getZoom())
    map.setBearing(base.getBearing())
  }

  set.add(map)
  attachListeners(map, group)
}

/**
 * Remove a map from its sync group.
 */
export function removeMapFromSyncGroup(map: MaptilerMap, group: string) {
  detachListeners(map)
  const set = groups.get(group)
  if (set) {
    set.delete(map)
    if (set.size === 0) {
      groups.delete(group)
    }
  }
}

/**
 * Returns the number of maps in a sync group.
 */
export function getSyncGroupSize(group: string): number {
  return groups.get(group)?.size ?? 0
}
