import PlayerAvatar from './PlayerAvatar'
import { ArrowRight, BarChart3, BrainCircuit, CheckCircle2, CircleHelp, Flag, Layers3, RotateCcw, ShieldCheck, Trophy } from 'lucide-react'
import AiSolveReplay from './AiSolveReplay'
import RivalMiniPortrait from './RivalMiniPortrait'
import { calculateAverage, formatResult, formatTime, getAiPersonality, rankedFinishers, playerPlacement, RACE_COUNT } from '../lib/racing'
import type { RaceSession } from '../lib/racing'
import { AI_RIVALS, getRival } from '../lib/rivals'
import { CFOP_LABELS } from '../lib/cfop'

type Props={playerName?:string;session:RaceSession|null;goTo:(page:'race'|'statistics')=>void;nextRound:()=>void;raceAgain:()=>void;precision:2|3}
const STAGE_SHARE=[.16,.48,.17,.19]
const PHASES=[['Opening','#3f80ff'],['Middle','#00b69a'],['Late moves','#b45df5'],['Finish','#ffb11e']] as const
const CFOP_PHASES=[['Cross','#3f80ff'],['F2L','#00b69a'],['OLL','#b45df5'],['PLL','#ffb11e']] as const
const LEGACY_PHASES=[['Cross','#3f80ff'],['F2L','#00b69a'],['OLL','#b45df5'],['PLL','#ffb11e']] as const
export default function RaceResults({session,goTo,nextRound,raceAgain,precision,playerName='Guest Cuber'}:Props){
  const latest=session?.records.at(-1)
  const personality=getAiPersonality(latest?.personality??session?.settings.personality)
  const personalityName=personality.charAt(0).toUpperCase()+personality.slice(1)
  if(!session||!latest)return <div className="page-stack"><section className="surface empty-results"><Trophy size={36}/><h2>No finished race yet</h2><p>Complete a race to see real results here.</p><button className="btn btn-primary" onClick={()=>goTo('race')}><Flag size={17}/> Set up a Race</button></section></div>
  const opponents=latest.aiOpponents?.length?latest.aiOpponents:[{id:'AI 1',ms:latest.aiMs}]
  const multi=opponents.length>1
  const standings=rankedFinishers(latest.officialMs,opponents)
  const playerRank=latest.playerRank??playerPlacement(latest.officialMs,opponents)
  const leader=opponents.reduce((best,item)=>item.ms<best.ms?item:best,opponents[0])
  const roundCount=RACE_COUNT[session.settings.raceLength]
  const finished=session.records.length>=roundCount
  const wins=session.records.filter(r=>r.win).length
  const ties=session.records.filter(r=>r.officialMs!==null&&r.officialMs===r.aiMs).length
  const losses=session.records.length-wins-ties
  const tie=latest.officialMs!==null&&latest.officialMs===latest.aiMs
  const playerWin=latest.win
  const diff=latest.officialMs===null?null:Math.abs(latest.officialMs-latest.aiMs)
  const seriesAverage=finished&&roundCount>=5?calculateAverage(session.records):undefined
  const hasVerifiedSolution=Boolean(latest.aiSolution && latest.aiMoveCount)
  const verifiedCFOP=latest.aiMethod==='cfop'&&latest.aiCfopStages?.length===7
  const featured=getRival(session.settings.difficulty)
  const division=AI_RIVALS.filter(candidate=>candidate.division===featured.division)
  const first=Math.max(0,division.findIndex(candidate=>candidate.difficulty===featured.difficulty))
  const rivalLineup=Array.from({length:opponents.length},(_,index)=>division[(first+index)%division.length]??featured)
  const rivalById=new Map<string,(typeof rivalLineup)[number]>(rivalLineup.map((rival,index)=>[`AI ${index+1}`,rival]))
  const leaderRival=rivalById.get(leader.id)
  const stageTimes=hasVerifiedSolution&&latest.aiSegmentsMs?.length===4?latest.aiSegmentsMs:[...STAGE_SHARE.map(x=>Math.round(latest.aiMs*x))]
  if(!hasVerifiedSolution)stageTimes[3]=latest.aiMs-stageTimes.slice(0,3).reduce((a,b)=>a+b,0)
  const stages=hasVerifiedSolution?stageTimes.map(ms=>ms/latest.aiMs):STAGE_SHARE
  const segmentNames=verifiedCFOP?CFOP_PHASES:hasVerifiedSolution?PHASES:LEGACY_PHASES
  return <div className="page-stack narrow-stack phase2-results phase3-results"><div className="page-heading"><div><div className="eyebrow">RACE COMPLETE · ROUND {latest.round} OF {roundCount}</div><h1>Race Result</h1><p>Sub-{latest.difficulty} · {personalityName} · {opponents.length} AI rival{opponents.length===1?'':'s'} · {verifiedCFOP?'Verified CFOP solve':'Recorded race results'}</p></div><span className="label-badge"><CheckCircle2 size={14}/> RECORDED LOCALLY</span></div>
    <div className={`result-banner ${!playerWin?'result-loss':''}`}><span className="win-trophy"><Trophy size={38}/></span><div><h2>{multi?(latest.officialMs===null?'DNF — Tournament Finished':playerWin?'Tournament Champion!':`You Placed #${playerRank} of ${opponents.length+1}`):tie?"It's a Tie!":playerWin?'You Win!':latest.officialMs===null?'DNF — AI Wins':'AI Wins This Round'}</h2><p>{multi?(latest.officialMs===null?`Your inspection was a DNF. All ${opponents.length} AI racers finished the shared scramble.`:playerWin?`You finished ahead of all ${opponents.length} AI opponents!`:`${opponents.filter(o=>o.ms<latest.officialMs!).length} AI rival(s) finished ahead of you. Fastest: ${leader.id} at ${formatTime(leader.ms,precision)}s.`):diff===null?'Inspection exceeded 17 seconds. This round was recorded as DNF.':tie?'Both racers finished at the same recorded time.':`${playerWin?'You were':'The AI was'} ${formatTime(diff,precision)} seconds faster.`}</p></div><div className="result-decoration">✦</div></div>
    <div className="result-layout"><div className="result-main"><div className="result-timers"><section className="surface result-user"><span><PlayerAvatar className="cube-player-avatar--inline" decorative/> YOU</span><strong>{formatTime(latest.officialMs,precision)}<span>{latest.officialMs===null?'':'s'}</span></strong><small>{latest.penalty==='plus2'?`Raw: ${formatTime(latest.playerMs,precision)}s · +2 inspection` : latest.penalty==='dnf'?'Inspection DNF': 'Your recorded solve'}</small></section><section className="surface result-ai"><span>{leaderRival?<RivalMiniPortrait rival={leaderRival} className="result-ai-avatar"/>:<BrainCircuit size={19}/>} {multi?`${leader.id} · FASTEST AI`:`AI · Sub-${latest.difficulty} · ${personalityName}`}</span><strong>{formatTime(latest.aiMs,precision)}<span>s</span></strong><small>{multi?`Quickest of ${opponents.length} AI opponents`:verifiedCFOP?'Verified CFOP solution':hasVerifiedSolution?'Verified two-phase solution':'Legacy sampled AI time'}</small></section></div>
      <section className="surface session-progress"><div className="row-between"><div><strong>{finished?'Session finished':'Session progress'}</strong><p>{session.records.length} of {roundCount} rounds completed</p></div><span className="level-pill mini">{wins}W · {losses}L{ties>0?` · ${ties}T`:''}</span></div>{roundCount>1&&<div className="round-pips">{Array.from({length:roundCount},(_,i)=><span key={i} className={i<session.records.length?(session.records[i].win?'round-win':'round-loss'):''} title={`Round ${i+1}`}/>)}</div>}{finished&&seriesAverage!==undefined&&<p className="session-average">Your {roundCount}-round trimmed average: <strong>{formatTime(seriesAverage,precision)}{seriesAverage===null?'':'s'}</strong></p>}</section>
      <div className="result-actions">{!finished?<button className="btn btn-primary" onClick={nextRound}><ArrowRight size={17}/> Next Scramble · Round {latest.round+1}</button>:<button className="btn btn-primary" onClick={raceAgain}><RotateCcw size={17}/> Race Again</button>}<button className="btn btn-outline" onClick={()=>goTo('statistics')}><BarChart3 size={17}/> Statistics</button><button className="btn btn-outline" onClick={()=>goTo('race')}><Flag size={17}/> Race Setup</button></div></div>
      {session.settings.breakdown&&<section className="surface breakdown"><div className="row-between"><strong><Layers3 size={17}/> {verifiedCFOP?'Verified CFOP Stages':hasVerifiedSolution?'AI Move Execution':'Estimated AI Pace'}</strong><CircleHelp size={16} color="#9199b8"/></div><div className="breakdown-bar">{segmentNames.map(([label,color],i)=><i key={label} style={{flex:stages[i],background:color}}/>)}</div>{segmentNames.map(([name,color],i)=><div className="breakdown-row" key={name}><span><i style={{background:color}}/>{name}</span><strong>{formatTime(stageTimes[i],precision)}s</strong></div>)}<div className="breakdown-total"><strong>Total</strong><strong>{formatTime(latest.aiMs,precision)}s</strong></div><div className="breakdown-caption">{verifiedCFOP?'Cross, F2L, OLL and PLL boundaries come from the verified CFOP solution. Turn cadence is still simulated for the selected personality.':hasVerifiedSolution?'Earlier two-phase race: four illustrative execution intervals, not CFOP stages.':'Earlier Phase 2 result: illustrative time allocation, not a computed solution.'}</div></section>}
    </div>
    {multi&&<section className="surface multi-ai-results" aria-label="Tournament final standings"><div className="multi-ai-results-head"><div><span className="multi-ai-live-eyebrow">FINAL STANDINGS · SHARED SCRAMBLE</span><h3><Trophy size={21}/> Race Leaderboard</h3><p>{opponents.length+1} racers · Your final position: <strong>#{playerRank}</strong></p></div><span className="label-badge">{opponents.length} AI RIVALS</span></div><div className="multi-ai-results-list">{standings.map(({id,ms,place})=>{
      const rival=id==='YOU'?null:rivalById.get(id)
      return <div key={id} className={`multi-ai-place ${id==='YOU'?'is-player':''} ${place===1?'first-place':''}`}><span className="multi-ai-place-number">#{place}</span><span className="multi-ai-place-icon">{id==='YOU'?<PlayerAvatar className="cube-player-avatar--compact" decorative/>:rival?<RivalMiniPortrait rival={rival}/>:<BrainCircuit size={18}/>}</span><span className="multi-ai-place-name"><strong>{id==='YOU'?`YOU · ${playerName}`:id}</strong>{rival&&<small>{rival.name}</small>}</span><span className="multi-ai-place-time">{ms===null?'DNF':`${formatTime(ms,precision)}s`}</span>{place===1&&<Trophy size={18} className="multi-ai-trophy"/>}</div>
    })}</div></section>}
    {hasVerifiedSolution&&<section className="surface solver-result"><div className="row-between"><strong><ShieldCheck size={17}/> {multi?'Fastest AI · Verified CFOP solution':'Actual verified AI solution'}</strong><span className="label-badge">{latest.aiMoveCount} moves · {latest.aiQtm} quarter-turns</span></div><p>{verifiedCFOP?'The AI solved this exact scramble with verified Cross, four F2L pairs, OLL and PLL. Its timing remains a simulated human-like pace.':'Historical solve recorded with the two-phase algorithm (before the CFOP update).'}</p>{verifiedCFOP&&<div className="cfop-solution-steps" aria-label="Verified CFOP step-by-step algorithms">{latest.aiCfopStages!.map((step,index)=><div className="cfop-step" key={`${step.id}-${index}`}><span className="cfop-step-number">{String(index+1).padStart(2,'0')}</span><div><strong>{CFOP_LABELS[step.id]}</strong><code>{step.moves||'Already solved — no turns needed'}</code></div></div>)}</div>}<div className="solution-alg">{latest.aiSolution}</div><div className="solution-scramble"><strong>Scramble used:</strong> {latest.scramble}</div><AiSolveReplay key={latest.id} record={{...latest,aiSolution:latest.aiSolution!}} /></section>}
    <section className="surface history-snippet"><strong><Flag size={17}/> This session's rounds</strong><div className="history-table-wrap"><table className="history-table"><thead><tr><th>Round</th><th>You</th><th>Fastest AI</th><th>Result</th></tr></thead><tbody>{session.records.map(r=><tr key={r.id}><td>#{r.round}</td><td>{formatResult(r,precision)}</td><td>{formatTime(r.aiMs,precision)}s</td><td className={r.win?'history-win':'history-loss'}>{r.aiOpponents?.length?`#${r.playerRank??playerPlacement(r.officialMs,r.aiOpponents)} of ${r.aiOpponents.length+1}`:r.win?'You':'AI'}</td></tr>)}</tbody></table></div></section>
  </div>
}
