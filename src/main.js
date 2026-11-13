import './style.css'
import { projects, stepIndex } from './projects.js'

const canvas = document.getElementById('scene')
const stage = document.getElementById('stage')
const list = document.getElementById('project-list')
const panel = document.getElementById('detail')
const motionButton = document.getElementById('motion-toggle')
const prevButton = document.getElementById('prev')
const nextButton = document.getElementById('next')
const fallbackNote = document.getElementById('fallback-note')

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

let selected = -1
let spinning = !reducedMotion
let scene = null

function el(tag, className, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

// One button per project. These work with or without the 3D scene.
const buttons = projects.map((project, index) => {
  const item = el('li')
  const button = el('button', 'project-button')
  button.type = 'button'
  button.setAttribute('aria-pressed', 'false')
  const dot = el('span', 'dot')
  dot.style.background = project.color
  dot.setAttribute('aria-hidden', 'true')
  button.append(dot, el('span', 'project-name', project.name))
  button.addEventListener('click', () => choose(index))
  item.append(button)
  list.append(item)
  return button
})

function renderPanel() {
  panel.replaceChildren()
  if (selected < 0) {
    panel.append(
      el('h2', '', 'Pick a project'),
      el(
        'p',
        '',
        'Click or tap a shape, drag to turn the ring, or use the list. Each shape is one project.',
      ),
    )
    return
  }
  const project = projects[selected]
  const heading = el('h2', '', project.name)
  const tags = el('ul', 'tags')
  tags.setAttribute('aria-label', 'Built with')
  for (const name of project.tech) tags.append(el('li', '', name))
  const link = el('a', 'repo-link', 'View the code on GitHub')
  link.href = project.url
  link.rel = 'noopener'
  panel.append(heading, el('p', '', project.summary), tags, link)
}

function choose(index) {
  selected = index
  buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)))
  renderPanel()
  scene?.select(index)
}

function updateMotionButton() {
  motionButton.textContent = spinning ? 'Pause motion' : 'Play motion'
  motionButton.setAttribute('aria-pressed', String(!spinning))
}

motionButton.addEventListener('click', () => {
  spinning = !spinning
  scene?.setSpinning(spinning)
  updateMotionButton()
})

prevButton.addEventListener('click', () => choose(stepIndex(selected, -1, projects.length)))
nextButton.addEventListener('click', () => choose(stepIndex(selected, 1, projects.length)))

renderPanel()
updateMotionButton()

// Three.js is loaded separately so the list and text show up first,
// and still work if WebGL is missing.
import('./scene.js')
  .then(({ createScene }) => {
    scene = createScene({
      canvas,
      projects,
      reducedMotion,
      onSelect: (index) => choose(index),
    })
    if (selected >= 0) scene.select(selected)
    stage.classList.add('has-scene')
  })
  .catch((error) => {
    console.warn('3D scene not available:', error)
    stage.classList.add('no-scene')
    motionButton.hidden = true
    fallbackNote.hidden = false
  })
