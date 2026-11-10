import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { ArrowRight, Check, ChevronLeft, ChevronRight, Crown, Gauge, Search, Shield, Sparkles, Swords, Target, Trophy, Users, X, Zap } from 'lucide-react'
import type { Difficulty, AiPersonality } from '../lib/racing'
import { aiExpectedMeanMs, formatTime } from '../lib/racing'
import { AI_RIVALS, getRival, RIVAL_DIVISIONS, searchRivals } from '../lib/rivals'
import type { RivalDivision, RivalProfile } from '../lib/rivals'
import RivalPortrait from './RivalPortrait'
import { ART_MOTIFS, getRivalArtDNA } from './RivalAvatar'
import { getRivalPortraitTheme, getRivalPortraitUrl, prewarmRivalPortraits, RIVAL_PORTRAIT_MOTIFS } from '../lib/rivalPortraits'
import './RivalSelect.css'

const FAVORITES:Difficulty[]=['20','15','12','10','8','6']
const DIVISION_ICONS = {Legend:Crown,Master:Trophy,Expert:Zap,Challenger:Swords,Rising:Shield}
const PERSONALITY_NAMES:Record<AiPersonality,string>={casual:'Casual',balanced:'Balanced',competitive:'Competitive'}

/** Approved raster portraits for all 55 rivals, with original vector fallback. */
export function RivalEmblem({rival,large=false}:{rival:RivalProfile;large?:boolean}) {
  return <RivalPortrait rival={rival} large={large}/>
}

/** Only the previously selected and newly selected cards need React updates.
 *  Static art and decorations should not rerender 55 times on every pick.
 */
const RivalRosterCard = memo(function RivalRosterCard({
  rival, active, onSelect,
}: { rival:RivalProfile; active:boolean; onSelect:(difficulty:Difficulty)=>void }) {
  const theme=useMemo(()=>getRivalPortraitTheme(rival.difficulty,rival.accent,rival.glow) as CSSProperties,[rival])
  return <button type="button" className={`rival-roster-card ${active?'active':''}`}
    aria-pressed={active} aria-label={`${rival.name}, Sub-${rival.difficulty}, ${rival.division} division`}
    onClick={()=>onSelect(rival.difficulty)} style={theme}>
    <span className="rival-roster-portrait"><RivalEmblem rival={rival}/></span>
    <span className="rival-roster-name">{rival.name}</span><small>SUB-{rival.difficulty}</small>
    {active&&<span className="rival-roster-selected"><Check size={11}/></span>}
  </button>
})

