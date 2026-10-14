import { useEffect, useRef, useState } from 'react'
import { summariseSession } from './sessionUtils'
import SessionSummary from './SessionSummary'

export default function PracticeSession({ run, Icon, headingRef, goHome, startNext, onComplete, saveState, onRetry, hasFreshEmails }) {
  const definition = run.definition
  const emails = definition.emails
  const [session, setSession] = useState({ index: 0, answers: [], complete: false })
  const emailHeadingRef = useRef(null)
  const summaryRef = useRef(null)
  const feedbackHeadingRef = useRef(null)
  const feedbackPanelRef = useRef(null)
  const resultRecorded = useRef(false)
  const email = emails[session.index]
  const answer = session.answers[session.index]
  const correct = answer === email.type
  const summary = session.complete ? summariseSession(definition, session.answers) : null

  useEffect(() => {
    if (!session.complete || resultRecorded.current) return
    resultRecorded.current = true
    onComplete(run, session.answers)
  }, [session.complete, run, session.answers, onComplete])

  useEffect(() => {
    if (session.complete) summaryRef.current?.focus({ preventScroll: true })
    else if (session.index > 0) emailHeadingRef.current?.focus({ preventScroll: true })
  }, [session.index, session.complete])

  useEffect(() => {
    if (!answer || session.complete) return
    feedbackHeadingRef.current?.focus({ preventScroll: true })
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    feedbackPanelRef.current?.scrollIntoView({ block: 'nearest', behavior: reducedMotion ? 'instant' : 'smooth' })
  }, [answer, session.complete])

  function choose(value) {
    setSession(current => {
      if (current.answers[current.index] || current.complete) return current
      return { ...current, answers: [...current.answers, value] }
    })
  }

  function next() {
    setSession(current => {
      if (!current.answers[current.index] || current.complete) return current
      return current.index === emails.length - 1
        ? { ...current, complete: true }
        : { ...current, index: current.index + 1 }
    })
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' })
  }

  return <div className="session-content">
    <button className="back-button text-button" onClick={goHome}><Icon name="arrow" size={17}/>Back to home</button>
    <div className="page-heading session-heading">
      <div><div className="eyebrow">YOUR PRACTICE INBOX</div><h1 ref={headingRef} tabIndex={-1}>Session {run.number}</h1><p>{session.complete ? 'Here’s how you did, and what to remember.' : 'Some emails are scams. Some are safe. Take your time.'}</p></div>
      <span className="session-count"><Icon name="mail" size={15}/>{emails.length} emails · No timer</span>
    </div>
    <div className="session-progress">
      <div className="progress-caption"><span>{session.complete ? 'Session complete' : `Email ${session.index + 1} of ${emails.length}`}</span><span>{session.answers.length} of {emails.length} answered</span></div>
      <div className="progress-track" role="progressbar" aria-label="Emails answered" aria-valuemin={0} aria-valuemax={emails.length} aria-valuenow={session.answers.length}><div style={{ width: `${session.answers.length / emails.length * 100}%` }}/></div>
    </div>

    {session.complete ? <SessionSummary summary={summary} Icon={Icon} titleRef={summaryRef} startNext={startNext} goHome={goHome} saveState={saveState} onRetry={onRetry} hasFreshEmails={hasFreshEmails}/> : <>
      <div className="email-stage" key={email.id}>
        <aside className="email-context" aria-label="Background for this email"><Icon name="book" size={19}/><div><span className="eyebrow">What you already know</span><p>{email.context}</p></div></aside>
        <section className="practice-card" aria-labelledby="email-subject">
          <div className="practice-toolbar"><span><Icon name="mail" size={18}/>Practice inbox</span><span className="simulation-label">SIMULATION</span></div>
          <div className="practice-email">
            <h2 id="email-subject" ref={emailHeadingRef} tabIndex={-1}>{email.subject}</h2>
            <div className="sender"><span className="email-avatar blue-tint">{email.sender[0]}</span><div><strong>{email.sender}</strong><span>{email.address}</span>{email.replyTo && <span className="reply-address">Reply-To: {email.replyTo}</span>}</div><span className="email-time">{email.time}</span></div>
            <div className="email-body"><p>{email.greeting}</p>{email.paragraphs.map(text => <p key={text}>{text}</p>)}
              {email.attachment && <div className="email-attachment"><Icon name="book" size={17}/><span>{email.attachment}</span></div>}
              {email.link && <><span className="fake-email-link">{email.link.label}<Icon name="link" size={14}/></span><p className="destination">Link destination: {email.link.destination}</p></>}
              <p>Thank you,<br/>{email.signature}</p>
            </div>
          </div>
        </section>
      </div>
      <section className="decision" aria-labelledby="decision-title"><div><h2 id="decision-title">Phishing or safe?</h2><p>{answer ? 'Read the explanation, then choose Next email.' : 'Check who sent it and what they want you to do.'}</p></div><div className="decision-actions">{['phishing', 'safe'].map(value => <button key={value} aria-label={value === 'safe' ? 'Safe' : 'Phishing'} className={`secondary-button answer-button ${answer === value ? 'chosen' : ''}`} aria-pressed={answer === value} disabled={Boolean(answer)} onClick={() => choose(value)}><Icon name={value === 'safe' ? 'check' : 'flag'} size={20}/><span>{value === 'safe' ? 'Safe' : 'Phishing'}<small>{value === 'safe' ? 'A genuine email' : 'A scam email'}</small></span></button>)}</div></section>
      <div className="feedback-slot" aria-live="polite" aria-atomic="true">
        {answer ? <section ref={feedbackPanelRef} className={`feedback answer-feedback ${correct ? 'is-correct' : 'is-incorrect'}`} aria-labelledby="feedback-title"><span className="step-icon"><Icon name={correct ? 'check' : 'book'} size={24}/></span><div className="feedback-copy"><span className="eyebrow">{correct ? 'Correct answer' : 'A chance to learn'}</span><h2 id="feedback-title" ref={feedbackHeadingRef} tabIndex={-1}>{correct ? (email.type === 'safe' ? 'Well spotted. This one is safe.' : 'Good catch. This is a scam.') : (email.type === 'safe' ? 'This one is safe. Here’s why.' : 'This is a scam. Here’s why.')}</h2>{!correct && <p>You chose {answer === 'safe' ? 'Safe' : 'Phishing'}.</p>}<ul>{email.clues.map(clue => <li key={clue}>{clue}</li>)}</ul><p className="feedback-takeaway"><strong>Remember:</strong> {email.takeaway}</p></div></section> : <div className="feedback-placeholder"><Icon name="shield" size={20}/><p>Choose an answer to see the explanation.<span>There is no rush.</span></p></div>}
      </div>
      <div className="next-row"><span>{session.index === emails.length - 1 ? 'Last email. One more useful habit.' : 'One email at a time. You’ve got this.'}</span><button className="primary-button" disabled={!answer} onClick={next}>{session.index === emails.length - 1 ? 'Finish session' : 'Next email'}<Icon name="arrow" size={18}/></button></div>
    </>}
    <div className="simulation-note"><Icon name="shield" size={15}/>Fictional practice emails. Addresses and links are examples; links and files do not open.</div>
  </div>
}
