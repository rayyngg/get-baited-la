export const EMAILS_PER_SESSION = 10

const habits = {
  sender: 'Check the full email address, not just the sender’s name.',
  links: 'Open the service’s website yourself instead of using an unexpected link.',
  pressure: 'Pause when someone rushes you. Check with a contact you already trust.',
  money: 'Check payment requests by calling a number you already have.',
  secrets: 'Keep passwords and sign-in codes private. Never send them in a reply.',
  downloads: 'Do not install software or turn off protection because an email asks you to.',
  permissions: 'Ask a trusted helper before giving an unfamiliar app access to your account.',
  context: 'Compare the email with what you were expecting before deciding.',
}

const checks = {
  sender: 'the full sender address', links: 'where links really lead',
  pressure: 'urgent or secret requests', money: 'unexpected payment instructions',
  secrets: 'requests for passwords or sign-in codes', downloads: 'unwanted downloads',
  permissions: 'requests to give an app access', context: 'what you were expecting',
}

// This is also the validation boundary for a future session provider.
export function validateSessions(definitions) {
  if (!Array.isArray(definitions) || !definitions.length) throw new Error('Provide at least one session.')
  const sessionIds = new Set()
  const emailIds = new Set()
  const subjects = new Set()
  for (const definition of definitions) {
    for (const field of ['id', 'title', 'description', 'tip']) {
      if (typeof definition[field] !== 'string' || !definition[field].trim()) throw new Error(`Session needs ${field}.`)
    }
    if (sessionIds.has(definition.id)) throw new Error('Session IDs must be unique.')
    sessionIds.add(definition.id)
    if (!Array.isArray(definition.emails) || definition.emails.length !== EMAILS_PER_SESSION) throw new Error('Each session must have 10 emails.')
    const types = new Set()
    for (const email of definition.emails) {
      for (const field of ['id', 'subject', 'sender', 'address', 'context', 'greeting', 'signature', 'takeaway']) {
        if (typeof email[field] !== 'string' || !email[field].trim()) throw new Error(`Email needs ${field}.`)
      }
      if (emailIds.has(email.id) || subjects.has(email.subject)) throw new Error('Emails must be different across sessions.')
      emailIds.add(email.id)
      subjects.add(email.subject)
      if (!['phishing', 'safe'].includes(email.type)) throw new Error('Email type must be phishing or safe.')
      types.add(email.type)
      if (!Object.hasOwn(habits, email.lesson)) throw new Error('Email needs a known lesson.')
      for (const field of ['paragraphs', 'clues']) {
        if (!Array.isArray(email[field]) || !email[field].length || email[field].some(value => typeof value !== 'string' || !value.trim())) throw new Error(`Email needs ${field}.`)
      }
      if (!/^[^\s@]+@[^\s@]+\.example$/.test(email.address)) throw new Error('Use fictional .example email addresses.')
      if (email.replyTo && !/^[^\s@]+@[^\s@]+\.example$/.test(email.replyTo)) throw new Error('Use a fictional reply address.')
      if (email.link && (!email.link.label || !email.link.destination || !/^[^\s/?#]+\.example(?:[/?#]|$)/.test(email.link.destination))) throw new Error('Use a fictional link with a label.')
    }
    if (types.size !== 2) throw new Error('Include both phishing and safe emails.')
  }
  return definitions
}

export function summariseSession(definition, answers) {
  if (answers.length !== definition.emails.length || answers.some(answer => !['safe', 'phishing'].includes(answer))) throw new Error('Finish every email before showing a summary.')
  const results = definition.emails.map((email, index) => ({ email, answer: answers[index], correct: email.type === answers[index] }))
  const score = results.filter(result => result.correct).length
  const scams = results.filter(result => result.email.type === 'phishing')
  const safe = results.filter(result => result.email.type === 'safe')
  const missedScams = scams.filter(result => !result.correct)
  const flaggedSafe = safe.filter(result => !result.correct)
  const lessons = missedScams.reduce((counts, result) => ({ ...counts, [result.email.lesson]: (counts[result.email.lesson] || 0) + 1 }), {})
  const priority = Object.keys(lessons).sort((a, b) => lessons[b] - lessons[a])[0]
  const good = score === 0
    ? 'You finished all 10 emails. Taking time to practise is a useful first step.'
    : `You spotted ${scams.length - missedScams.length} of ${scams.length} scams and recognised ${safe.length - flaggedSafe.length} of ${safe.length} safe emails.`
  const watch = missedScams.length
    ? `${missedScams.length} scam ${missedScams.length === 1 ? 'email looked' : 'emails looked'} safe. Check ${checks[priority]}.${flaggedSafe.length ? ` You also flagged ${flaggedSafe.length} safe ${flaggedSafe.length === 1 ? 'email' : 'emails'}.` : ''}`
    : flaggedSafe.length
      ? `${flaggedSafe.length} safe ${flaggedSafe.length === 1 ? 'email was' : 'emails were'} flagged. Expected messages can be safe; check the background too.`
      : 'You got every answer right. Keep checking unexpected requests, even from familiar names.'
  return { score, total: results.length, good, watch, tip: priority ? habits[priority] : flaggedSafe.length ? habits.context : definition.tip, results }
}
