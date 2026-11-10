import './RaceStatistics.css'
import { useMemo, useState } from 'react'
import { ArrowRight, BarChart3, ChartNoAxesCombined, Clock3, Crown, Flag, Timer, Trophy, Trash2 } from 'lucide-react'
import { formatResult, formatTime, getAiPersonality, playerPlacement, lastAverage, personalBest } from '../lib/racing'
import { officialSoloMs, parseSoloSolves, SOLO_TIMER_STORAGE_KEY, type SoloSolve } from '../lib/soloTimer'
import type { RaceRecord } from '../lib/racing'

type Props={history:RaceRecord[];goTo:(page:'race')=>void;clearHistory:()=>void;precision:2|3}
function PerformanceChart({records,precision}:{records:RaceRecord[];precision:2|3}){
  const samples=records.filter(r=>r.officialMs!==null).slice(-18)
  if(!samples.length)return <div className="chart-placeholder chart-empty"><div className="chart-gridlines"><span/><span/><span/><span/></div><div className="empty-chart-label"><span className="empty-chart-icon"><BarChart3 size={30}/></span><strong>No completed solves yet</strong><span>Your first valid solve will appear here.</span></div></div>
  const ms=samples.map(r=>r.officialMs as number)
  const min=Math.min(...ms),max=Math.max(...ms)
  const low=Math.max(0,min-(max-min||2000)*.25),high=max+(max-min||2000)*.25
  const y=(n:number)=>Math.round(174-(n-low)/(high-low)*143)
  const x=(i:number)=>samples.length===1?380:40+i*680/(samples.length-1)
  const points=ms.map((n,i)=>`${x(i)},${y(n)}`).join(' ')
  return <div className="performance-chart"><svg role="img" aria-label="Your last valid solve times in chronological order" viewBox="0 0 760 210" preserveAspectRatio="none"><defs><linearGradient id="raceChartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a467ff" stopOpacity=".28"/><stop offset="1" stopColor="#a467ff" stopOpacity="0"/></linearGradient></defs>{[45,89,134,179].map(y0=><line key={y0} x1="20" x2="740" y1={y0} y2={y0} stroke="#343b58" strokeWidth="1"/>)}<polygon points={`40,195 ${points} 720,195`} fill="url(#raceChartFill)"/><polyline points={points} fill="none" stroke="#9c73ff" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>{ms.map((n,i)=><circle key={i} cx={x(i)} cy={y(n)} r="4" fill="#d1b7ff" stroke="#1a1932" strokeWidth="2"><title>{`Solve ${samples.length===1?'':i+1}: ${formatTime(n,precision)}s`}</title></circle>)}</svg><div className="chart-axis"><span>{formatTime(max,precision)}s slowest</span><span>Last {samples.length} valid solve{samples.length===1?'':'s'}</span><span>{formatTime(min,precision)}s fastest</span></div></div>
}
function loadSoloStatsHistory(): SoloSolve[] {
  if (typeof window === 'undefined') return []
  try {
    return parseSoloSolves(JSON.parse(window.localStorage.getItem(SOLO_TIMER_STORAGE_KEY) || '[]'))
  } catch {
    return []
  }
}

