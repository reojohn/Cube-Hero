import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Gauge, Search, Sparkles, Zap } from 'lucide-react'
import { ALL_DIFFICULTIES, aiExpectedMeanMs, formatTime } from '../lib/racing'
import type { Difficulty } from '../lib/racing'

/** All 55 opponent tiers; the original six quick-selection cards remain directly below. */
export default function DifficultyDropdown({ value, onChange }:{ value:Difficulty; onChange:(value:Difficulty)=>void }) {
  const [open, setOpen]=useState(false)
  const [search, setSearch]=useState('')
  const containerRef=useRef<HTMLDivElement>(null)
  const searchRef=useRef<HTMLInputElement>(null)
  const listId='all-sub-difficulties'
  const options=ALL_DIFFICULTIES.filter(tier => !search || tier.includes(search.trim().replace(/^sub\s*[-:]?\s*/i,'')))
  useEffect(()=>{
    if(!open)return
    const onOutside=(event:PointerEvent)=>{
      if(!containerRef.current?.contains(event.target as Node))setOpen(false)
    }
    const onEscape=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();setOpen(false)}
    }
    document.addEventListener('pointerdown',onOutside)
    document.addEventListener('keydown',onEscape)
    return ()=>{document.removeEventListener('pointerdown',onOutside);document.removeEventListener('keydown',onEscape)}
  },[open])
  useEffect(()=>{if(open)searchRef.current?.focus()},[open])
  function choose(difficulty:Difficulty){onChange(difficulty);setSearch('');setOpen(false)}
  return <div className={`extended-difficulty ${open?'is-open':''}`} ref={containerRef}>
    <div className="extended-difficulty-copy">
      <div className="extended-difficulty-title"><Sparkles size={17}/> Choose any AI speed <span>55 DIFFICULTIES</span></div>
      <p>Sub-6 through Sub-60 · Find your perfect racing opponent.</p>
    </div>
    <button type="button" className="extended-difficulty-trigger" aria-expanded={open} aria-controls={listId}
      aria-label={`Choose a difficulty from Sub-6 to Sub-60. Current selection Sub-${value}`}
      onClick={()=>{setOpen(v=>!v);setSearch('')}}>
      <span className="extended-trigger-icon"><Gauge size={23}/></span>
      <span className="extended-trigger-label"><small className="extended-current-caption">CURRENT AI SPEED</small><strong>Sub-{value} <span>· ~{formatTime(aiExpectedMeanMs(value))}s average</span></strong></span>
      <span className="extended-trigger-action"><Zap size={16} fill="currentColor"/> {open?'Close levels':'CHOOSE SUB LEVEL'} <ChevronDown size={19}/></span>
    </button>
    {open&&<div className="extended-difficulty-menu" id={listId}>
      <div className="extended-menu-head"><strong>Choose AI speed</strong><span>55 levels · Sub-6 to Sub-60</span></div>
      <label className="extended-menu-search"><Search size={17}/><input ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="Search a Sub level, e.g. 35" aria-label="Search AI difficulty" inputMode="numeric"/></label>
      <div className="extended-menu-scroll">
        <div className="extended-menu-grid" role="group" aria-label="Additional AI difficulty levels">
          {options.map(tier=><button type="button" key={tier} className={`extended-menu-option ${tier===value?'is-selected':''}`}
            aria-pressed={tier===value} onClick={()=>choose(tier)}>
            <span>Sub-{tier}</span><small>~{formatTime(aiExpectedMeanMs(tier))}s</small>
            {tier===value&&<Check size={13} className="extended-menu-check"/>}
          </button>)}
        </div>
        {!options.length&&<div className="extended-empty">No match. Choose a number between 6 and 60.</div>}
      </div>
      <div className="extended-menu-foot">All tiers use the same Casual, Balanced, and Competitive AI timing styles.</div>
    </div>}
  </div>
}
