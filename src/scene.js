import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  Color,
  ConeGeometry,
  DirectionalLight,
  DodecahedronGeometry,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Raycaster,
  Scene,
  TorusGeometry,
  Vector2,
  WebGLRenderer,
} from 'three'
import { angleForIndex, shortestAngleDelta } from './projects.js'

const RING_RADIUS = 3.2
const DRAG_THRESHOLD = 6 // pixels of movement before a press counts as a drag

function geometryFor(shape) {
  switch (shape) {
    case 'box':
      return new BoxGeometry(1.1, 1.1, 1.1)
    case 'octahedron':
      return new OctahedronGeometry(0.85)
    case 'torus':
      return new TorusGeometry(0.6, 0.26, 12, 28)
    case 'cone':
      return new ConeGeometry(0.7, 1.3, 6)
    case 'dodecahedron':
      return new DodecahedronGeometry(0.8)
    default:
      return new IcosahedronGeometry(0.85)
  }
}

function makeStars(count) {
  const positions = []
  for (let i = 0; i < count; i++) {
    // Random points on a thick shell around the ring.
    const radius = 14 + Math.random() * 16
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta),
    )
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  const material = new PointsMaterial({ color: 0x94a3b8, size: 0.07, sizeAttenuation: true })
  return new Points(geometry, material)
}