export default function RaceStatistics({history,goTo,clearHistory,precision}:Props){
  const [soloHistory,setSoloHistory] = useState<SoloSolve[]>(loadSoloStatsHistory)
  const wins=history.filter(r=>r.win).length
  const pb=personalBest(history)
  const ao5=lastAverage(history,5)
  const ao12=lastAverage(history,12)
  const recent=[...history].reverse().slice(0,20)
  const soloRecent = useMemo(()=>[...soloHistory].reverse().slice(0,30), [soloHistory])
  const soloBest = useMemo(()=>{
    const valid = soloHistory.map(officialSoloMs).filter((value): value is number => value !== null)
    return valid.length ? Math.min(...valid) : null
  }, [soloHistory])
  const clearSoloHistory = () => {
    if (!window.confirm(`Clear ${soloHistory.length} saved solo practice solve(s) from this browser?`)) return
    try { window.localStorage.setItem(SOLO_TIMER_STORAGE_KEY, '[]') } catch {}
    setSoloHistory([])
  }
  const fmtAvg=(v:number|null|undefined)=>v===undefined?'—':v===null?'DNF':`${formatTime(v,precision)}s`
  return <div className="page-stack"><div className="page-heading"><div><div className="eyebrow">YOUR CUBING JOURNEY</div><h1>Track Your Progress.</h1><p>{history.length||soloHistory.length?'Your local race results, personal bests and practice solves are all saved on this device.':'All the important numbers, ready for your first solve.'}</p></div><span className="label-badge">{history.length||soloHistory.length?'LOCAL SOLVE HISTORY':'NO SOLVES YET'}</span></div>
    <div className="stat-grid"><section className="surface stat-tile"><span><Flag size={17}/> Total Solves</span><strong>{history.length}</strong><small>All finished AI race rounds</small></section><section className="surface stat-tile"><span><Trophy size={17}/> Race Wins</span><strong>{wins}</strong><small>{history.length?`${Math.round(wins/history.length*100)}% win rate`:'Your first victory awaits'}</small></section><section className="surface stat-tile"><span><Timer size={17}/> Personal Best</span><strong>{pb===null?'—':formatTime(pb,precision)}</strong><small>Fastest valid race time</small></section><section className="surface stat-tile"><span><ChartNoAxesCombined size={17}/> Average of 5</span><strong>{fmtAvg(ao5)}</strong><small>{history.length<5?`${5-history.length} more race solve(s) needed`:'Trimmed last 5 race solves'}</small></section></div>
    <div className="stats-columns"><section className="surface stats-graph"><div className="row-between"><div><h3>Solving Performance</h3><p>Actual recorded player times</p></div><span className="label-badge">{history.length?'LIVE LOCAL DATA':'NO DATA'}</span></div><PerformanceChart records={history} precision={precision}/></section><section className="surface stats-side"><div className="stats-side-icon"><Crown size={28}/></div><h3>{history.length||soloHistory.length?'Keep pushing your pace.':'Every champion starts somewhere.'}</h3><p>{history.length?`Average of 12: ${fmtAvg(ao12)}. Your results are saved in this browser. No account required.`:soloHistory.length?`Solo PB: ${soloBest===null?'—':`${formatTime(soloBest,precision)}s`}. Practice solves stay on this device and never require an account.`:'Finish your first race or solo practice solve to start building your personal record, averages and milestones.'}</p><button className="btn btn-outline" onClick={()=>goTo('race')}>Race the AI <ArrowRight size={16}/></button></section></div>
    <section className="surface solve-history-surface"><div className="row-between solve-history-head"><div><h3>Practice Solve History</h3><p>{soloHistory.length?`Your latest ${soloRecent.length} solo timer solves in a faster card view.`:'Solo timer solves will appear here after you practice.'}</p></div>{soloHistory.length>0&&<button className="btn btn-outline btn-sm" onClick={clearSoloHistory}><Trash2 size={15}/> Clear Solo History</button>}</div>
      {soloHistory.length===0 ? <div className="solve-history-empty"><Clock3 size={28}/><strong>No solo solves yet</strong><span>Open Solo Timer and finish a practice solve to start building your local history.</span></div> : <div className="solve-history-grid">{soloRecent.map((solve,index)=>{
        const official = officialSoloMs(solve)
        const isPb = official !== null && official === soloBest
        const sequence = soloHistory.length - index
        return <article key={solve.id} className={`solve-history-card${solve.penalty==='dnf'?' solve-card-dnf':''}${isPb?' solve-card-best':''}`}>
          <div className="solve-history-top"><span className="solve-history-date">{new Date(solve.createdAt).toLocaleDateString(undefined,{month:'numeric',day:'numeric'})}</span><span className="solve-history-badges">{isPb&&<em>PB</em>}{solve.penalty==='plus2'&&<em>+2</em>}{solve.penalty==='dnf'&&<em>DNF</em>}</span></div>
          <strong>{official===null?'DNF':formatTime(official,precision)}</strong>
          <div className="solve-history-meta"><span>#{sequence}</span><span>{new Date(solve.createdAt).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})}</span></div>
          <p title={solve.scramble}>{solve.scramble}</p>
        </article>
      })}</div>}
    </section>
    {history.length>0&&<section className="surface history-snippet"><div className="row-between"><div><h3>Recent Race Results</h3><p>Last {recent.length} locally recorded AI race rounds</p></div><button className="btn btn-outline btn-sm" onClick={clearHistory}><Trash2 size={15}/> Clear Race History</button></div><div className="history-table-wrap history-scroll-viewport" role="region" aria-label="Recent solves table. Scroll to view earlier rounds." tabIndex={0}><table className="history-table"><thead><tr><th>Date</th><th>AI Opponent</th><th>Player</th><th>Fastest AI</th><th>Result</th></tr></thead><tbody>{recent.map(r=><tr key={r.id}><td>{new Date(r.date).toLocaleDateString()}</td><td>{r.aiOpponents?.length?`${r.aiOpponents.length}× `:''}Sub-{r.difficulty} <span className="history-personality">{getAiPersonality(r.personality).replace(/^./,c=>c.toUpperCase())}{r.aiMethod==='cfop'?' · CFOP':r.aiSolution?' · Two-phase':' · Legacy'}</span></td><td>{formatResult(r,precision)}</td><td>{formatTime(r.aiMs,precision)}s</td><td className={r.win?'history-win':'history-loss'}>{r.aiOpponents?.length?`#${r.playerRank??playerPlacement(r.officialMs,r.aiOpponents)} of ${r.aiOpponents.length+1}`:r.win?'Win':'Loss'}</td></tr>)}</tbody></table></div></section>}
  </div>
}
