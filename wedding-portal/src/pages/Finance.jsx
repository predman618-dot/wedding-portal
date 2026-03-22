import { useState, useMemo } from 'react'

// ── Seed data (matches original file exactly) ──────────────────────────────
const SEED_TRANSACTIONS = [
  { id: 1, date: '2026-02-12', desc: 'Shared Account Transfer',   cat: 'Fund Transfer',    cost: 100,   paid: 'Jordan', split: 'jordan', reimb: 'na'      },
  { id: 2, date: '2026-02-12', desc: 'Shared Account Transfer',   cat: 'Fund Transfer',    cost: 100,   paid: 'Paul',   split: 'paul',   reimb: 'na'      },
  { id: 3, date: '2026-02-16', desc: 'Venue Deposit',             cat: 'Venue',            cost: 10250, paid: 'Paul',   split: 'shared', reimb: 'pending' },
  { id: 4, date: '2026-02-19', desc: 'Wedding Planner Retainer',  cat: 'Planning',         cost: 1500,  paid: 'Paul',   split: 'shared', reimb: 'pending' },
  { id: 5, date: '2026-02-26', desc: 'Shared Account Transfer',   cat: 'Fund Transfer',    cost: 1000,  paid: 'Paul',   split: 'paul',   reimb: 'na'      },
  { id: 6, date: '2026-03-01', desc: 'Shared Account Transfer',   cat: 'Fund Transfer',    cost: 1150,  paid: 'Jordan', split: 'jordan', reimb: 'na'      },
  { id: 7, date: '2026-03-19', desc: 'Photo/Video/DJ Retainer',   cat: 'Photo/Video/DJ',   cost: 1500,  paid: 'Paul',   split: 'shared', reimb: 'pending' },
  { id: 8, date: '2026-03-15', desc: 'Rehearsal Venue Deposit',   cat: 'Rehearsal Dinner', cost: 1000,  paid: 'Paul',   split: 'shared', reimb: 'pending' },
]

const CATEGORIES = [
  'Venue','Planning','Photo/Video/DJ','Catering','Flowers',
  'Attire','Rehearsal Dinner','Honeymoon','Fund Transfer','Other',
]

// ── Helpers ───────────────────────────────────────────────────────────────
const fmt = n => '$' + Math.round(n).toLocaleString()

function calc(txns) {
  let pOOP=0,jOOP=0,pTransfers=0,jTransfers=0,pVendors=0,jVendors=0,
      pReimbPaid=0,jReimbPaid=0,pReimbPending=0,jReimbPending=0

  txns.forEach(t => {
    const half = t.cost / 2
    if (t.split === 'paul') {
      if (t.paid==='Paul')   { pOOP+=t.cost; t.cat==='Fund Transfer' ? pTransfers+=t.cost : (pVendors+=t.cost) }
      else if (t.paid==='Jordan') { jOOP+=t.cost; t.cat==='Fund Transfer' ? jTransfers+=t.cost : (jVendors+=t.cost) }
    } else if (t.split === 'jordan') {
      if (t.paid==='Jordan') { jOOP+=t.cost; t.cat==='Fund Transfer' ? jTransfers+=t.cost : (jVendors+=t.cost) }
      else if (t.paid==='Paul') { pOOP+=t.cost; t.cat==='Fund Transfer' ? pTransfers+=t.cost : (pVendors+=t.cost) }
    } else {
      if (t.paid==='Paul') {
        pVendors+=t.cost
        if (t.reimb==='paid')    { pOOP+=half; jOOP+=half; jReimbPaid+=half }
        else if (t.reimb==='pending') { pOOP+=t.cost; jReimbPending+=half }
        else { pOOP+=half; jOOP+=half }
      } else if (t.paid==='Jordan') {
        jVendors+=t.cost
        if (t.reimb==='paid')    { jOOP+=half; pOOP+=half; pReimbPaid+=half }
        else if (t.reimb==='pending') { jOOP+=t.cost; pReimbPending+=half }
        else { jOOP+=half; pOOP+=half }
      } else {
        pOOP+=half; jOOP+=half
      }
    }
  })
  return {pOOP,jOOP,pTransfers,jTransfers,pVendors,jVendors,pReimbPaid,jReimbPaid,pReimbPending,jReimbPending}
}

function fmtDate(iso) {
  const d = new Date(iso + 'T12:00:00')
  return `${d.getMonth()+1}/${d.getDate()}/${String(d.getFullYear()).slice(2)}`
}

