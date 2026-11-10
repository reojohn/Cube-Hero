import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { Check, ChevronDown, Gauge, Search, SlidersHorizontal, Sparkles, Swords, Zap } from 'lucide-react'
import './JourneyPicker.css'

type Option = { value: string; label: string; description: string }
type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  options: Option[]
  variant: 'difficulty' | 'personality'
}

const FAVORITES = ['6', '10', '12', '15', '20', '30']

/** Tournament-only custom picker. Value is controlled by HeroJourney, so race settings never change on open/close. */
export default function JourneySelect({ label, value, onChange, options, variant }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [upward, setUpward] = useState(false)
  const [maxMenuHeight, setMaxMenuHeight] = useState(330)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const scrollHighlightRef = useRef(true)
  const id = useId().replace(/:/g, '')
  const selected = options.find(option => option.value === value) ?? options[0]
  const filtered = variant === 'difficulty' && search.trim()
    ? options.filter(option => `${option.label} ${option.description}`.toLowerCase().includes(search.trim().toLowerCase()))
    : options
  const displayedIndex = Math.min(focusedIndex, Math.max(0, filtered.length - 1))

  function openMenu() {
    if (open) { setOpen(false); return }
    const rect = triggerRef.current?.getBoundingClientRect()
    const below = rect ? window.innerHeight - rect.bottom : 400
    const above = rect ? rect.top : 400
    const flip = below < (variant === 'difficulty' ? 310 : 240) && above > below
    const available = flip ? above : below
    setUpward(flip)
    setMaxMenuHeight(Math.max(175, Math.min(variant === 'difficulty' ? 362 : 260, available - 19)))
    setSearch('')
    scrollHighlightRef.current = true
    setFocusedIndex(Math.max(0, options.findIndex(option => option.value === value)))
    setOpen(true)
  }

  function closeMenu(restoreFocus = false) {
    setOpen(false)
    setSearch('')
    if (restoreFocus) triggerRef.current?.focus()
  }

  function choose(next: string) {
    if (next !== value) onChange(next)
    closeMenu(true)
  }

  useEffect(() => {
    if (!open) return
    function onOutsideClick(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) closeMenu()
    }
    function onEscape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMenu(true)
      }
    }
    document.addEventListener('pointerdown', onOutsideClick)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('pointerdown', onOutsideClick)
      document.removeEventListener('keydown', onEscape)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    if (variant === 'difficulty' && window.matchMedia('(pointer: fine)').matches) inputRef.current?.focus()
    // Keep selected/highlighted item in the small scrollable menu, without scrolling the page.
    if (!scrollHighlightRef.current) return
    const frame = window.requestAnimationFrame(() => {
      const list = listRef.current
      const item = list?.querySelector<HTMLElement>(`[data-picker-index="${displayedIndex}"]`)
      if (list && item) {
        const listTop = list.getBoundingClientRect().top
        list.scrollTop += item.getBoundingClientRect().top - listTop - list.clientHeight * 0.36
      }
    })
    return () => window.cancelAnimationFrame(frame)
  }, [open, variant, displayedIndex, search])

  function onKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key) && event.target === triggerRef.current) {
        event.preventDefault()
        openMenu()
      }
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      scrollHighlightRef.current = true
      setFocusedIndex(current => Math.max(0, Math.min(filtered.length - 1, current + (event.key === 'ArrowDown' ? 1 : -1))))
    } else if (event.key === 'Enter' && filtered[displayedIndex]) {
      event.preventDefault()
      choose(filtered[displayedIndex].value)
    } else if (event.key === 'Home' && event.target !== inputRef.current) {
      event.preventDefault()
      scrollHighlightRef.current = true
      setFocusedIndex(0)
    } else if (event.key === 'End' && event.target !== inputRef.current) {
      event.preventDefault()
      scrollHighlightRef.current = true
      setFocusedIndex(Math.max(0, filtered.length - 1))
    } else if (event.key === 'Tab') {
      closeMenu()
    }
  }

  const isDifficulty = variant === 'difficulty'
  return <div className={`journey-picker-field ${open ? 'is-open' : ''}`} ref={rootRef} onKeyDown={onKeys} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) closeMenu()
  }}>
    <span className="journey-picker-label" id={`${id}-label`}>{label}</span>
    <button
      type="button"
      ref={triggerRef}
      className="journey-picker-trigger"
      aria-haspopup="listbox"
      aria-controls={`${id}-options`}
      aria-expanded={open}
      aria-labelledby={`${id}-label ${id}-value`}
      onClick={openMenu}
    >
      <span className="journey-picker-symbol" aria-hidden="true">{isDifficulty ? <Gauge size={20}/> : <SlidersHorizontal size={19}/>}</span>
      <span className="journey-picker-trigger-copy"><strong id={`${id}-value`}>{selected.label}</strong><small>{selected.description}</small></span>
      <span className={`journey-picker-caret ${open ? 'rotated' : ''}`} aria-hidden="true"><ChevronDown size={18}/></span>
    </button>
    {open && <div className={`journey-picker-popover ${upward ? 'opens-up' : ''}`} style={{'--journey-menu-max-height':`${maxMenuHeight}px`} as CSSProperties}>
      <div className="journey-picker-popover-top"><span className="journey-picker-overline"><Sparkles size={13}/>{isDifficulty ? 'PICK YOUR SPEED' : 'CHOOSE YOUR STYLE'}</span><strong>{isDifficulty ? 'Find your AI challenge' : 'How should the AI race?'}</strong></div>
      {isDifficulty && <>
        <label className="journey-picker-search"><Search size={17}/><input ref={inputRef} value={search} onChange={event => {scrollHighlightRef.current = true;setSearch(event.target.value);setFocusedIndex(0)}} placeholder="Search Sub-6 to Sub-60…" aria-label="Search AI difficulties" autoComplete="off"/><span>{filtered.length}</span></label>
        {!search && <div className="journey-picker-presets" aria-label="Popular AI difficulties"><span>QUICK PICK</span>{FAVORITES.map(speed => <button key={speed} type="button" className={value === speed ? 'chosen' : ''} onClick={() => choose(speed)}>Sub-{speed}</button>)}</div>}
      </>}
      <div className="journey-picker-list" ref={listRef} role="listbox" id={`${id}-options`} aria-label={label}>
        {filtered.map((option, index) => <div
          role="option"
          key={option.value}
          id={`${id}-opt-${option.value}`}
          data-picker-index={index}
          aria-selected={option.value === value}
          tabIndex={-1}
          className={`journey-picker-option ${option.value === value ? 'chosen' : ''} ${displayedIndex === index ? 'focused' : ''}`}
          onPointerMove={event => {if (event.pointerType === 'mouse' && displayedIndex !== index) {scrollHighlightRef.current = false;setFocusedIndex(index)}}}
          onClick={() => choose(option.value)}
        >
          <span className="journey-picker-option-icon" aria-hidden="true">{isDifficulty ? (Number(option.value) <= 12 ? <Zap size={16}/> : <Gauge size={16}/>) : option.value === 'casual' ? <Sparkles size={17}/> : option.value === 'balanced' ? <SlidersHorizontal size={17}/> : <Swords size={17}/>}</span>
          <span className="journey-picker-option-text"><strong>{option.label}</strong><small>{option.description}</small></span>
          {option.value === value ? <span className="journey-picker-selected" aria-label="Selected"><Check size={15}/></span> : isDifficulty && option.value === '15' ? <span className="journey-picker-recommended">POPULAR</span> : null}
        </div>)}
        {!filtered.length && <div className="journey-picker-empty">No matching Sub level. Try a number between 6 and 60.</div>}
      </div>
      <div className="journey-picker-foot"><span>{isDifficulty ? '55 speed levels available' : 'Your race, your pace'}</span><span>↑ ↓ navigate · Enter select</span></div>
    </div>}
  </div>
}
