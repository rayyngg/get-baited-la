import test from 'node:test'
import assert from 'node:assert/strict'
import { sessions } from './sessions.js'
import { HISTORY_KEY, appendRecord, completedRecord, hasUnseenSession, loadHistory, nextSession, saveHistory, sessionDate } from './sessionHistory.js'

const storage = () => {
  const data = new Map()
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }
}
const finish = (definition, number = 1, answers = definition.emails.map(email => email.type)) => completedRecord({
  id: `run-${number}`, number, definition, startedAt: '2026-10-14T01:00:00.000Z',
}, answers, '2026-10-14T01:10:00.000Z')

test('the first six completions serve 60 distinct mixed emails', () => {
  let records = []
  const ids = new Set()
  for (let number = 1; number <= 6; number++) {
    assert.equal(hasUnseenSession(sessions, records), true)
    const definition = nextSession(sessions, records)
    assert.equal(definition.title, 'Practice session')
    assert.equal(definition.emails.length, 10)
    for (const email of definition.emails) {
      assert.equal(ids.has(email.id), false)
      ids.add(email.id)
    }
    records = appendRecord(records, finish(definition, number))
  }
  assert.equal(ids.size, 60)
  assert.equal(hasUnseenSession(sessions, records), false)
  assert.equal(nextSession(sessions, records).id, sessions[0].id)
})

test('starting or abandoning an unfinished session does not consume another set', () => {
  const records = []
  assert.equal(nextSession(sessions, records), nextSession(sessions, records))
  assert.throws(() => finish(sessions[0], 1, ['safe']), /Finish every email/)
  assert.equal(records.length, 0)
})

test('completion is saved once and survives a fresh load with full feedback', () => {
  const target = storage()
  const record = finish(sessions[0])
  const once = appendRecord([], record)
  assert.equal(appendRecord(once, record), once)
  assert.equal(saveHistory(once, target), true)
  const loaded = loadHistory(target)
  assert.equal(loaded.warning, '')
  assert.equal(loaded.records.length, 1)
  assert.deepEqual(loaded.records[0], record)
  assert.equal(loaded.records[0].summary.results.length, 10)
  assert.equal(nextSession(sessions, loaded.records).id, sessions[1].id)
})

test('saved email snapshots remain unchanged if future source data changes', () => {
  const definition = structuredClone(sessions[0])
  const record = finish(definition)
  definition.emails[0].subject = 'A later replacement email'
  definition.emails[0].clues[0] = 'A later explanation'
  assert.notEqual(record.definition.emails[0].subject, definition.emails[0].subject)
  assert.notEqual(record.summary.results[0].email.clues[0], definition.emails[0].clues[0])
})

test('corrupt and duplicate saved records are ignored with readable feedback', () => {
  const target = storage()
  target.setItem(HISTORY_KEY, '{broken')
  assert.equal(loadHistory(target).records.length, 0)
  assert.ok(loadHistory(target).warning)
  const good = finish(sessions[0])
  const bad = { ...finish(sessions[1], 2), answers: ['safe'] }
  target.setItem(HISTORY_KEY, JSON.stringify({ version: 1, records: [good, bad, good] }))
  const loaded = loadHistory(target)
  assert.equal(loaded.records.length, 1)
  assert.ok(loaded.warning)
})

test('blocked storage reports failure and leaves the in-memory result intact', () => {
  const blocked = { getItem() { throw new Error('Blocked') }, setItem() { throw new Error('Quota exceeded') } }
  const record = finish(sessions[0])
  const records = [record]
  assert.equal(saveHistory(records, blocked), false)
  assert.equal(records[0], record)
  assert.ok(loadHistory(blocked).warning)
})

test('history dates display Singapore time', () => {
  assert.match(sessionDate('2026-10-14T01:10:00.000Z'), /9:10/)
})