// ── Add Transaction Modal ─────────────────────────────────────────────────
function AddModal({ onClose, onSave }) {
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    date: today, desc: '', cat: 'Venue', cost: '',
    paid: 'Paul', split: 'shared', reimb: 'pending',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const showReimb = form.split === 'shared' && form.paid !== 'Shared'
  const other = form.paid === 'Paul' ? 'Jordan' : 'Paul'
  const halfAmt = fmt((parseFloat(form.cost) || 0) / 2)

  function handleSave() {
    if (!form.date || !form.desc || !form.cost) return
    onSave({
      ...form,
      cost: parseFloat(form.cost),
      reimb: showReimb ? form.reimb : 'na',
    })
  }

  return (
    <div
      className="overlay open"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal">
        <div className="modal-title">Add transaction</div>

        <div className="field">
          <label>Date</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
        <div className="field">
          <label>Description</label>
          <input type="text" value={form.desc} placeholder="e.g. Florist deposit"
            onChange={e => set('desc', e.target.value)} />
        </div>
        <div className="field">
          <label>Category</label>
          <select value={form.cat} onChange={e => set('cat', e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Amount ($)</label>
          <input type="number" value={form.cost} min="0" step="0.01" placeholder="0.00"
            onChange={e => set('cost', e.target.value)} />
        </div>
        <div className="field">
          <label>Paid by</label>
          <select value={form.paid} onChange={e => set('paid', e.target.value)}>
            <option value="Paul">Paul (personal account)</option>
            <option value="Jordan">Jordan (personal account)</option>
            <option value="Shared">Shared account</option>
          </select>
        </div>
        <div className="field">
          <label>Who is this for?</label>
          <select value={form.split} onChange={e => set('split', e.target.value)}>
            <option value="shared">Both — 50/50 shared expense</option>
            <option value="paul">Paul only</option>
            <option value="jordan">Jordan only</option>
          </select>
        </div>
        {showReimb && (
          <div className="field">
            <label>Has the other person reimbursed their half?</label>
            <select value={form.reimb} onChange={e => set('reimb', e.target.value)}>
              <option value="pending">No — reimbursement pending</option>
              <option value="paid">Yes — already reimbursed</option>
            </select>
            <div className="field-hint">
              Has {other} already sent {form.paid} their half ({halfAmt})?
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Add</button>
        </div>
      </div>
    </div>
  )
}

// ── Main Finance Page ─────────────────────────────────────────────────────
export default function Finance() {
  const [txns, setTxns]       = useState(SEED_TRANSACTIONS)
  const [nextId, setNextId]   = useState(9)
  const [budget, setBudget]   = useState(50000)
  const [showModal, setModal] = useState(false)

  const vendorSpend = useMemo(
    () => txns.filter(t => t.cat !== 'Fund Transfer').reduce((s,t) => s+t.cost, 0),
    [txns]
  )
  const remaining = budget - vendorSpend
  const pct       = Math.min(100, Math.round(vendorSpend / budget * 100))
  const barClass  = pct > 90 ? 'danger' : pct > 70 ? 'warn' : ''

  const s      = useMemo(() => calc(txns), [txns])
  const grand  = s.pOOP + s.jOOP
  const pp     = grand > 0 ? Math.round(s.pOOP / grand * 100) : 50
  const sorted = useMemo(() => [...txns].sort((a,b) => new Date(b.date) - new Date(a.date)), [txns])

  function toggleReimb(id) {
    setTxns(prev => prev.map(t =>
      t.id === id && t.reimb !== 'na'
        ? { ...t, reimb: t.reimb === 'pending' ? 'paid' : 'pending' }
        : t
    ))
  }

  function delTxn(id) {
    setTxns(prev => prev.filter(t => t.id !== id))
  }

  function addTxn(data) {
    setTxns(prev => [...prev, { ...data, id: nextId }])
    setNextId(n => n + 1)
    setModal(false)
  }

  const totalPending = s.pReimbPending + s.jReimbPending
  const alertParts   = []
  if (s.jReimbPending > 0) alertParts.push(`Jordan owes Paul ${fmt(s.jReimbPending)}`)
  if (s.pReimbPending > 0) alertParts.push(`Paul owes Jordan ${fmt(s.pReimbPending)}`)

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Wedding Finances</h1>
          <p className="page-subtitle">Real out-of-pocket spend tracker</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <label style={{ fontFamily:'var(--font-sans)', fontSize:12, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.06em' }}>
            Total budget
          </label>
          <input
            type="number"
            value={budget}
            onChange={e => setBudget(parseFloat(e.target.value)||0)}
            style={{ width:110, padding:'6px 10px', border:'1px solid var(--border2)', borderRadius:'var(--radius-sm)', background:'var(--surface)', color:'var(--text)', fontSize:14, fontFamily:'var(--font-sans)' }}
          />
        </div>
      </div>

      {/* Budget bar */}
      <div style={{ marginBottom:'1.75rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-sans)', fontSize:13, color:'var(--text2)', marginBottom:8 }}>
          <span>Vendor spend: <strong style={{ color:'var(--text)' }}>{pct}%</strong> of budget</span>
          <span>{fmt(remaining)} remaining</span>
        </div>
        <div style={{ height:8, background:'var(--surface2)', borderRadius:99, overflow:'hidden' }}>
          <div style={{
            height:'100%', borderRadius:99, width:`${pct}%`, transition:'width 0.4s ease',
            background: pct>90 ? 'var(--red)' : pct>70 ? 'var(--amber)' : 'var(--green)',
          }} />
        </div>
      </div>

      {/* Alert banner */}
      {totalPending > 0 && (
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap',
          background:'var(--amber-light)', border:'1px solid rgba(196,122,16,0.25)',
          borderRadius:'var(--radius)', padding:'12px 16px', marginBottom:'1.75rem',
          fontFamily:'var(--font-sans)', fontSize:13, color:'var(--amber-text)',
        }}>
          <span>{alertParts.join('  ·  ')}</span>
          <span style={{ opacity:0.6, fontSize:11 }}>Click a status badge to mark as reimbursed</span>
        </div>
      )}

      {/* Metric cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:'1.75rem' }} className="fin-metrics">
        {[
          { label:'Total vendor spend',       val: fmt(vendorSpend),           cls:'green',  note: null },
          { label:'Paul out of pocket',        val: fmt(s.pOOP),                cls:'paul',   note:`${pp}% of combined spend` },
          { label:'Jordan out of pocket',      val: fmt(s.jOOP),                cls:'jordan', note:`${100-pp}% of combined spend` },
          { label:'Pending reimbursements',    val: fmt(s.pReimbPending+s.jReimbPending), cls:'amber', note: null },
        ].map(m => (
          <div key={m.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:16 }}>
            <div style={{ fontFamily:'var(--font-sans)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--text3)', marginBottom:8 }}>{m.label}</div>
            <div style={{ fontSize:24, fontWeight:'normal', letterSpacing:'-0.5px', color:`var(--${m.cls})` }}>{m.val}</div>
            {m.note && <div style={{ fontFamily:'var(--font-sans)', fontSize:11, color:'var(--text3)', marginTop:4 }}>{m.note}</div>}
          </div>
        ))}
      </div>

      {/* Person cards */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:'1.75rem' }} className="fin-cards">
        {[
          { key:'paul',   label:'Paul',   initial:'P', oop:s.pOOP, transfers:s.pTransfers, vendors:s.pVendors, reimbPaid:s.pReimbPaid, reimbPending:s.pReimbPending, barW:`${pp}%`      },
          { key:'jordan', label:'Jordan', initial:'J', oop:s.jOOP, transfers:s.jTransfers, vendors:s.jVendors, reimbPaid:s.jReimbPaid, reimbPending:s.jReimbPending, barW:`${100-pp}%` },
        ].map(p => (
          <div key={p.key} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:18 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div className={`avatar ${p.key}`} style={{ width:38,height:38,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-sans)',fontWeight:500,fontSize:14 }}>
                {p.initial}
              </div>
              <div style={{ fontSize:17 }}>{p.label}</div>
            </div>
            <div style={{ fontSize:26, letterSpacing:'-0.5px', color:`var(--${p.key})`, marginBottom:2 }}>{fmt(p.oop)}</div>
            <div style={{ fontFamily:'var(--font-sans)', fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>out of pocket</div>
            <div style={{ height:4, background:'var(--surface2)', borderRadius:99, marginBottom:14, overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:99, width:p.barW, background:`var(--${p.key})` }} />
            </div>
            <div style={{ borderTop:'1px solid var(--border)' }}>
              {[
                ['Shared account transfers',    fmt(p.transfers),  false],
                ['Personal vendor payments',     fmt(p.vendors),    false],
                ['Reimbursements paid out',      fmt(p.reimbPaid),  false],
                ['Reimbursements still owed',    p.reimbPending>0 ? fmt(p.reimbPending)+' owed' : '—', p.reimbPending>0],
              ].map(([label, val, isPending]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px solid var(--border)', fontFamily:'var(--font-sans)', fontSize:13 }}
                  className="card-last-no-border">
                  <span style={{ color:'var(--text2)' }}>{label}</span>
                  <span style={{ fontWeight:500, color: isPending ? 'var(--amber)' : 'var(--text)' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Transactions table */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <div style={{ fontFamily:'var(--font-serif)', fontSize:20, fontWeight:400 }}>Transactions</div>
        <button className="btn btn-ghost" onClick={() => setModal(true)}>+ Add transaction</button>
      </div>

      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', overflow:'auto', marginBottom:'2rem' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'var(--font-sans)', fontSize:13, minWidth:620 }}>
          <thead>
            <tr>
              {['Date','Description','Category','Amount','Paid by','Split','Reimbursement',''].map((h, i) => (
                <th key={i} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--text3)', background:'var(--surface2)', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(t => {
              const pc = t.paid==='Paul'?'paul':t.paid==='Jordan'?'jordan':'shared'
              const sc = t.split==='paul'?'paul':t.split==='jordan'?'jordan':'shared'
              const sl = t.split==='paul'?'Paul':t.split==='jordan'?'Jordan':'Shared'
              return (
                <tr key={t.id} onMouseEnter={e=>e.currentTarget.querySelectorAll('td').forEach(td=>td.style.background='var(--surface2)')}
                  onMouseLeave={e=>e.currentTarget.querySelectorAll('td').forEach(td=>td.style.background='')}>
                  <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)', color:'var(--text3)', fontSize:12 }}>{fmtDate(t.date)}</td>
                  <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)', fontWeight:500 }}>{t.desc}</td>
                  <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)' }}><span className="chip neutral">{t.cat}</span></td>
                  <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)', fontWeight:500 }}>{fmt(t.cost)}</td>
                  <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)' }}><span className={`chip ${pc}`}>{t.paid}</span></td>
                  <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)' }}><span className={`chip ${sc}`}>{sl}</span></td>
                  <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)' }}>
                    {t.reimb === 'na'
                      ? <span className="chip neutral">—</span>
                      : <button
                          onClick={() => toggleReimb(t.id)}
                          style={{
                            background:'none', border:'none', borderRadius:99, cursor:'pointer',
                            padding:'3px 10px', fontFamily:'var(--font-sans)', fontSize:11, fontWeight:500,
                            background: t.reimb==='paid' ? 'var(--green-light)' : 'var(--amber-light)',
                            color:      t.reimb==='paid' ? 'var(--green-text)'  : 'var(--amber-text)',
                          }}
                        >
                          {t.reimb==='paid' ? 'Reimbursed ✓' : 'Pending'}
                        </button>
                    }
                  </td>
                  <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)' }}>
                    <button onClick={() => delTxn(t.id)}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:16, padding:'2px 5px', borderRadius:4, lineHeight:1 }}
                      onMouseEnter={e=>e.currentTarget.style.color='var(--red)'}
                      onMouseLeave={e=>e.currentTarget.style.color='var(--text3)'}
                    >×</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && <AddModal onClose={() => setModal(false)} onSave={addTxn} />}

      <style>{`
        .avatar.paul   { background: var(--paul-light);   color: var(--paul-text);   }
        .avatar.jordan { background: var(--jordan-light); color: var(--jordan-text); }
        .overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:200; align-items:center; justify-content:center; }
        .overlay.open { display:flex; }
        .modal { background:var(--surface); border-radius:var(--radius); border:1px solid var(--border); padding:24px; width:420px; max-width:95vw; max-height:92vh; overflow-y:auto; }
        .modal-title { font-family:var(--font-serif); font-size:22px; margin-bottom:20px; font-weight:400; }
        .field { margin-bottom:14px; }
        .field label { display:block; font-family:var(--font-sans); font-size:11px; font-weight:500; text-transform:uppercase; letter-spacing:0.07em; color:var(--text2); margin-bottom:5px; }
        .field input, .field select { width:100%; padding:9px 11px; border:1px solid var(--border2); border-radius:var(--radius-sm); background:var(--surface); color:var(--text); font-size:14px; font-family:var(--font-sans); }
        .field-hint { font-family:var(--font-sans); font-size:11px; color:var(--text3); margin-top:5px; }
        .modal-actions { display:flex; gap:8px; justify-content:flex-end; margin-top:20px; }
        @media (max-width:600px) { .fin-metrics { grid-template-columns:repeat(2,1fr) !important; } }
        @media (max-width:500px) { .fin-cards   { grid-template-columns:1fr !important; } }
      `}</style>
    </div>
  )
}
