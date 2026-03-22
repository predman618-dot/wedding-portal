import { useState, useMemo, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const RELATIONSHIPS = ['IMMEDIATE FAM', 'WEDDING PARTY', 'FAMILY MOM', 'FAMILY DAD', 'FRIEND']
const AGE_GROUPS    = ['ADULT', 'TEEN', 'CHILD']
const RESPONSES     = ['Yes', 'No', 'Maybe']
const SENT_OPTS     = ['Sent', 'Not yet']

const EMPTY_FORM = {
  first_name: '', last_name: '', address: '', email: '',
  invited_by: 'Paul', age: 'ADULT', relationship: 'FRIEND',
  save_the_date: '', invitation: '', response: '',
  attending: '', children: '',
  rehearsal_invited: '', rehearsal_going: '',
  household: '', plus_ones: '', invite_list: 'A', couple_id: '', dietary: '', table_num: '', gift_desc: '', thankyou_sent: '', notes: '',
}

// ── Helpers ───────────────────────────────────────────────────────────────
function relColor(rel) {
  if (rel === 'WEDDING PARTY') return { bg: 'var(--paul-light)',   color: 'var(--paul-text)'   }
  if (rel === 'IMMEDIATE FAM') return { bg: 'var(--jordan-light)', color: 'var(--jordan-text)' }
  if (rel === 'FAMILY MOM')    return { bg: 'var(--green-light)',  color: 'var(--green-text)'  }
  if (rel === 'FAMILY DAD')    return { bg: 'var(--green-light)',  color: 'var(--green-text)'  }
  return { bg: 'var(--surface2)', color: 'var(--text2)' }
}

function rsvpColor(r) {
  if (r === 'Yes')   return { bg: 'var(--green-light)',  color: 'var(--green-text)'  }
  if (r === 'No')    return { bg: '#fef2f2',             color: '#dc2626'            }
  if (r === 'Maybe') return { bg: 'var(--amber-light)',  color: 'var(--amber-text)'  }
  return { bg: 'var(--surface2)', color: 'var(--text3)' }
}

// ── Guest Modal (Add + Edit) ──────────────────────────────────────────────
function GuestModal({ guest, onClose, onSave, saving, allGuests }) {
  const [form, setForm] = useState(guest ? { ...EMPTY_FORM, ...guest } : { ...EMPTY_FORM })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleSave() {
    if (!form.first_name.trim()) return
    const clean = {}
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'id') { clean[k] = v; return }
      const num = ['attending','children','rehearsal_invited','table_num','couple_id']
      if (num.includes(k)) clean[k] = v === '' || v === null ? null : parseInt(v)
      else clean[k] = v === '' ? null : v
    })
    onSave(clean)
  }

  const field = (label, key, type = 'text', opts = null) => (
    <div className="field" key={key}>
      <label>{label}</label>
      {opts
        ? <select value={form[key] ?? ''} onChange={e => set(key, e.target.value)}>
            <option value="">—</option>
            {opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        : <input type={type} value={form[key] ?? ''} onChange={e => set(key, e.target.value)} />
      }
    </div>
  )

  return (
    <div className="overlay open" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" style={{ width: 520 }}>
        <div className="modal-title">{guest ? 'Edit guest' : 'Add guest'}</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          {field('First Name', 'first_name')}
          {field('Last Name', 'last_name')}
          {field('Email', 'email', 'email')}
          {field('Address', 'address')}
          {field('Household', 'household')}
          <div className="field">
            <label>Paired with (couple)</label>
            <select value={form.couple_id ?? ''} onChange={e => set('couple_id', e.target.value === '' ? '' : e.target.value === 'new' ? Math.max(0, ...allGuests.map(g => g.couple_id || 0)) + 1 : parseInt(e.target.value))}>
              <option value="">— No pairing</option>
              <option value="new">+ Create new couple</option>
              {[...new Map(allGuests.filter(g => g.couple_id && g.id !== (guest?.id)).map(g => [g.couple_id, g])).values()]
                .sort((a,b) => a.couple_id - b.couple_id)
                .map(g => (
                  <option key={g.couple_id} value={g.couple_id}>
                    Pair with {g.first_name} {g.last_name || ''} (#{g.couple_id})
                  </option>
                ))
              }
            </select>
          </div>
          {field('Invited by', 'invited_by', 'text', ['Paul', 'Jordan'])}
          {field('Age group', 'age', 'text', AGE_GROUPS)}
          {field('Relationship', 'relationship', 'text', RELATIONSHIPS)}
          {field('Invite list', 'invite_list', 'text', ['A', 'B'])}
          {field('Dietary restrictions', 'dietary')}
        </div>

        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text3)', margin: '12px 0 8px', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          Invitations
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          {field('Save the date', 'save_the_date', 'text', SENT_OPTS)}
          {field('Invitation', 'invitation', 'text', SENT_OPTS)}
        </div>

        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text3)', margin: '12px 0 8px', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          RSVP & Wedding
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 16px' }}>
          {field('Response', 'response', 'text', RESPONSES)}
          {field('# Attending', 'attending', 'number')}
          {field('# Children', 'children', 'number')}
        </div>

        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text3)', margin: '12px 0 8px', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          Rehearsal Dinner
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          {field('# Invited', 'rehearsal_invited', 'number')}
          {field('Going?', 'rehearsal_going', 'text', ['Yes', 'No'])}
        </div>

        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text3)', margin: '12px 0 8px', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          Details
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 16px' }}>
          {field('Table #', 'table_num', 'number')}
          {field('Gift received', 'gift_desc')}
          {field('Thank-you sent?', 'thankyou_sent', 'text', ['Yes', 'No'])}
        </div>
        {field('Plus-ones / additional names', 'plus_ones')}
        {field('Notes', 'notes')}

        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : guest ? 'Save changes' : 'Add guest'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Guest List Page ──────────────────────────────────────────────────
