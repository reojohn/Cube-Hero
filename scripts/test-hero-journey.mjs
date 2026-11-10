import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {pathToFileURL} from 'node:url'
import ts from 'typescript'
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'cubehero-journey-test-'))
try {
  for(const name of ['racing','heroJourney']){
    let code=ts.transpileModule(fs.readFileSync(`src/lib/${name}.ts`,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
    code=code.replace(/from ['"]\.\/([^'".]+)['"]/g,(_,name)=>`from './${name}.mjs'`)
    fs.writeFileSync(path.join(temp,`${name}.mjs`),code)
  }
  const mod=await import(pathToFileURL(path.join(temp,'heroJourney.mjs')).href)
  const now=new Date('2026-11-08T12:00:00')
  const date=now.toISOString()
  const blankAcademy={completed:[],favorites:[],masteredCases:[],notationTurns:0,lastModule:'notation'}
  const ghost={qualifications:[],duels:[]}
  const record=(n,ms=15000,aiMs=18000)=>({id:`race-${n}`,sessionId:'session-1',round:n,date, difficulty:'15',personality:'balanced',scramble:'R U F',playerMs:ms,penalty:'none',officialMs:ms,aiMs,win:ms<aiMs,aiOpponents:[{id:'AI 1',ms:aiMs},{id:'AI 2',ms:20000}],playerRank:1})
  const history=[record(1),record(2),record(3)]
  let s=mod.syncJourney(mod.blankJourney(),history,ghost,blankAcademy,now)
  assert.equal(s.events.filter(e=>e.kind==='ai').length,3)
  const initialMissions=mod.makeMissions(s,now)
  assert.equal(initialMissions.length,20,'10 daily and 10 weekly challenges')
  assert.equal(initialMissions.filter(m=>m.period==='daily').length,10)
  assert.equal(initialMissions.filter(m=>m.period==='weekly').length,10)
  assert.equal(new Set(initialMissions.map(m=>m.id)).size,20)
  assert.deepEqual(mod.makeMissions(s,now),initialMissions,'Mission selection survives a refresh')
  assert.ok(initialMissions.some(m=>m.progress>0),'Mission progress must use real race records')
  assert.ok(initialMissions.some(m=>m.completed),'Some applicable challenges should complete')
  const tomorrow=new Date(now);tomorrow.setDate(tomorrow.getDate()+1)
  const monday=new Date(now);monday.setDate(monday.getDate()+1) // Nov 8 2026 = Sunday
  const tmrMissions=mod.makeMissions(s,tomorrow)
  const ids=(missions,period)=>new Set(missions.filter(m=>m.period===period).map(m=>m.id))
  assert.equal([...ids(initialMissions,'daily')].filter(id=>ids(tmrMissions,'daily').has(id)).length,0,'No daily challenges repeat on consecutive days')
  assert.equal([...ids(initialMissions,'weekly')].filter(id=>ids(tmrMissions,'weekly').has(id)).length,0,'No weekly challenges repeat on consecutive Mondays')
  const tuesday=new Date(now);tuesday.setDate(tuesday.getDate()+2)
  const tueMissions=mod.makeMissions(s,tuesday)
  assert.equal([...ids(tmrMissions,'weekly')].filter(id=>ids(tueMissions,'weekly').has(id)).length,10,'Weekly lineup stays fixed through the week')
  assert.equal([...ids(tmrMissions,'daily')].filter(id=>ids(tueMissions,'daily').has(id)).length,0,'Daily lineup changes again on Tuesday')
  for(let i=0;i<16;i++){
    const date=new Date(now);date.setDate(date.getDate()+i)
    const missions=mod.makeMissions(s,date)
    assert.equal(missions.length,20)
    assert.ok(missions.every(m=>m.target>0&&m.reward>0&&m.progress<=m.target))
    assert.ok(missions.every(m=>m.category))
    if(i>0){const prior=new Date(date);prior.setDate(prior.getDate()-1)
      const prev=mod.makeMissions(s,prior)
      assert.equal([...ids(missions,'daily')].filter(id=>ids(prev,'daily').has(id)).length,0)
    }
  }
  for(let i=0;i<14;i++){
    const date=new Date(now);date.setDate(date.getDate()+7*i)
    const nextWeek=new Date(date);nextWeek.setDate(nextWeek.getDate()+7)
    const weeklyCurrent=ids(mod.makeMissions(s,date),'weekly')
    const weeklyNext=ids(mod.makeMissions(s,nextWeek),'weekly')
    assert.equal([...weeklyCurrent].filter(id=>weeklyNext.has(id)).length,0,'No weekly mission repeats in adjacent weeks')
  }
  const endOfSunday=new Date('2026-11-08T23:59:59')
  const startOfMonday=new Date('2026-11-09T00:00:01')
  assert.equal(mod.dayKey(endOfSunday),'2026-11-08')
  assert.equal(mod.dayKey(startOfMonday),'2026-11-09')
  assert.notEqual(mod.weekKey(endOfSunday),mod.weekKey(startOfMonday),'Monday begins a new weekly challenge period')
  assert.equal(mod.makeMissions(s,startOfMonday).filter(m=>m.progress>0).length,0,'Old-period activity must not progress new-period missions')
  assert.equal([...ids(mod.makeMissions(s,endOfSunday),'daily')].filter(id=>ids(mod.makeMissions(s,startOfMonday),'daily').has(id)).length,0)
  assert.deepEqual(ids(mod.makeMissions(s,now),'daily'),ids(mod.makeMissions({...s,events:[...s.events,{id:'ai:new',kind:'ai',date,xp:22,valid:true,win:false,ms:21000}]},now),'daily'),'Progress changes must not reroll a period')
  const grantedMissions=s.events.filter(e=>e.kind==='mission')
  assert.equal(grantedMissions.length,initialMissions.filter(m=>m.completed).length,'Rewards granted for genuinely completed selected missions')
  assert.ok(grantedMissions.every(e=>initialMissions.some(m=>e.id===`mission:${m.key}:${m.id}`&&m.completed)))
  const noFarm=mod.syncJourney(s,history,ghost,blankAcademy,now)
  assert.equal(noFarm,s,'All earned missions must remain one-time awards')
  assert.equal(mod.syncJourney(s,history,ghost,blankAcademy,now),s,'No double XP on a second sync')
  assert.equal(new Set(s.events.map(x=>x.id)).size,s.events.length)
  assert.ok(mod.levelInfo(mod.journeyMetrics(s).xp).level>=1)
  assert.equal(mod.achievements(s).find(a=>a.id==='first-victory').unlocked,true)
  assert.equal(mod.achievements(s).find(a=>a.id==='sub15').unlocked,false)

  const completed={...blankAcademy,completed:['notation','cross','f2l','oll','pll','finger'],masteredCases:['cross-edge','cross-r2','cross-l2','cross-b2','cross-cross']}
  s=mod.syncJourney(s,history,ghost,completed,now)
  assert.equal(mod.achievements(s).find(a=>a.id==='cross-master').unlocked,true)
  assert.equal(mod.achievements(s).find(a=>a.id==='academy-graduate').unlocked,true)
  const savedXp=mod.journeyMetrics(s).xp
  s=mod.syncJourney(s,history,ghost,{...blankAcademy,completed:[],masteredCases:[]},now)
  assert.equal(mod.journeyMetrics(s).xp,savedXp,'Removing and re-adding lessons must not farm XP')

  const gh={...ghost,qualifications:[],duels:[{id:'duel-1',date,mode:'ghost',scramble:'U R',rawMs:13500,penalty:'none',officialMs:13500,opponentMs:14000}]}
  s=mod.syncJourney(s,history,gh,blankAcademy,now)
  assert.equal(mod.achievements(s).find(a=>a.id==='ghost-winner').unlocked,true)
  assert.equal(mod.streakInfo(s,now).streak,1)
  const dayBefore=new Date(now);dayBefore.setDate(dayBefore.getDate()-1)
  const earlier={...record('yesterday',29000,31000),date:dayBefore.toISOString()}
  s=mod.syncJourney(s,[...history,earlier],gh,blankAcademy,now)
  assert.equal(mod.streakInfo(s,now).streak,2)

  const t={id:'tour-1',sessionId:'championship',createdAt:date,status:'active',difficulty:'15',personality:'balanced',aiCount:2,roundsTarget:5,records:[]}
  s=mod.startTournament(s,t)
  for(let i=1;i<=5;i++){
    const r={...record(`t${i}`,12000,14500),sessionId:'championship',round:i,date,aiOpponents:[{id:'AI 1',ms:14500},{id:'AI 2',ms:17000}]}
    s=mod.recordTournamentRound(s,r)
    assert.equal(s.tournaments.at(-1).records.length,i)
    assert.equal(s.tournaments.at(-1).status,i===5?'finished':'active')
    const unchanged=mod.recordTournamentRound(s,r)
    assert.equal(unchanged,s,'Duplicate tournament records are ignored')
  }
  const standings=mod.tournamentStandings(s.tournaments.at(-1))
  assert.equal(standings[0].id,'YOU')
  assert.equal(standings[0].points,15)
  assert.equal(standings.length,3)
  s=mod.syncJourney(s,[...history,earlier],gh,blankAcademy,now)
  assert.equal(mod.achievements(s).find(a=>a.id==='champion').unlocked,true)
  const beforeSecondSync=mod.journeyMetrics(s).xp
  s=mod.syncJourney(s,[...history,earlier],gh,blankAcademy,now)
  assert.equal(mod.journeyMetrics(s).xp,beforeSecondSync)
  const rankRecords=Array.from({length:12},(_,i)=>record(`fast-${i}`,19000,23000))
  const ranked=mod.syncJourney(mod.blankJourney(),rankRecords,ghost,blankAcademy,now)
  assert.equal(mod.journeyMetrics(ranked).rank.name,'Platinum')
  assert.equal(mod.parseJourney({events:[s.events[0],s.events[0]],tournaments:[]}).events.length,1)
  const next=mod.startTournament(s,{...t,id:'tour-2',sessionId:'new-session'})
  assert.equal(next.tournaments.at(-2).status,'finished')
  assert.equal(mod.activeTournament(next)?.id,'tour-2')
  // Version 2 collection: 30 genuine, non-repeatable badges without changing saved Journey data.
  const allBadges=mod.achievements(s)
  assert.equal(allBadges.length,30,'Hero Journey must display exactly 30 achievements')
  assert.equal(new Set(allBadges.map(b=>b.id)).size,30,'All badge IDs must be unique')
  const originalIds=['first-solve','first-victory','sub20','sub15','sub10','ghost-unlocked','ghost-winner','ten-ghost-wins','cross-master','academy-graduate','case-collector','first-tournament','champion']
  for(const id of originalIds)assert.ok(allBadges.some(b=>b.id===id),`Existing achievement ${id} must be preserved`)
  assert.deepEqual(new Set(allBadges.map(b=>b.category)),new Set(['solves','speed','ai','ghost','academy','practice','tournament']))
  for(const badge of allBadges){
    assert.ok(badge.target>=1&&badge.progress>=0&&badge.progress<=badge.target)
    assert.equal(badge.unlocked,badge.progress>=badge.target)
    assert.ok(badge.description.length>10)
  }
  const byId=(state,id)=>mod.achievements(state).find(b=>b.id===id)
  const empty=mod.blankJourney()
  assert.equal(byId(empty,'first-solve').unlocked,false)
  assert.equal(byId(empty,'seven-day-streak').progress,0)
  assert.equal(byId(empty,'hundred-solves').target,100)
  const validTimes=Array.from({length:100},(_,i)=>({id:`ai:sample-${i}`,kind:'ai',date:new Date(2026,9,1).toISOString(),xp:22,valid:true,win:i<25,ms:i<5?19000:26000}))
  const hundred={events:validTimes,tournaments:[]}
  for(const id of ['ten-solves','fifty-solves','hundred-solves','sub30','sub20','sub20-five','five-ai-wins','twentyfive-ai-wins'])assert.equal(byId(hundred,id).unlocked,true,id)
  assert.equal(byId(hundred,'sub15').unlocked,false)
  assert.equal(byId(hundred,'sub12').unlocked,false)
  // Invalid DNFs do not count as solves, wins or speed records.
  const invalid={events:[{id:'ai:dnf',kind:'ai',date,xp:0,valid:false,win:true,ms:9000}],tournaments:[]}
  assert.equal(byId(invalid,'first-solve').unlocked,false)
  assert.equal(byId(invalid,'first-victory').unlocked,false)
  assert.equal(byId(invalid,'sub10').unlocked,false)
  const duels={events:Array.from({length:5},(_,i)=>({id:`ghost:duel-${i}`,kind:'ghost',date,xp:40,valid:true,win:true,ms:12000,category:'ghost'})),tournaments:[]}
  assert.equal(byId(duels,'first-ghost-duel').unlocked,true)
  assert.equal(byId(duels,'five-ghost-wins').unlocked,true)
  assert.equal(byId(duels,'ten-ghost-wins').unlocked,false)
  const learned={events:[...['f2l','oll','pll'].flatMap(kind=>Array.from({length:10},(_,i)=>({id:`case:${kind}-${i}`,kind:'case',date,xp:10,category:kind})))],tournaments:[]}
  for(const id of ['case-collector','f2l-scholar','oll-explorer','pll-strategist'])assert.equal(byId(learned,id).unlocked,true,id)
  assert.equal(byId(learned,'case-veteran').unlocked,false)
  const calendarDays=Array.from({length:7},(_,i)=>({id:`ai:streak-${i}`,kind:'ai',date:new Date(2026,9,i+1,12).toISOString(),xp:22,valid:true,ms:30000}))
  const streakState={events:calendarDays,tournaments:[]}
  assert.equal(mod.longestPracticeStreak(streakState),7)
  assert.equal(byId(streakState,'seven-day-streak').unlocked,true)
  assert.equal(byId(streakState,'seven-day-streak').unlocked,byId({...streakState,events:[...calendarDays,{id:'ai:late',kind:'ai',date:new Date(2026,10,1,12).toISOString(),xp:22,valid:true,ms:30000}]},'seven-day-streak').unlocked,'Historical streak badge remains earned after a break')
  assert.equal(mod.longestPracticeStreak({events:calendarDays.filter((_,i)=>i!==3),tournaments:[]}),3,'A missed day must break the longest run')
  const tournamentsOnly={events:Array.from({length:3},(_,i)=>({id:`tournament:t-${i}`,kind:'tournament',date,xp:130,valid:true,win:i===1})),tournaments:[]}
  assert.equal(byId(tournamentsOnly,'three-tournaments').unlocked,true)
  assert.equal(byId(tournamentsOnly,'champion').unlocked,true)
  assert.equal(mod.journeyMetrics(s).xp,beforeSecondSync,'New badge collection must not mint extra XP')

  console.log('Hero Journey: XP dedupe, missions, achievements, streak, 30 badges, rank, tournament scoring, resuming: PASSED')
} finally {fs.rmSync(temp,{recursive:true,force:true})}
