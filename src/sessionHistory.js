import { summariseSession, validateSessions } from './sessionUtils.js'

export const HISTORY_KEY = 'get-baited-la.session-history.v1'

export function nextSession(definitions, records) {
  const usedIds = new Set(records.map(record => record.definition.id))
  return definitions.find(definition => !usedIds.has(definition.id)) || definitions[records.length % definitions.length]
}

export function hasUnseenSession(definitions, records) {
  return definitions.some(definition => !records.some(record => record.definition.id === definition.id))
}

export function completedRecord(run, answers, completedAt = new Date().toISOString()) {
  const summary = summariseSession(run.definition, answers)
  return JSON.parse(JSON.stringify({
    id: run.id, number: run.number, startedAt: run.startedAt, completedAt,
    definition: run.definition, answers, summary,
  }))
}

export function appendRecord(records, record) {
  return records.some(item => item.id === record.id) ? records : [...records, record]
}

function validRecord(record) {
  try {
    if (!record || typeof record.id !== 'string' || !record.id || !Number.isInteger(record.number) || record.number < 1) return false
    if (!Number.isFinite(Date.parse(record.completedAt)) || !Number.isFinite(Date.parse(record.startedAt))) return false
    validateSessions([record.definition])
    const calculated = summariseSession(record.definition, record.answers)
    if (record.summary?.score !== calculated.score || record.summary?.total !== 10) return false
    for (const field of ['good', 'watch', 'tip']) if (typeof record.summary[field] !== 'string' || !record.summary[field].trim()) return false
    // Restore review rows from the stored email snapshot and recorded answers.
    record.summary.results = calculated.results
    return true
  } catch { return false }
}

export function loadHistory(storage) {
  try {
    const target = storage || globalThis.localStorage
    if (!target) return { records: [], warning: 'Saving is unavailable in this browser.' }
    const raw = target.getItem(HISTORY_KEY)
    if (!raw) return { records: [], warning: '' }
    const parsed = JSON.parse(raw)
    if (parsed.version !== 1 || !Array.isArray(parsed.records)) throw new Error('Invalid saved history')
    const ids = new Set()
    const records = parsed.records.filter(record => {
      if (!validRecord(record) || ids.has(record.id)) return false
      ids.add(record.id)
      return true
    })
    return { records, warning: records.length === parsed.records.length ? '' : 'Some saved results could not be read.' }
  } catch {
    return { records: [], warning: 'Saved results could not be read in this browser.' }
  }
}

export function saveHistory(records, storage) {
  try {
    const target = storage || globalThis.localStorage
    if (!target) return false
    target.setItem(HISTORY_KEY, JSON.stringify({ version: 1, records }))
    return true
  } catch { return false }
}

export function sessionDate(iso) {
  return new Intl.DateTimeFormat('en-SG', { timeZone: 'Asia/Singapore', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
}