// Builds the scene on the given canvas. Throws if WebGL is not available,
// so the caller can show the plain page instead.
export function createScene({ canvas, projects, onSelect, reducedMotion = false }) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

  const scene = new Scene()
  const camera = new PerspectiveCamera(42, 1, 0.1, 100)

  scene.add(new AmbientLight(0xffffff, 0.75))
  const key = new DirectionalLight(0xffffff, 2.2)
  key.position.set(4, 6, 8)
  scene.add(key)
  const fill = new DirectionalLight(0x7dd3fc, 0.8)
  fill.position.set(-6, -2, 3)
  scene.add(fill)

  const stars = makeStars(500)
  scene.add(stars)

  const ring = new Group()
  ring.rotation.x = 0.12
  scene.add(ring)

  const count = projects.length
  const meshes = projects.map((project, index) => {
    const material = new MeshStandardMaterial({
      color: new Color(project.color),
      flatShading: true,
      roughness: 0.45,
      metalness: 0.15,
      emissive: new Color(project.color),
      emissiveIntensity: 0,
    })
    const mesh = new Mesh(geometryFor(project.shape), material)
    const angle = angleForIndex(index, count)
    mesh.position.set(Math.sin(angle) * RING_RADIUS, 0, Math.cos(angle) * RING_RADIUS)
    mesh.rotation.set(index * 0.7, index * 1.3, 0)
    mesh.userData.index = index
    mesh.userData.scale = 1
    ring.add(mesh)
    return mesh
  })

  let spinning = !reducedMotion
  let selected = -1
  let hovered = -1
  let targetRotation = null // set while easing towards a selected item
  let pointerTilt = { x: 0, y: 0 }
  let drag = null
  let frame = 0
  let lastTime = performance.now()
  let disposed = false

  const raycaster = new Raycaster()
  const pointer = new Vector2()

  function resize() {
    const width = canvas.clientWidth || 1
    const height = canvas.clientHeight || 1
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    // Pull the camera back on narrow screens so the whole ring stays in view.
    camera.position.set(0, 1.5, 8.2 * Math.max(1, 1.25 / camera.aspect))
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }

  function pick(event) {
    const rect = canvas.getBoundingClientRect()
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.intersectObjects(meshes, false)[0]
    return hit ? hit.object.userData.index : -1
  }

  function select(index, { notify = false } = {}) {
    selected = index
    if (index >= 0) {
      const goal = -angleForIndex(index, count)
      const delta = shortestAngleDelta(ring.rotation.y, goal)
      if (reducedMotion) {
        ring.rotation.y += delta
        targetRotation = null
      } else {
        targetRotation = ring.rotation.y + delta
      }
    } else {
      targetRotation = null
    }
    if (notify && onSelect) onSelect(index)
  }

  function onPointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    drag = { id: event.pointerId, startX: event.clientX, lastX: event.clientX, moved: false }
  }

  function onPointerMove(event) {
    const rect = canvas.getBoundingClientRect()
    if (event.pointerType === 'mouse') {
      pointerTilt = {
        x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((event.clientY - rect.top) / rect.height - 0.5) * 2,
      }
    }
    if (drag && drag.id === event.pointerId) {
      if (!drag.moved && Math.abs(event.clientX - drag.startX) > DRAG_THRESHOLD) {
        drag.moved = true
        targetRotation = null
        canvas.setPointerCapture?.(event.pointerId)
        canvas.classList.add('is-dragging')
      }
      if (drag.moved) {
        ring.rotation.y += ((event.clientX - drag.lastX) / rect.width) * Math.PI * 1.5
      }
      drag.lastX = event.clientX
      return
    }
    if (event.pointerType === 'mouse') {
      hovered = pick(event)
      canvas.classList.toggle('is-pointing', hovered >= 0)
    }
  }

  function onPointerUp(event) {
    if (!drag || drag.id !== event.pointerId) return
    const wasDrag = drag.moved
    drag = null
    canvas.classList.remove('is-dragging')
    if (wasDrag) return
    const index = pick(event)
    if (index >= 0) select(index, { notify: true })
  }

  function onPointerLeave() {
    hovered = -1
    pointerTilt = { x: 0, y: 0 }
    canvas.classList.remove('is-pointing')
  }

  function onPointerCancel() {
    drag = null
    canvas.classList.remove('is-dragging')
  }

  function render(now) {
    if (disposed) return
    frame = requestAnimationFrame(render)
    const dt = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now

    if (targetRotation !== null) {
      const remaining = targetRotation - ring.rotation.y
      if (Math.abs(remaining) < 0.001) {
        ring.rotation.y = targetRotation
        targetRotation = null
      } else {
        ring.rotation.y += remaining * Math.min(1, dt * 6)
      }
    } else if (spinning && !drag && selected < 0) {
      ring.rotation.y += dt * 0.25
    }

    if (!reducedMotion) {
      // Small tilt that follows the mouse.
      ring.rotation.x += (0.12 + pointerTilt.y * 0.08 - ring.rotation.x) * Math.min(1, dt * 4)
      ring.position.x += (pointerTilt.x * 0.25 - ring.position.x) * Math.min(1, dt * 4)
      if (spinning) stars.rotation.y += dt * 0.01
    }

    for (const mesh of meshes) {
      const index = mesh.userData.index
      const isSelected = index === selected
      const goalScale = isSelected ? 1.4 : index === hovered ? 1.18 : 1
      const ease = reducedMotion ? 1 : Math.min(1, dt * 8)
      mesh.userData.scale += (goalScale - mesh.userData.scale) * ease
      mesh.scale.setScalar(mesh.userData.scale)
      mesh.material.emissiveIntensity += ((isSelected ? 0.35 : 0) - mesh.material.emissiveIntensity) * ease
      if (spinning) {
        mesh.rotation.x += dt * 0.3
        mesh.rotation.y += dt * 0.45
      }
    }

    renderer.render(scene, camera)
  }

  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointerleave', onPointerLeave)
  canvas.addEventListener('pointercancel', onPointerCancel)

  resize()
  frame = requestAnimationFrame(render)

  return {
    select: (index) => select(index),
    setSpinning(value) {
      spinning = value
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      canvas.removeEventListener('pointercancel', onPointerCancel)
      for (const mesh of meshes) {
        mesh.geometry.dispose()
        mesh.material.dispose()
      }
      stars.geometry.dispose()
      stars.material.dispose()
      renderer.dispose()
    },
  }
}