export default function RivalSelect({value,personality,onChange}:{value:Difficulty;personality:AiPersonality;onChange:(difficulty:Difficulty)=>void}){
  const [division,setDivision]=useState<RivalDivision|'All'>('All')
  const [query,setQuery]=useState('')
  const searchInput=useRef<HTMLInputElement>(null)
  const onChangeRef=useRef(onChange)
  onChangeRef.current=onChange
  const onSelect=useCallback((difficulty:Difficulty)=>onChangeRef.current(difficulty),[])
  const selected=getRival(value)
  // Prewarm approved portraits when Race AI opens or selection changes.
  // Browser caching makes repeated character previews feel instant.
  useEffect(() => { prewarmRivalPortraits(value) }, [value])
  const rivals=useMemo(()=>searchRivals(query,division),[query,division])
  const selectedIndex=AI_RIVALS.findIndex(r=>r.difficulty===value)
  const PrevNext=(direction:-1|1)=>{
    const next=Math.max(0,Math.min(AI_RIVALS.length-1,selectedIndex+direction))
    onChange(AI_RIVALS[next].difficulty)
  }
  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape'&&document.activeElement===searchInput.current)searchInput.current?.blur()
    }
    window.addEventListener('keydown',onKey)
    return()=>window.removeEventListener('keydown',onKey)
  },[])
  const DivisionIcon=DIVISION_ICONS[selected.division]
  const selectedHasPortrait=Boolean(getRivalPortraitUrl(selected.difficulty))
  return <section className="rival-select" aria-label="Choose your AI rival character">
    <div className="rival-select-heading"><div><div className="rival-eyebrow"><Sparkles size={14}/> CUBE HERO · RIVAL SELECT <span>55 DISTINCT RIVALS</span></div><h3>Choose your <em>challenger.</em></h3><p>Choose your rival from 55 speed tiers, each with a signature look.</p></div><span className="rival-phase-tag">PREMIUM RIVAL ROSTER</span></div>
    <div className="rival-select-stage">
      <div className="rival-roster-panel">
        <div className="rival-panel-heading"><span><Users size={16}/> RIVAL ROSTER</span><strong>{rivals.length} / 55</strong></div>
        <div className="rival-search"><Search size={17}/><input type="search" ref={searchInput} placeholder="Search name or Sub level..." aria-label="Search rival names and difficulty levels" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button type="button" onClick={()=>{setQuery('');searchInput.current?.focus()}} aria-label="Clear rival search"><X size={15}/></button>}</div>
        <div className="rival-division-filter" role="group" aria-label="Filter rival divisions">
          {(['All',...RIVAL_DIVISIONS] as const).map(t=><button type="button" key={t} aria-pressed={division===t} className={division===t?'active':''} onClick={()=>setDivision(t)}>{t==='All'?'All 55':t}</button>)}
        </div>
        <div className="rival-roster-scroll" tabIndex={0} aria-label="Scrollable AI rival roster"><div className="rival-roster-grid">
          {rivals.map(rival=><RivalRosterCard key={rival.difficulty} rival={rival} active={rival.difficulty===value} onSelect={onSelect}/>)}
        </div>{rivals.length===0&&<div className="rival-roster-empty">No rival found. Try a name or a Sub level between 6 and 60.</div>}</div>
        <div className="rival-quick-picks"><span>QUICK PICKS</span><div role="group" aria-label="Popular rival shortcuts">{FAVORITES.map(difficulty=><button type="button" key={difficulty} aria-pressed={value===difficulty} className={value===difficulty?'active':''} onClick={()=>{setDivision('All');setQuery('');onChange(difficulty)}}>{getRival(difficulty).name}<small>Sub-{difficulty}</small></button>)}</div></div>
      </div>
      <div className="rival-preview" aria-live="polite" style={getRivalPortraitTheme(selected.difficulty,selected.accent,selected.glow) as CSSProperties}>
        <div className="rival-preview-top"><span><DivisionIcon size={15}/> {selected.division.toUpperCase()} DIVISION</span><span className="rival-preview-count">{String(selectedIndex+1).padStart(2,'0')} / 55</span></div>
        <div className={`rival-preview-art ${selectedHasPortrait ? 'rival-preview-art--png' : ''}`} key={selected.difficulty}>
          <span className="rival-preview-orbit" aria-hidden="true"/>
          <span className="rival-preview-orbit-secondary" aria-hidden="true"/>
          <span className="rival-preview-halo" aria-hidden="true"/>
          <span className="rival-preview-rune rival-preview-rune-a" aria-hidden="true">✦</span>
          <span className="rival-preview-rune rival-preview-rune-b" aria-hidden="true">✧</span>
          <span className="rival-preview-rune rival-preview-rune-c" aria-hidden="true">✦</span>
          <span className="rival-preview-stage-light" aria-hidden="true"/>
          <RivalEmblem rival={selected} large/>
        </div>
        <div className="rival-preview-details"><span className="rival-preview-eyebrow">YOUR SELECTED CHALLENGER</span><h3>{selected.name}</h3><p className="rival-preview-title">{selected.title}</p>
          <div className="rival-preview-traits" aria-label="Character identity">
            <span><Sparkles size={11}/> {RIVAL_PORTRAIT_MOTIFS[selected.difficulty] ?? ART_MOTIFS[getRivalArtDNA(selected).silhouette]} CREST</span>
            <span>{selected.division.toUpperCase()} CLASS</span>
          </div>
          <p className="rival-preview-motto">“{selected.motto}”</p>
          <div className="rival-stats"><div><small>DIFFICULTY</small><strong>Sub-{selected.difficulty}</strong></div><div><small>AVERAGE PACE</small><strong>~{formatTime(aiExpectedMeanMs(value,personality))}s</strong></div><div><small>RACE STYLE</small><strong>{PERSONALITY_NAMES[personality]}</strong></div></div>
          <p className="rival-preview-hint"><Target size={14}/>{selected.blurb} Playstyle is adjustable below; names do not change the CFOP solver.</p>
          <div className="rival-preview-bottom"><button type="button" aria-label="Previous rival" disabled={selectedIndex===0} onClick={()=>PrevNext(-1)}><ChevronLeft size={17}/></button><span><Check size={14}/> RIVAL SELECTED</span><button type="button" aria-label="Next rival" disabled={selectedIndex===AI_RIVALS.length-1} onClick={()=>PrevNext(1)}><ChevronRight size={17}/></button></div>
        </div>
      </div>
    </div>
    <div className="rival-select-foot"><span><Gauge size={15}/> Sub-6 to Sub-60 · 55 speed tiers</span><span><ArrowRight size={14}/> Select a rival, customize their style below, then start your race.</span></div>
  </section>
}
