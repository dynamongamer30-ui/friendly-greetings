import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Triangle } from 'ogl'

/**
 * Premium fragment-shader aurora background.
 * Domain-warped fbm noise → cyan→violet ribbons + soft cursor-following orb.
 * Pauses when tab hidden; static gradient fallback for prefers-reduced-motion.
 */
const VERT = /* glsl */ `
  attribute vec2 position;
  void main() { gl_Position = vec4(position, 0.0, 1.0); }
`

const FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2  uRes;
  uniform vec2  uMouse;

  // hash + value noise
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) + (c - a)*u.y*(1.0 - u.x) + (d - b) * u.x * u.y;
  }
  float fbm(vec2 p){
    float v = 0.0; float a = 0.5;
    for(int i=0;i<5;i++){ v += a * noise(p); p *= 2.02; a *= 0.5; }
    return v;
  }

  void main(){
    vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / min(uRes.x, uRes.y);
    float t = uTime * 0.06;

    // domain warping
    vec2 q = vec2(fbm(uv + t), fbm(uv - t + 3.7));
    vec2 r = vec2(fbm(uv + q + vec2(1.7, 9.2) + 0.15*t),
                  fbm(uv + q + vec2(8.3, 2.8) + 0.13*t));
    float f = fbm(uv + r);

    // mouse-following soft orb
    vec2 m = (uMouse - 0.5*uRes) / min(uRes.x, uRes.y);
    float orb = smoothstep(0.55, 0.0, length(uv - m*0.6));

    // colors
    vec3 ember  = vec3(1.000, 0.271, 0.000);
    vec3 amber  = vec3(0.961, 0.620, 0.043);
    vec3 deep   = vec3(0.027, 0.012, 0.039);

    vec3 col = mix(deep, amber, smoothstep(0.2, 0.8, f));
    col = mix(col, ember, smoothstep(0.55, 1.0, f) * 0.85);
    col += orb * 0.18 * mix(ember, amber, 0.5);

    // vignette
    float v = smoothstep(1.2, 0.2, length(uv));
    col *= 0.4 + 0.6 * v;

    // subtle film grain
    col += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.012;

    gl_FragColor = vec4(col, 1.0);
  }
`

export default function AuroraOrb() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = ref.current
    if (!host) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      host.style.background =
        'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255, 69, 0,0.18), transparent 60%), radial-gradient(ellipse 60% 50% at 60% 70%, rgba(245, 158, 11,0.18), transparent 65%), #0A0A1A'
      return
    }

    let renderer: Renderer
    const isMobile = window.innerWidth < 768
    const dprCap = isMobile ? 1.0 : 1.5
    try {
      renderer = new Renderer({ alpha: false, dpr: Math.min(window.devicePixelRatio, dprCap) })
    } catch {
      host.style.background = 'linear-gradient(135deg, #0A0A1A, #141432)'
      return
    }
    const gl = renderer.gl
    gl.canvas.style.width = '100%'
    gl.canvas.style.height = '100%'
    gl.canvas.style.display = 'block'
    host.appendChild(gl.canvas)

    const geometry = new Triangle(gl)
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: [host.clientWidth, host.clientHeight] },
        uMouse: { value: [host.clientWidth / 2, host.clientHeight / 2] },
      },
    })
    const mesh = new Mesh(gl, { geometry, program })

    const resize = () => {
      const w = host.clientWidth
      const h = host.clientHeight
      renderer.setSize(w, h)
      program.uniforms.uRes.value = [w * renderer.dpr, h * renderer.dpr]
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      mouse.tx = (e.clientX - rect.left) * renderer.dpr
      mouse.ty = (rect.height - (e.clientY - rect.top)) * renderer.dpr
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    let raf = 0
    let last = performance.now()
    const targetFps = isMobile ? 24 : 30
    const frameMs = 1000 / targetFps
    let acc = 0
    const start = performance.now()
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (document.hidden) return
      const dt = now - last
      last = now
      acc += dt
      if (acc < frameMs) return
      acc = 0
      mouse.x += (mouse.tx - mouse.x) * 0.04
      mouse.y += (mouse.ty - mouse.y) * 0.04
      program.uniforms.uTime.value = (now - start) / 1000
      program.uniforms.uMouse.value = [mouse.x, mouse.y]
      renderer.render({ scene: mesh })
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      gl.canvas.remove()
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: '#0A0A1A',
      }}
    />
  )
}
