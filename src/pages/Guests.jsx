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
  dietary: '', table_num: '', gift_desc: '', thankyou_sent: '', notes: '',
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
function GuestModal({ guest, onClose, onSave, saving }) {
  const [form, setForm] = useState(guest ? { ...EMPTY_FORM, ...guest } : { ...EMPTY_FORM })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleSave() {
    if (!form.first_name.trim()) return
    const clean = {}
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'id') { clean[k] = v; return }
      const num = ['attending','children','rehearsal_invited','table_num']
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
          {field('Invited by', 'invited_by', 'text', ['Paul', 'Jordan'])}
          {field('Age group', 'age', 'text', AGE_GROUPS)}
          {field('Relationship', 'relationship', 'text', RELATIONSHIPS)}
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
  const [filter,    setFilter]   = useState('all')  // all | paul | jordan
  const [search,    setSearch]   = useState('')

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
      const { id, ...rest } = data
      const { error } = await supabase.from('guests').update(rest).eq('id', id)
      if (error) setError('Could not update guest.')
    } else {
      const { error } = await supabase.from('guests').insert([data])
      if (error) setError('Could not add guest.')
    }
    setSaving(false)
    setModal(null)
  }

  // ── Delete ──────────────────────────────────────────────────────────────
  async function deleteGuest(id) {
    if (!confirm('Remove this guest?')) return
    const { error } = await supabase.from('guests').delete().eq('id', id)
    if (error) setError('Could not delete guest.')
  }

  // ── Derived ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let g = guests
    if (filter === 'paul')   g = g.filter(x => x.invited_by === 'Paul')
    if (filter === 'jordan') g = g.filter(x => x.invited_by === 'Jordan')
    if (search) {
      const q = search.toLowerCase()
      g = g.filter(x => `${x.first_name} ${x.last_name}`.toLowerCase().includes(q) || (x.relationship||'').toLowerCase().includes(q))
    }
    return g
  }, [guests, filter, search])

  const stats = useMemo(() => {
    const total    = guests.length
    const paulCt   = guests.filter(g => g.invited_by === 'Paul').length
    const jordanCt = guests.filter(g => g.invited_by === 'Jordan').length
    const yes      = guests.filter(g => g.response === 'Yes').length
    const no       = guests.filter(g => g.response === 'No').length
    const maybe    = guests.filter(g => g.response === 'Maybe').length
    const pending  = guests.filter(g => !g.response).length
    const dietary  = guests.filter(g => g.dietary).length
    return { total, paulCt, jordanCt, yes, no, maybe, pending, dietary }
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
          { label:'Total guests',    val: stats.total,   note: `${stats.paulCt} Paul · ${stats.jordanCt} Jordan`, color:'var(--text)'   },
          { label:'Confirmed yes',   val: stats.yes,     note: `${stats.no} no · ${stats.maybe} maybe`,           color:'var(--green)'  },
          { label:'Awaiting RSVP',   val: stats.pending, note: `${stats.total - stats.pending} responded`,         color:'var(--amber)'  },
          { label:'Dietary needs',   val: stats.dietary, note: 'guests with restrictions',                          color:'var(--paul)'   },
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
        {[['all','All guests'],['paul',"Paul's side"],['jordan',"Jordan's side"]].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{
              fontFamily:'var(--font-sans)', fontSize:12, padding:'5px 14px',
              borderRadius:99, border:'1px solid var(--border2)', cursor:'pointer',
              background: filter===val ? 'var(--text)' : 'transparent',
              color: filter===val ? 'var(--bg)' : 'var(--text2)',
              transition:'all 0.12s',
            }}>
            {label}
          </button>
        ))}
        <input
          type="text"
          placeholder="Search guests…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginLeft:'auto', padding:'5px 12px', border:'1px solid var(--border2)', borderRadius:99, background:'var(--surface)', color:'var(--text)', fontFamily:'var(--font-sans)', fontSize:12, width:200 }}
        />
      </div>

      {/* Table */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', overflow:'auto', marginBottom:'2rem' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'var(--font-sans)', fontSize:13, minWidth:800 }}>
          <thead>
            <tr>
              {['Name','Invited by','Relationship','Age','Save date','Invite','RSVP','Attending','Dietary','Table',''].map((h,i) => (
                <th key={i} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--text3)', background:'var(--surface2)', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={11} style={{ padding:'32px', textAlign:'center', color:'var(--text3)', fontSize:13 }}>
                {guests.length === 0 ? 'No guests yet — add one to get started.' : 'No guests match your filter.'}
              </td></tr>
            )}
            {filtered.map(g => {
              const rc  = relColor(g.relationship)
              const rsc = rsvpColor(g.response)
              const inv = g.invited_by === 'Paul' ? 'paul' : 'jordan'
              return (
                <tr key={g.id}
                  onMouseEnter={e => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background='var(--surface2)')}
                  onMouseLeave={e => e.currentTarget.querySelectorAll('td').forEach(td => td.style.background='')}
                >
                  <td style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', fontWeight:500, whiteSpace:'nowrap' }}>
                    {g.first_name} {g.last_name || ''}
                    {g.notes && <span style={{ marginLeft:6, fontSize:10, color:'var(--text3)', cursor:'help' }} title={g.notes}>📝</span>}
                  </td>
                  <td style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)' }}>
                    <span className={`chip ${inv}`}>{g.invited_by}</span>
                  </td>
                  <td style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)' }}>
                    {g.relationship && <span className="chip" style={{ background: rc.bg, color: rc.color }}>{g.relationship}</span>}
                  </td>
                  <td style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', color:'var(--text2)', fontSize:12 }}>{g.age || '—'}</td>
                  <td style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)' }}>
                    {g.save_the_date
                      ? <span style={{ color:'var(--green)', fontSize:12 }}>✓</span>
                      : <span style={{ color:'var(--text3)', fontSize:12 }}>—</span>}
                  </td>
                  <td style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)' }}>
                    {g.invitation
                      ? <span style={{ color:'var(--green)', fontSize:12 }}>✓</span>
                      : <span style={{ color:'var(--text3)', fontSize:12 }}>—</span>}
                  </td>
                  <td style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)' }}>
                    {g.response
                      ? <span className="chip" style={{ background: rsc.bg, color: rsc.color }}>{g.response}</span>
                      : <span style={{ color:'var(--text3)', fontSize:12 }}>—</span>}
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
