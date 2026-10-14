import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import PracticeSession from './PracticeSession'
import SavedSessions from './SavedSessions'
import SessionSummary from './SessionSummary'
import { sessions } from './sessions'
import { EMAILS_PER_SESSION } from './sessionUtils'
import { appendRecord, completedRecord, hasUnseenSession, loadHistory, nextSession, saveHistory, sessionDate } from './sessionHistory'

function Icon({ name, size = 20, ...props }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M9 21v-8h6v8"/></>,
    arrow: <><path d="M4 12h16m-6-6 6 6-6 6"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/></>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/></>,
    book: <><path d="M12 6c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Z"/><path d="M12 6v15"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    chevron: <path d="m9 5 7 7-7 7"/>,
    spark: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/></>,
    flag: <><path d="M5 21V4c5-4 9 4 14 0v10c-5 4-9-4-14 0"/></>,
    link: <><path d="m10 13 4-4m-6 6-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 3 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 1)"/></>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>
}

function Logo() {
  return <span className="logo-icon" aria-hidden="true"><svg width="27" height="29" viewBox="0 0 32 34" fill="none"><path d="M22 8v15a7 7 0 0 1-14 0v-5l5 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="22" cy="7" r="3" stroke="currentColor" strokeWidth="2.4"/></svg></span>
}

function InboxIllustration() {
  return <div className="illustration" aria-hidden="true">
    <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
    <span className="floating-spark spark-one">✦</span><span className="floating-spark spark-two">✧</span>
    <div className="inbox-window">
      <div className="window-top"><span/><span/><span/><div className="window-address"/></div>
      <div className="inbox-heading"><span>Your inbox</span><span className="inbox-count">3 new</span></div>
      <div className="illustrated-email"><span className="email-avatar blue-tint"><Icon name="mail"/></span><div><div className="skeleton long"/><div className="skeleton short"/></div><span className="email-dot"/></div>
      <div className="illustrated-email suspicious"><span className="email-avatar blue-tint"><Icon name="flag"/></span><div><strong>Too good to be true?</strong><div className="skeleton medium"/></div><span className="question-mark">?</span></div>
      <div className="illustrated-email"><span className="email-avatar blue-tint"><Icon name="mail"/></span><div><div className="skeleton medium"/><div className="skeleton short"/></div></div>
    </div>
    <div className="safe-badge"><span><Icon name="shield" size={25}/></span><div>Good instincts.<small>Even better with practice.</small></div></div>
    <div className="cursor"><svg width="39" height="45" viewBox="0 0 39 45"><path d="m6 3 27 22-14 2-7 12Z" fill="currentColor" stroke="white" strokeWidth="3" strokeLinejoin="round"/></svg></div>
  </div>
}

const tips = [
  { icon: 'mail', label: 'Sender', title: 'Check the full address.', detail: 'A familiar name can hide a fake address. Look for misspellings or a domain that doesn’t match the organisation.' },
  { icon: 'link', label: 'Links', title: 'Check where the link leads.', detail: 'Hover to inspect the destination. If you’re unsure, open the organisation’s website yourself instead of clicking.' },
  { icon: 'flag', label: 'Urgency', title: 'Pressure is a warning sign.', detail: 'Unexpected prizes or urgent threats deserve a pause. Verify the request through a contact you already trust.' },
]

function TipsSection() {
  const [selectedTip, setSelectedTip] = useState(0)
  const tabRefs = useRef([])

  function handleTabKey(event, index) {
    const destinations = {
      ArrowRight: (index + 1) % tips.length,
      ArrowLeft: (index + tips.length - 1) % tips.length,
      Home: 0,
      End: tips.length - 1,
    }
    if (!(event.key in destinations)) return
    event.preventDefault()
    const next = destinations[event.key]
    setSelectedTip(next)
    tabRefs.current[next]?.focus({ preventScroll: true })
  }

  return (
    <section className="tips-section quick-tips" aria-labelledby="tips-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">A LITTLE HEAD START</span>
          <h2 id="tips-title">Before you click</h2>
        </div>
      </div>
      <div className="tips-grid" role="tablist" aria-label="Phishing awareness tips">
        {tips.map((tip, i) => (
          <div className={`tip-card ${selectedTip === i ? 'expanded' : ''}`} key={tip.label}>
            <button
              ref={element => { tabRefs.current[i] = element }}
              role="tab"
              id={`tip-tab-${i}`}
              aria-selected={selectedTip === i}
              aria-controls={`tip-${i}`}
              tabIndex={selectedTip === i ? 0 : -1}
              onClick={() => setSelectedTip(i)}
              onKeyDown={event => handleTabKey(event, i)}
            >
              <span className="tip-top">
                <Icon name={tip.icon} size={21}/>
              </span>
              <strong>{tip.label}</strong>
            </button>
          </div>
        ))}
      </div>
      <div className="tip-reading-area">
        {tips.map((tip, i) => (
          <div
            className={`tip-detail ${selectedTip === i ? 'selected' : ''}`}
            key={tip.label}
            id={`tip-${i}`}
            role="tabpanel"
            aria-labelledby={`tip-tab-${i}`}
            aria-hidden={selectedTip !== i}
            inert={selectedTip !== i}
            tabIndex={selectedTip === i ? 0 : -1}
          >
            <div><h3>{tip.title}</h3><p>{tip.detail}</p></div>
          </div>
        ))}
      </div>
    </section>
  )
}

