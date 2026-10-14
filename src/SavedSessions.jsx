import { sessionDate } from './sessionHistory'

export default function SavedSessions({ records, Icon, headingRef, startSession, goHome, onView, warning }) {
  return <section className="saved-sessions" aria-labelledby="saved-title">
    <button className="back-button text-button" onClick={goHome}><Icon name="arrow" size={18}/>Back to home</button>
    <div className="page-heading"><div><span className="eyebrow">YOUR PRACTICE</span><h1 id="saved-title" ref={headingRef} tabIndex={-1}>Saved sessions</h1><p>Revisit your results and the tips you learned.</p></div><button className="primary-button" onClick={startSession}>Start a session<Icon name="arrow" size={18}/></button></div>
    <p className="history-note">Completed sessions are saved in this browser on this device.</p>
    {warning && <p className="storage-warning" role="status">{warning}</p>}
    {records.length ? <ol className="saved-session-list">{[...records].reverse().map(record => <li key={record.id}><span className="saved-session-icon"><Icon name="shield" size={23}/></span><div className="saved-session-info"><h2>Session {record.number}</h2><p>{sessionDate(record.completedAt)}</p><span>{record.summary.score} out of 10 correct</span></div><button className="secondary-button" aria-label={`View summary for Session ${record.number}`} onClick={() => onView(record.id)}>View summary<Icon name="arrow" size={17}/></button></li>)}</ol> : <div className="history-empty"><Icon name="book" size={30}/><h2>Your first result will appear here.</h2><p>Start a session and finish all 10 emails to save your summary.</p></div>}
  </section>
}
