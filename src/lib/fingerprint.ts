export function getCanvasFingerprint(): string {
  try {
    const c = document.createElement('canvas')
    const ctx = c.getContext('2d')
    if (!ctx) return 'no-canvas'
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('DynamonGamer🎮', 2, 15)
    ctx.fillStyle = 'rgba(102,204,0,0.7)'
    ctx.fillText('DynamonGamer🎮', 4, 17)
    return c.toDataURL().slice(-50)
  } catch { return 'canvas-blocked' }
}

export function getFingerprint(): string {
  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.pixelDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency ?? 0,
    (navigator as any).deviceMemory ?? 0,
    navigator.platform,
    window.screen.width + 'x' + window.screen.height,
    getCanvasFingerprint(),
  ].join('|')
  return btoa(encodeURIComponent(raw)).slice(0, 64)
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15) >> (c === 'x' ? 0 : 1)
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}