function App() {
  const [view, setView] = useState('home')
  const [showHow, setShowHow] = useState(false)
  const [storedHistory] = useState(loadHistory)
  const [records, setRecords] = useState(storedHistory.records)
  const [historyWarning, setHistoryWarning] = useState(storedHistory.warning)
  const [saveState, setSaveState] = useState('saved')
  const [run, setRun] = useState(null)
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  const dialogRef = useRef(null)
  const headingRef = useRef(null)
  const hasNavigated = useRef(false)

  useEffect(() => {
    if (showHow) dialogRef.current?.showModal()
    else dialogRef.current?.close()
  }, [showHow])

  useEffect(() => {
    if (hasNavigated.current) headingRef.current?.focus({ preventScroll: true })
    hasNavigated.current = true
  }, [view, run?.id, selectedRecordId])

  useEffect(() => {
    if (!records.length) return
    const saved = saveHistory(records)
    setSaveState(saved ? 'saved' : 'failed')
    setHistoryWarning(saved ? '' : 'Your latest result could not be saved. Keep this page open and try saving again.')
  }, [records])

  function navigateTo(nextView) {
    setView(nextView)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' })
  }

  function startSession() {
    setRun({
      id: crypto.randomUUID(), number: Math.max(0, ...records.map(record => record.number)) + 1,
      startedAt: new Date().toISOString(), definition: nextSession(sessions, records),
    })
    navigateTo('session')
  }
  function goHome() { navigateTo('home') }
  function openHistory() { navigateTo('history') }
  function viewResult(id) {
    setSelectedRecordId(id)
    navigateTo('result')
  }
  const recordResult = useCallback((finishedRun, answers) => {
    const record = completedRecord(finishedRun, answers)
    setSaveState('saving')
    setRecords(current => appendRecord(current, record))
  }, [])
  function retrySave() {
    const saved = saveHistory(records)
    setSaveState(saved ? 'saved' : 'failed')
    if (saved) setHistoryWarning('')
  }
  const hasFreshEmails = hasUnseenSession(sessions, records)
  const selectedRecord = records.find(record => record.id === selectedRecordId)

  return <div className="app-shell">
    <aside className="sidebar">
      <button className="brand" onClick={goHome} aria-label="Get Baited La home"><Logo/><span>get <span className="brand-baited">baited</span><span className="brand-la"> la.</span></span></button>
      <div className="sidebar-main"><span className="nav-label">YOUR SPACE</span><nav aria-label="Main navigation"><button className={`nav-item ${view === 'home' ? 'active' : ''}`} onClick={goHome} aria-current={view === 'home' ? 'page' : undefined}><Icon name="home"/>Home<span className="active-dot"/></button><button className={`nav-item ${view === 'history' || view === 'result' ? 'active' : ''}`} onClick={openHistory} aria-current={view === 'history' ? 'page' : undefined}><Icon name="book"/>Saved sessions</button></nav></div>
      <div className="sidebar-footer"><span className="status-dot"/>Your safe space to learn</div>
    </aside>

    <div className="main-shell">
      <header className="topbar"><div className="breadcrumb">Your space<Icon name="chevron" size={13}/><span>{view === 'home' ? 'Home' : view === 'history' || view === 'result' ? 'Saved sessions' : `Session ${run?.number}`}</span></div><span className="topbar-caption"><Icon name="shield" size={16}/>Think before you click</span></header>
      <main key={view} className="page-transition">
        {view === 'home' ? <>
          <div className="page-heading home-heading">
            <h1 ref={headingRef} tabIndex={-1}>Welcome in.</h1>
            <button className="text-button" onClick={() => setShowHow(true)}>
              How it works<Icon name="arrow" size={16}/>
            </button>
          </div>

          <section className="hero home-hero" aria-labelledby="hero-title">
            <div className="hero-copy">
              <span className="hero-kicker"><span className="tiny-line"/>PHISHING PRACTICE</span>
              <h2 id="hero-title">Spot the scam.<br/><span>Skip the bait.</span></h2>
              <p>Practise with everyday emails from life in Singapore.</p>
              <button className="primary-button" onClick={startSession}>
                Start a session<Icon name="arrow" size={19}/>
              </button>
              <div className="hero-meta">
                <span><Icon name="mail" size={14}/>{EMAILS_PER_SESSION} emails per session</span>
                <span className="meta-dot">·</span><span>No timer</span>
              </div>
            </div>
            <InboxIllustration/>
          </section>

          {!hasFreshEmails && <p className="repeat-notice">You’ve completed all 60 practice emails. Your next session will repeat an earlier set.</p>}
          {historyWarning && <p className="storage-warning" role="status">{historyWarning}</p>}

          <ol className="practice-flow" aria-label="How practice works">
            <li><span className="flow-number">01</span><span>Read an email</span></li>
            <li><span className="flow-number">02</span><span>Spot the signs</span></li>
            <li><span className="flow-number">03</span><span>Get feedback</span></li>
          </ol>

          <TipsSection/>
          {records.length > 0 && <section className="home-results" aria-labelledby="home-results-title"><div className="section-heading"><h2 id="home-results-title">Your saved sessions</h2><button className="text-button" onClick={openHistory}>View all<Icon name="arrow" size={17}/></button></div><div className="recent-results">{records.slice(-3).reverse().map(record => <button key={record.id} onClick={() => viewResult(record.id)} aria-label={`View summary for Session ${record.number}`}><span><strong>Session {record.number}</strong><small>{sessionDate(record.completedAt)}</small></span><span>{record.summary.score}/10<Icon name="chevron" size={19}/></span></button>)}</div><p>Results stay in this browser on this device.</p></section>}
        </> : view === 'history' ? <SavedSessions records={records} Icon={Icon} headingRef={headingRef} startSession={startSession} goHome={goHome} onView={viewResult} warning={historyWarning}/> : view === 'result' && selectedRecord ? <div className="session-content"><button className="back-button text-button" onClick={openHistory}><Icon name="arrow" size={17}/>Saved sessions</button><div className="page-heading session-heading"><div><span className="eyebrow">YOUR SAVED RESULT</span><h1 ref={headingRef} tabIndex={-1}>Session {selectedRecord.number}</h1><p>{sessionDate(selectedRecord.completedAt)}</p></div></div><SessionSummary summary={selectedRecord.summary} Icon={Icon} startNext={startSession} goHome={goHome} saveState={saveState} onRetry={retrySave} hasFreshEmails={hasFreshEmails}/></div> : run && <PracticeSession key={run.id} run={run} Icon={Icon} headingRef={headingRef} goHome={goHome} startNext={startSession} onComplete={recordResult} saveState={saveState} onRetry={retrySave} hasFreshEmails={hasFreshEmails}/>}
        <footer><span>© {new Date().getFullYear()} Get Baited La</span><span>Less bait. More awareness.</span></footer>
      </main>
    </div>
    <dialog ref={dialogRef} onCancel={() => setShowHow(false)} onClick={event => { if (event.target === dialogRef.current) setShowHow(false) }} aria-labelledby="dialog-title"><button className="dialog-close" aria-label="Close how it works" onClick={() => setShowHow(false)}><Icon name="close"/></button><span className="step-icon blue-tint"><Icon name="shield" size={27}/></span><h2 id="dialog-title">A small practice. A useful habit.</h2><p>Start with 10 mixed emails from everyday life in Singapore.</p><ol><li>Read each email and its background.</li><li>Choose Phishing for a scam, or Safe for a genuine message.</li><li>Read the explanation, then select Next email.</li></ol><p>Finish to save your summary in this browser. Start another session for a different set. There’s no timer.</p><button className="primary-button" onClick={() => { setShowHow(false); startSession() }}>Start a session<Icon name="arrow" size={18}/></button></dialog>
  </div>
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>)
