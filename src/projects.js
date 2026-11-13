// Project data and the small bits of maths the scene uses.
// Kept free of Three.js so it can be tested with plain Node.

export const projects = [
  {
    id: 'helpdesk-ticket-tracker',
    name: 'Helpdesk Ticket Tracker',
    summary:
      'Log, assign, filter and close helpdesk tickets. Priorities and status filters, saved in the browser.',
    tech: ['React', 'Vite', 'Tailwind CSS'],
    url: 'https://github.com/jonty-afk/helpdesk-ticket-tracker',
    shape: 'box',
    color: '#5eead4',
  },
  {
    id: 'troubleshooting-guide',
    name: 'Troubleshooting Guide',
    summary:
      'Step-by-step flows for common support problems: Wi-Fi down, printer offline, forgotten password, slow Mac.',
    tech: ['JavaScript', 'Vite'],
    url: 'https://github.com/jonty-afk/troubleshooting-guide',
    shape: 'octahedron',
    color: '#fbbf24',
  },
  {
    id: 'shift-roster-planner',
    name: 'Shift Roster Planner',
    summary:
      'Weekly roster grid for small teams with hour totals, clash warnings and CSV export.',
    tech: ['React', 'Vite', 'Tailwind CSS'],
    url: 'https://github.com/jonty-afk/shift-roster-planner',
    shape: 'torus',
    color: '#f472b6',
  },
  {
    id: 'complaint-reply-helper',
    name: 'Complaint Reply Helper',
    summary:
      'Drafts customer complaint replies from a problem type, outcome and tone, with an editable draft and copy button.',
    tech: ['React', 'Vite', 'Tailwind CSS'],
    url: 'https://github.com/jonty-afk/complaint-reply-helper',
    shape: 'icosahedron',
    color: '#a78bfa',
  },
  {
    id: 'the-cleanic',
    name: 'The Cleanic',
    summary:
      'Website for my Airbnb and short-stay cleaning business in Auckland. Static site deployed on Vercel.',
    tech: ['HTML', 'CSS', 'JavaScript'],
    url: 'https://github.com/jonty-afk/the_cleanic_website',
    shape: 'cone',
    color: '#60a5fa',
  },
  {
    id: 'saraya',
    name: 'Saraya',
    summary: 'Storefront for a fashion brand, built with React and TypeScript.',
    tech: ['React', 'TypeScript', 'shadcn/ui'],
    url: 'https://github.com/jonty-afk/saraya',
    shape: 'dodecahedron',
    color: '#fb923c',
  },
]

const TAU = Math.PI * 2

// Angle of item `index` on a ring of `count` items, measured from the front.
export function angleForIndex(index, count) {
  if (!Number.isInteger(count) || count <= 0) throw new RangeError('count must be a positive integer')
  return (index / count) * TAU
}

// Smallest signed turn (between -PI and PI) that takes `from` to `to`.
export function shortestAngleDelta(from, to) {
  let delta = (to - from) % TAU
  if (delta > Math.PI) delta -= TAU
  if (delta < -Math.PI) delta += TAU
  return delta
}

// Move through the list in either direction, wrapping at the ends.
// With nothing selected (-1), next goes to the first item and previous to the last.
export function stepIndex(current, step, count) {
  if (count <= 0) return -1
  if (current < 0) return step >= 0 ? 0 : count - 1
  return (((current + step) % count) + count) % count
}