export default function Guests() {
  const [guests,    setGuests]   = useState([])
  const [loading,   setLoading]  = useState(true)
  const [saving,    setSaving]   = useState(false)
  const [error,     setError]    = useState(null)
  const [modal,     setModal]    = useState(null)   // null | 'add' | guest object
  const [filters,   setFilters]  = useState(new Set())  // empty = show all

  function toggleFilter(val) {
    setFilters(prev => {
      const next = new Set(prev)
      if (next.has(val)) next.delete(val)
      else next.add(val)
      return next
    })
  }
  const [search,    setSearch]   = useState('')
  const [sortKey,   setSortKey]  = useState('last_name')
  const [sortDir,   setSortDir]  = useState('asc')

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  // ── Load ────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await supabase.from('guests').select('*').order('last_name')
      if (error) setError('Could not load guest list.')
      else setGuests(data || [])
      setLoading(false)
    }
    load()
  }, [])

  // ── Realtime ────────────────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('guests-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guests' }, payload => {
        if (payload.eventType === 'INSERT') setGuests(p => [...p, payload.new].sort((a,b) => (a.last_name||'').localeCompare(b.last_name||'')))
        else if (payload.eventType === 'UPDATE') setGuests(p => p.map(g => g.id === payload.new.id ? payload.new : g))
        else if (payload.eventType === 'DELETE') setGuests(p => p.filter(g => g.id !== payload.old.id))
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  // ── Save (add or edit) ──────────────────────────────────────────────────
  async function saveGuest(data) {
    setSaving(true)
    if (data.id) {
      // Optimistic update
      setGuests(prev => prev.map(g => g.id === data.id ? { ...g, ...data } : g))
      setModal(null)
      const { id, ...rest } = data
      const { error } = await supabase.from('guests').update(rest).eq('id', id)
      if (error) { setError('Could not update guest.'); setGuests(prev => prev.map(g => g.id === data.id ? g : g)) }
    } else {
      const tempId = Date.now()
      const newGuest = { ...data, id: tempId }
      setGuests(prev => [...prev, newGuest].sort((a,b) => (a.last_name||'').localeCompare(b.last_name||'')))
      setModal(null)
      const { data: inserted, error } = await supabase.from('guests').insert([data]).select().single()
      if (error) { setError('Could not add guest.'); setGuests(prev => prev.filter(g => g.id !== tempId)) }
      else setGuests(prev => prev.map(g => g.id === tempId ? inserted : g))
    }
    setSaving(false)
  }

  // ── Delete ──────────────────────────────────────────────────────────────
  async function deleteGuest(id) {
    if (!confirm('Remove this guest?')) return
    const removed = guests.find(g => g.id === id)
    setGuests(prev => prev.filter(g => g.id !== id))
    const { error } = await supabase.from('guests').delete().eq('id', id)
    if (error) { setError('Could not delete guest.'); setGuests(prev => [...prev, removed].sort((a,b) => (a.last_name||'').localeCompare(b.last_name||''))) }
  }

  // ── Derived ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let g = guests
    if (filters.size > 0) {
      g = g.filter(x => {
        const matchSide = !filters.has('paul') && !filters.has('jordan') ||
          (filters.has('paul')   && x.invited_by === 'Paul') ||
          (filters.has('jordan') && x.invited_by === 'Jordan')
        const matchList = !filters.has('a') && !filters.has('b') ||
          (filters.has('a') && x.invite_list !== 'B') ||
          (filters.has('b') && x.invite_list === 'B')
        return matchSide && matchList
      })
    }
    if (search) {
      const q = search.toLowerCase()
      g = g.filter(x => `${x.first_name} ${x.last_name}`.toLowerCase().includes(q) || (x.relationship||'').toLowerCase().includes(q))
    }
    g = [...g].sort((a, b) => {
      const av = (a[sortKey] ?? '').toString().toLowerCase()
      const bv = (b[sortKey] ?? '').toString().toLowerCase()
      let cmp = 0
      if (av < bv) cmp = sortDir === 'asc' ? -1 : 1
      else if (av > bv) cmp = sortDir === 'asc' ? 1 : -1
      // Keep couples together — if same couple_id, sort by first_name within pair
      if (cmp !== 0 && a.couple_id && b.couple_id && a.couple_id === b.couple_id) return (a.first_name||'').localeCompare(b.first_name||'')
      if (cmp !== 0) return cmp
      // Same primary sort value — keep couples adjacent
      if (a.couple_id && b.couple_id && a.couple_id === b.couple_id) return (a.first_name||'').localeCompare(b.first_name||'')
      return 0
    })
    // Second pass: pull couple partners next to their pair
    const paired = []
    const seen = new Set()
    for (const guest of g) {
      if (seen.has(guest.id)) continue
      seen.add(guest.id)
      paired.push(guest)
      if (guest.couple_id) {
        const partner = g.find(x => x.couple_id === guest.couple_id && x.id !== guest.id && !seen.has(x.id))
        if (partner) { seen.add(partner.id); paired.push(partner) }
      }
    }
    return paired
  }, [guests, filters, search, sortKey, sortDir])

  const stats = useMemo(() => {
    const total    = guests.length
    const paulCt   = guests.filter(g => g.invited_by === 'Paul').length
    const jordanCt = guests.filter(g => g.invited_by === 'Jordan').length
    const aList    = guests.filter(g => g.invite_list !== 'B').length
    const bList    = guests.filter(g => g.invite_list === 'B').length
    const invited  = guests.filter(g => g.save_the_date === 'Sent').length
    const yes      = guests.filter(g => g.response === 'Yes').reduce((sum, g) => sum + (g.attending || 0) + (g.children || 0), 0)
    const yesGuests = guests.filter(g => g.response === 'Yes').length
    const no       = guests.filter(g => g.response === 'No').length
    const maybe    = guests.filter(g => g.response === 'Maybe').length
    const pending  = guests.filter(g => !g.response).length
    return { total, paulCt, jordanCt, aList, bList, invited, yes, yesGuests, no, maybe, pending }
  }, [guests])

  if (loading) return (
    <div className="page-content" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:300 }}>
      <div style={{ fontFamily:'var(--font-sans)', fontSize:14, color:'var(--text3)' }}>Loading guest list…</div>
    </div>
  )

  return (
    <div className="page-content" style={{ maxWidth: 1300 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Guest List</h1>
          <p className="page-subtitle">RSVPs, dietary needs &amp; seating</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>+ Add guest</button>
      </div>

      {error && (
        <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'var(--radius)', padding:'12px 16px', marginBottom:'1.5rem', fontFamily:'var(--font-sans)', fontSize:13, color:'#dc2626', display:'flex', justifyContent:'space-between' }}>
          {error}
          <button onClick={() => setError(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#dc2626', fontSize:16 }}>×</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:'1.5rem' }} className="guest-stats">
        {[
          { label:'Total guests',       val: stats.total,   note: `${stats.aList} A list · ${stats.bList} B list`,     color:'var(--text)'   },
          { label:'Confirmed attending',val: stats.yes,     note: `${stats.yesGuests} guests confirmed yes`,            color:'var(--green)'  },
          { label:'Invited',            val: stats.invited, note: 'save the date sent',                                 color:'var(--paul)'   },
          { label:'Awaiting RSVP',      val: stats.pending, note: `${stats.total - stats.pending} responded`,           color:'var(--amber)'  },
        ].map(s => (
          <div key={s.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:16 }}>
            <div style={{ fontFamily:'var(--font-sans)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--text3)', marginBottom:8 }}>{s.label}</div>
            <div style={{ fontSize:26, fontFamily:'var(--font-serif)', letterSpacing:'-0.5px', color: s.color }}>{s.val}</div>
            <div style={{ fontFamily:'var(--font-sans)', fontSize:11, color:'var(--text3)', marginTop:4 }}>{s.note}</div>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div style={{ display:'flex', gap:8, marginBottom:'1rem', flexWrap:'wrap', alignItems:'center' }}>
        {[
          { val:'paul',   label:"Paul's side", count: guests.filter(g => g.invited_by === 'Paul').length },
          { val:'jordan', label:"Jordan's side",count: guests.filter(g => g.invited_by === 'Jordan').length },
          { val:'a',      label:'A List',       count: guests.filter(g => g.invite_list !== 'B').length },
          { val:'b',      label:'B List',       count: guests.filter(g => g.invite_list === 'B').length },
        ].map(({ val, label, count }) => {
          const active = filters.has(val)
          return (
            <button key={val} onClick={() => toggleFilter(val)}
              style={{
                fontFamily:'var(--font-sans)', fontSize:12, padding:'5px 12px',
                borderRadius:99, border: active ? '1px solid var(--text)' : '1px solid var(--border2)',
                cursor:'pointer', display:'flex', alignItems:'center', gap:6,
                background: active ? 'var(--text)' : 'transparent',
                color: active ? 'var(--bg)' : 'var(--text2)',
                transition:'all 0.12s',
              }}>
              {label}
              <span style={{
                fontFamily:'var(--font-sans)', fontSize:10, fontWeight:600,
                background: active ? 'rgba(255,255,255,0.2)' : 'var(--surface2)',
                color: active ? 'var(--bg)' : 'var(--text3)',
                borderRadius:99, padding:'1px 6px', minWidth:18, textAlign:'center',
              }}>{count}</span>
            </button>
          )
        })}
        {filters.size > 0 && (
          <button onClick={() => setFilters(new Set())}
            style={{ fontFamily:'var(--font-sans)', fontSize:11, color:'var(--text3)', background:'none', border:'none', cursor:'pointer', padding:'5px 4px', textDecoration:'underline' }}>
            Clear
          </button>
        )}
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
          {(filters.size > 0 || search) && (
            <span style={{ fontFamily:'var(--font-sans)', fontSize:12, color:'var(--text3)' }}>
              Showing {filtered.length} of {guests.length}
            </span>
          )}
          <input
            type="text"
            placeholder="Search guests…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding:'5px 12px', border:'1px solid var(--border2)', borderRadius:99, background:'var(--surface)', color:'var(--text)', fontFamily:'var(--font-sans)', fontSize:12, width:200 }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', overflow:'auto', marginBottom:'2rem' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'var(--font-sans)', fontSize:13, minWidth:800 }}>
          <thead>
            <tr>
              {[
                { label:'List',       key:'invite_list'  },
                { label:'Name',       key:'last_name'    },
                { label:'Household',  key:'household'    },
                { label:'Invited by', key:'invited_by'   },
                { label:'Relationship',key:'relationship'},
                { label:'Age',        key:'age'          },
                { label:'Save date',  key:'save_the_date'},
                { label:'Invite',     key:'invitation'   },
                { label:'RSVP',       key:'response'     },
                { label:'Attending',  key:'attending'    },
                { label:'Dietary',    key:'dietary'      },
                { label:'Table',      key:'table_num'    },
                { label:'',           key:null           },
              ].map(({ label, key }) => (
                <th key={label} onClick={() => key && handleSort(key)}
                  style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.07em', color: key && sortKey===key ? 'var(--text)' : 'var(--text3)', background:'var(--surface2)', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap', cursor: key ? 'pointer' : 'default', userSelect:'none' }}>
                  {label}{key && sortKey===key ? (sortDir==='asc' ? ' ↑' : ' ↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={12} style={{ padding:'32px', textAlign:'center', color:'var(--text3)', fontSize:13 }}>
                {guests.length === 0 ? 'No guests yet — add one to get started.' : 'No guests match your filter.'}
              </td></tr>
            )}
            {filtered.map(g => {
              const rc  = relColor(g.relationship)
              const rsc = rsvpColor(g.response)
              const inv = g.invited_by === 'Paul' ? 'paul' : 'jordan'
              const coupleColors = ['#e8f2fc','#faeaf2','#e4f5ee','#fef3e0','#f0ede8','#e8eaf6','#fce4ec','#e0f7fa']
              const coupleColor = g.couple_id ? coupleColors[(g.couple_id - 1) % coupleColors.length] : null
              return (
                <tr key={g.id}
                  onMouseEnter={e => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background='var(--surface2)')}
                  onMouseLeave={e => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background = '')}
                  style={{ borderLeft: coupleColor ? `3px solid ${coupleColor === '#e8f2fc' ? 'var(--paul)' : coupleColor === '#faeaf2' ? 'var(--jordan)' : coupleColor === '#e4f5ee' ? 'var(--green)' : coupleColor === '#fef3e0' ? 'var(--amber)' : '#9e9e9e'}` : '3px solid transparent' }}
                >
                  <td style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', textAlign:'center' }}>
                    <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:22, height:22, borderRadius:'50%', fontSize:11, fontWeight:600, background: g.invite_list === 'B' ? 'var(--amber-light)' : 'var(--green-light)', color: g.invite_list === 'B' ? 'var(--amber-text)' : 'var(--green-text)' }}>
                      {g.invite_list || 'A'}
                    </span>
                  </td>
                  <td style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', fontWeight:500, whiteSpace:'nowrap' }}>
                    {g.first_name} {g.last_name || ''}
                    {g.plus_ones && <span style={{ marginLeft:6, fontSize:10, color:'var(--text3)', cursor:'help' }} title={`Plus-ones: ${g.plus_ones}`}>👥</span>}
                    {g.notes && <span style={{ marginLeft:4, fontSize:10, color:'var(--text3)', cursor:'help' }} title={g.notes}>📝</span>}
                  </td>
                  <td style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', color:'var(--text2)', fontSize:12, whiteSpace:'nowrap' }}>
                    {g.household || '—'}
                  </td>
                  <td style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)' }}>
                    <span className={`chip ${inv}`}>{g.invited_by}</span>
                  </td>
                  <td style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)' }}>
                    {g.relationship && <span className="chip" style={{ background: rc.bg, color: rc.color }}>{g.relationship}</span>}
                  </td>
                  <td style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', color:'var(--text2)', fontSize:12 }}>{g.age || '—'}</td>
                  <td style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)' }}>
                    <select value={g.save_the_date || ''} onChange={e => saveGuest({ ...g, save_the_date: e.target.value || null })}
                      style={{ fontFamily:'var(--font-sans)', fontSize:12, background:'transparent', border:'none', color: g.save_the_date === 'Sent' ? 'var(--green)' : 'var(--text3)', cursor:'pointer', outline:'none' }}>
                      <option value="">—</option>
                      <option value="Sent">Sent</option>
                      <option value="Not yet">Not yet</option>
                    </select>
                  </td>
                  <td style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)' }}>
                    <select value={g.invitation || ''} onChange={e => saveGuest({ ...g, invitation: e.target.value || null })}
                      style={{ fontFamily:'var(--font-sans)', fontSize:12, background:'transparent', border:'none', color: g.invitation === 'Sent' ? 'var(--green)' : 'var(--text3)', cursor:'pointer', outline:'none' }}>
                      <option value="">—</option>
                      <option value="Sent">Sent</option>
                      <option value="Not yet">Not yet</option>
                    </select>
                  </td>
                  <td style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)' }}>
                    <select value={g.response || ''} onChange={e => saveGuest({ ...g, response: e.target.value || null })}
                      style={{ fontFamily:'var(--font-sans)', fontSize:12, background:'transparent', border:'none', color: g.response === 'Yes' ? 'var(--green-text)' : g.response === 'No' ? '#dc2626' : g.response === 'Maybe' ? 'var(--amber-text)' : 'var(--text3)', cursor:'pointer', outline:'none', fontWeight: g.response ? 500 : 400 }}>
                      <option value="">—</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Maybe">Maybe</option>
                    </select>
                  </td>
                  <td style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', color:'var(--text2)', textAlign:'center' }}>
                    {g.attending ?? '—'}
                  </td>
                  <td style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', color:'var(--text2)', fontSize:12, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {g.dietary || '—'}
                  </td>
                  <td style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', color:'var(--text2)', textAlign:'center' }}>
                    {g.table_num ?? '—'}
                  </td>
                  <td style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>
                    <button onClick={() => setModal(g)}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:13, padding:'2px 6px', borderRadius:4 }}
                      onMouseEnter={e => e.currentTarget.style.color='var(--text)'}
                      onMouseLeave={e => e.currentTarget.style.color='var(--text3)'}
                    >✎</button>
                    <button onClick={() => deleteGuest(g.id)}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:16, padding:'2px 5px', borderRadius:4, lineHeight:1 }}
                      onMouseEnter={e => e.currentTarget.style.color='var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color='var(--text3)'}
                    >×</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <GuestModal
          guest={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={saveGuest}
          saving={saving}
          allGuests={guests}
        />
      )}

      <style>{`
        .overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:200; align-items:center; justify-content:center; }
        .overlay.open { display:flex; }
        .modal { background:var(--surface); border-radius:var(--radius); border:1px solid var(--border); padding:24px; width:420px; max-width:96vw; max-height:92vh; overflow-y:auto; }
        .modal-title { font-family:var(--font-serif); font-size:22px; margin-bottom:16px; font-weight:400; }
        .field { margin-bottom:12px; }
        .field label { display:block; font-family:var(--font-sans); font-size:11px; font-weight:500; text-transform:uppercase; letter-spacing:0.07em; color:var(--text2); margin-bottom:4px; }
        .field input, .field select { width:100%; padding:8px 10px; border:1px solid var(--border2); border-radius:var(--radius-sm); background:var(--surface); color:var(--text); font-size:13px; font-family:var(--font-sans); }
        .modal-actions { display:flex; gap:8px; justify-content:flex-end; margin-top:16px; }
        @media (max-width:600px) { .guest-stats { grid-template-columns:repeat(2,1fr) !important; } }
      `}</style>
    </div>
  )
}
