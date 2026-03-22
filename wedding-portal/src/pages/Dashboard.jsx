import { Link } from 'react-router-dom'

const WEDDING_DATE = new Date('2026-10-10T17:00:00')

function daysUntil(date) {
  const now = new Date()
  const diff = date - now
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

const QUICK_STATS = [
  { label: 'Days to go',       value: daysUntil(WEDDING_DATE), note: 'October 10, 2026',  color: 'var(--text)' },
  { label: 'Budget used',      value: '27%',                   note: '$13,450 of $50,000', color: 'var(--green)' },
  { label: 'Vendors booked',   value: '4',                     note: '3 still needed',     color: 'var(--paul)' },
  { label: 'Guests confirmed', value: '—',                     note: 'Not started yet',    color: 'var(--text3)' },
]

const SHORTCUTS = [
  { to: '/finance',   label: 'Finance Tracker',  desc: 'Expenses, splits & reimbursements', icon: '◈' },
  { to: '/vendors',   label: 'Vendor Tracker',   desc: 'Contacts, contracts & payments',    icon: '◎' },
  { to: '/checklist', label: 'Checklist',        desc: 'Tasks & timeline by month',         icon: '✦' },
  { to: '/guests',    label: 'Guest List',       desc: 'RSVPs, dietary needs & seating',    icon: '◇' },
]

export default function Dashboard() {
  const days = daysUntil(WEDDING_DATE)

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Good to see you.</h1>
          <p className="page-subtitle">Everything for the big day, in one place.</p>
        </div>
      </div>

      {/* Countdown hero */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '28px 28px 24px',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text3)', marginBottom: 10 }}>
            Time remaining
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 56, fontWeight: 300, letterSpacing: '-2px', lineHeight: 1, color: 'var(--text)' }}>
            {days}
            <span style={{ fontSize: 24, color: 'var(--text3)', marginLeft: 8, fontFamily: 'var(--font-sans)', fontWeight: 300, letterSpacing: 0 }}>days</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, color: 'var(--text2)', fontStyle: 'italic' }}>
            October 10, 2026
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
            Your wedding day
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 10,
        marginBottom: '1.5rem',
      }}
        className="dash-stats"
      >
        {QUICK_STATS.map(s => (
          <div key={s.label} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '16px',
          }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text3)', marginBottom: 8 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 26, fontFamily: 'var(--font-serif)', fontWeight: 400, letterSpacing: '-0.5px', color: s.color }}>
              {s.value}
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
              {s.note}
            </div>
          </div>
        ))}
      </div>

      {/* Page shortcuts */}
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text3)', marginBottom: 10 }}>
          Pages
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }} className="dash-shortcuts">
          {SHORTCUTS.map(s => (
            <Link key={s.to} to={s.to} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '18px 20px',
                transition: 'background 0.12s, border-color 0.12s',
                cursor: 'pointer',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
              >
                <div style={{ fontSize: 20, marginBottom: 8, opacity: 0.5 }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 400, color: 'var(--text)', marginBottom: 3 }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text3)' }}>
                  {s.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .dash-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .dash-shortcuts { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
