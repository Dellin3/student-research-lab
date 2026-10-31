// Small, local helpers for the My research editor. Nothing here sends text anywhere.
const URL_PATTERN = /\bhttps?:\/\/[^\s<>"'`]+/gi
const DOI_PATTERN = /\b10\.\d{4,9}\/[^\s<>"'`]+/gi
const TRAILING = /[.,;:!?'"»”’)\]}]$/u

function trimTrailing(value) {
  let text = value
  while (TRAILING.test(text)) {
    const last = text.at(-1)
    const opener = { ')': '(', ']': '[', '}': '{' }[last]
    // Keep a closing bracket that belongs to the link, as in Wikipedia titles.
    if (opener && text.split(opener).length - 1 >= text.split(last).length - 1) break
    text = text.slice(0, -1)
  }
  return text
}

function linkLabel(url) {
  const host = url.hostname.replace(/^www\./, '')
  let path = url.pathname + url.search
  try { path = decodeURI(path) } catch { /* Keep the encoded form. */ }
  path = path.replace(/\/$/, '')
  const label = host + path
  return label.length > 70 ? `${label.slice(0, 67)}…` : label
}

// Finds web links and bare DOIs in the order they appear, without duplicates.
export function findSourceLinks(text, max = 20) {
  if (typeof text !== 'string' || !text) return []
  const found = []
  const seen = new Set()
  const add = (href, label, index) => {
    if (seen.has(href)) return
    seen.add(href)
    found.push({ href, label, index })
  }
  for (const match of text.matchAll(URL_PATTERN)) {
    try {
      const url = new URL(trimTrailing(match[0]))
      if (['http:', 'https:'].includes(url.protocol) && url.hostname.includes('.')) add(url.href, linkLabel(url), match.index)
    } catch { /* Not a usable address. */ }
  }
  const withoutUrls = text.replace(URL_PATTERN, match => ' '.repeat(match.length))
  for (const match of withoutUrls.matchAll(DOI_PATTERN)) {
    const doi = trimTrailing(match[0])
    add(`https://doi.org/${doi.split('/').map(encodeURIComponent).join('/')}`, `doi:${doi}`, match.index)
  }
  return found.sort((a, b) => a.index - b.index).slice(0, max).map(({ href, label }) => ({ href, label }))
}

export function todayStamp(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}

// Adds a dated line for today's notes. An entry for today is never duplicated.
export function appendDatedEntry(text, stamp) {
  const value = typeof text === 'string' ? text : ''
  const lastLine = value.trimEnd().split('\n').at(-1)?.trim()
  if (lastLine === stamp) return value.endsWith('\n') ? value : `${value}\n`
  if (!value.trim()) return `${stamp}\n`
  const separator = value.endsWith('\n\n') ? '' : value.endsWith('\n') ? '\n' : '\n\n'
  return `${value}${separator}${stamp}\n`
}

const formatCount = value => value.toLocaleString('en-US')
export function characterStatus(length, limit) {
  const left = Math.max(0, limit - length)
  const level = length >= limit ? 'full' : length >= limit * 0.9 ? 'near' : 'ok'
  const suffix = level === 'full' ? ' · limit reached' : level === 'near' ? ` · ${formatCount(left)} left` : ''
  return { level, text: `${formatCount(length)} / ${formatCount(limit)} characters${suffix}` }
}
