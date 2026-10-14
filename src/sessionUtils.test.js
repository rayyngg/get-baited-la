import test from 'node:test'
import assert from 'node:assert/strict'
import { sessions } from './sessions.js'
import { summariseSession, validateSessions } from './sessionUtils.js'

const definition = sessions[0]
const correctAnswers = definition.emails.map(email => email.type)
const flipped = type => type === 'safe' ? 'phishing' : 'safe'
const scamCount = definition.emails.filter(email => email.type === 'phishing').length
const safeCount = 10 - scamCount

test('six sessions have exactly ten distinct, complete messages each', () => {
  assert.equal(sessions.length, 6)
  assert.equal(new Set(sessions.map(session => session.id)).size, 6)
  const emails = sessions.flatMap(session => session.emails)
  assert.equal(emails.length, 60)
  assert.equal(new Set(emails.map(email => email.id)).size, 60)
  assert.equal(new Set(emails.map(email => email.subject)).size, 60)
  assert.equal(new Set(emails.map(email => email.paragraphs.join(' '))).size, 60)
  for (const session of sessions) {
    assert.equal(session.emails.length, 10)
    assert.ok(session.emails.some(email => email.type === 'safe'))
    assert.ok(session.emails.some(email => email.type === 'phishing'))
    assert.ok(session.emails.every(email => email.clues.length === 2))
  }
  assert.doesNotThrow(() => validateSessions(JSON.parse(JSON.stringify(sessions))))
})

test('perfect results give accurate strengths and a continued habit', () => {
  for (const session of sessions) {
    const summary = summariseSession(session, session.emails.map(email => email.type))
    assert.equal(summary.score, 10)
    assert.equal(summary.total, 10)
    assert.equal(summary.results.filter(result => result.correct).length, 10)
    const scams = session.emails.filter(email => email.type === 'phishing').length
    assert.ok(summary.good.includes(`${scams} of ${scams} scams`))
    assert.ok(summary.good.includes(`${10 - scams} of ${10 - scams} safe emails`))
    assert.match(summary.watch, /every answer right/)
    assert.equal(summary.tip, session.tip)
  }
})

test('all wrong answers encourage completion without inventing a strength', () => {
  const summary = summariseSession(definition, correctAnswers.map(flipped))
  assert.equal(summary.score, 0)
  assert.match(summary.good, /finished all 10/)
  assert.ok(summary.watch.includes(`${scamCount} scam emails looked safe`))
  assert.ok(summary.watch.includes(`flagged ${safeCount} safe emails`))
  assert.equal(summary.results.every(result => !result.correct), true)
})

test('safe emails incorrectly flagged receive context advice', () => {
  const summary = summariseSession(definition, definition.emails.map(email => email.type === 'safe' ? 'phishing' : email.type))
  assert.equal(summary.score, scamCount)
  assert.ok(summary.good.includes(`${scamCount} of ${scamCount} scams`))
  assert.ok(summary.good.includes(`0 of ${safeCount} safe emails`))
  assert.ok(summary.watch.includes(`${safeCount} safe emails were flagged`))
  assert.match(summary.tip, /what you were expecting/)
})

test('missed scams prioritise the most often missed lesson', () => {
  const altered = structuredClone(definition)
  for (const email of altered.emails) if (email.type === 'phishing') email.lesson = 'secrets'
  const summary = summariseSession(altered, altered.emails.map(() => 'safe'))
  assert.equal(summary.score, safeCount)
  assert.match(summary.watch, /passwords or sign-in codes/)
  assert.doesNotMatch(summary.watch, /flagged/)
  assert.match(summary.tip, /Keep passwords and sign-in codes private/)
})

test('a single mistake is counted once and uses singular wording', () => {
  const answers = [...correctAnswers]
  answers[0] = flipped(answers[0])
  const summary = summariseSession(definition, answers)
  assert.equal(summary.score, 9)
  assert.match(summary.watch, /1 scam email looked safe/)
  assert.equal(summary.results[0].answer, 'safe')
  assert.equal(summary.results[0].correct, false)
  assert.match(summary.tip, /Keep passwords and sign-in codes private/)
  const summaryWords = [summary.good, summary.watch, summary.tip].join(' ').split(/\s+/).length
  assert.ok(summaryWords <= 80)
})

test('partial or invalid answers cannot produce a completion summary', () => {
  assert.throws(() => summariseSession(definition, []), /Finish every email/)
  assert.throws(() => summariseSession(definition, correctAnswers.slice(0, 9)), /Finish every email/)
  assert.throws(() => summariseSession(definition, correctAnswers.map(() => 'unknown')), /Finish every email/)
})

test('future session data must be ten emails, mixed, distinct, and fictional', () => {
  const shortened = structuredClone(definition)
  shortened.emails.pop()
  assert.throws(() => validateSessions([shortened]), /10 emails/)
  const duplicated = structuredClone(sessions)
  duplicated[1].emails[0] = structuredClone(duplicated[0].emails[0])
  assert.throws(() => validateSessions(duplicated), /different across sessions/)
  const unmixed = structuredClone(definition)
  unmixed.emails.forEach(email => { email.type = 'phishing' })
  assert.throws(() => validateSessions([unmixed]), /both phishing and safe/)
  const realLink = structuredClone(definition)
  realLink.emails[0].link = { label: 'Open payment', destination: 'actual-website.com/pay' }
  assert.throws(() => validateSessions([realLink]), /fictional link/)
  const missingFeedback = structuredClone(definition)
  missingFeedback.emails[0].clues = []
  assert.throws(() => validateSessions([missingFeedback]), /needs clues/)
})
