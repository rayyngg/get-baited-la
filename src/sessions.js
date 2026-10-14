import { emailBank } from './emailBank.js'
import { validateSessions } from './sessionUtils.js'

// Distribute unrelated daily-life scenarios across six distinct mixed sets.
// A future provider can return the same serialisable definitions.
export const sessions = validateSessions(Array.from({ length: 6 }, (_, index) => ({
  id: `singapore-set-${index + 1}`,
  title: 'Practice session',
  description: '10 mixed emails from everyday life in Singapore.',
  tip: 'Pause, check the request, and use a contact or app you already trust.',
  emails: Array.from({ length: 10 }, (_, emailIndex) => emailBank[emailIndex * 6 + index]),
})))
