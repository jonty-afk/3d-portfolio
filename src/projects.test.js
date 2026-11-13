import test from 'node:test'
import assert from 'node:assert/strict'
import { projects, angleForIndex, shortestAngleDelta, stepIndex } from './projects.js'

const SHAPES = ['box', 'octahedron', 'torus', 'icosahedron', 'cone', 'dodecahedron']
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} is not close to ${b}`)

test('every project has the fields the page needs', () => {
  for (const p of projects) {
    assert.ok(p.id && p.name && p.summary, `missing text on ${p.id}`)
    assert.ok(Array.isArray(p.tech) && p.tech.length > 0, `no tech list on ${p.id}`)
    assert.match(p.url, /^https:\/\/github\.com\/jonty-afk\/[\w.-]+$/)
    assert.match(p.color, /^#[0-9a-f]{6}$/)
    assert.ok(SHAPES.includes(p.shape), `unknown shape on ${p.id}`)
  }
})

test('project ids and urls are unique', () => {
  assert.equal(new Set(projects.map((p) => p.id)).size, projects.length)
  assert.equal(new Set(projects.map((p) => p.url)).size, projects.length)
})

test('angleForIndex spreads items evenly', () => {
  close(angleForIndex(0, 4), 0)
  close(angleForIndex(1, 4), Math.PI / 2)
  close(angleForIndex(3, 6), Math.PI)
  assert.throws(() => angleForIndex(0, 0), RangeError)
})

test('shortestAngleDelta takes the short way round', () => {
  close(shortestAngleDelta(0, Math.PI / 2), Math.PI / 2)
  close(shortestAngleDelta(0, (3 * Math.PI) / 2), -Math.PI / 2)
  close(shortestAngleDelta(6 * Math.PI + 0.1, 0.3), 0.2)
  close(shortestAngleDelta(-0.1, 0.1 - 2 * Math.PI), 0.2)
})

test('stepIndex wraps and handles nothing selected', () => {
  assert.equal(stepIndex(0, 1, 6), 1)
  assert.equal(stepIndex(5, 1, 6), 0)
  assert.equal(stepIndex(0, -1, 6), 5)
  assert.equal(stepIndex(-1, 1, 6), 0)
  assert.equal(stepIndex(-1, -1, 6), 5)
  assert.equal(stepIndex(0, 1, 0), -1)
})
