export default function SessionSummary({ summary, Icon, titleRef, startNext, goHome, saveState = 'saved', onRetry, hasFreshEmails }) {
  return <section className="session-summary" aria-labelledby="summary-title">
    <span className="summary-icon"><Icon name="shield" size={30}/></span>
    <h2 id="summary-title" ref={titleRef} tabIndex={-1}>{summary.score === summary.total ? 'Great work. All 10 correct!' : 'Session complete. Keep practising.'}</h2>
    <p className="summary-score"><strong>{summary.score} out of {summary.total}</strong> correct</p>
    <div className={`save-notice ${saveState === 'failed' ? 'save-failed' : ''}`} role="status">
      <Icon name={saveState === 'failed' ? 'flag' : 'check'} size={18}/>
      <span>{saveState === 'saved' ? 'Saved in this browser on this device.' : saveState === 'failed' ? 'This result could not be saved. Your summary is still here.' : 'Saving your result…'}</span>
      {saveState === 'failed' && onRetry && <button className="text-button" onClick={onRetry}>Try saving again</button>}
    </div>
    <div className="summary-highlights">
      <div className="summary-highlight good"><span><Icon name="check" size={20}/></span><div><h3>What went well</h3><p>{summary.good}</p></div></div>
      <div className="summary-highlight watch"><span><Icon name="book" size={20}/></span><div><h3>{summary.score === summary.total ? 'Keep it up' : 'What to watch for'}</h3><p>{summary.watch}</p></div></div>
      <div className="summary-highlight habit"><span><Icon name="shield" size={20}/></span><div><h3>One tip to remember</h3><p>{summary.tip}</p></div></div>
    </div>
    {!hasFreshEmails && <p className="repeat-notice">You’ve completed all 60 practice emails. Another session will repeat an earlier set.</p>}
    <div className="summary-actions"><button className="primary-button" onClick={startNext}>Start another session<Icon name="arrow" size={17}/></button><button className="secondary-button" onClick={goHome}>Back to home</button></div>
    <details className="answer-review"><summary>Review my 10 answers</summary><ol>{summary.results.map(({ email, answer, correct }, index) => <li key={email.id}><div className="review-heading"><span className={`review-outcome ${correct ? 'right' : 'wrong'}`}>{correct ? 'Correct' : 'To revisit'}</span><h3>{index + 1}. {email.subject}</h3></div><p className="review-verdict">You chose {answer === 'safe' ? 'Safe' : 'Phishing'} · Answer: {email.type === 'safe' ? 'Safe' : 'Phishing'}</p><p>{email.takeaway}</p><ul>{email.clues.map(clue => <li key={clue}>{clue}</li>)}</ul></li>)}</ol></details>
  </section>
}
