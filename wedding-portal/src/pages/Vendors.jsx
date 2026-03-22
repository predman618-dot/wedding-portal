export default function Vendors() {
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Vendors</h1>
          <p className="page-subtitle">Contacts, contracts &amp; payment receipts</p>
        </div>
      </div>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '48px 32px',
        textAlign: 'center',
        color: 'var(--text3)',
        fontFamily: 'var(--font-sans)',
        fontSize: 14,
      }}>
        <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>◎</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--text2)', marginBottom: 6 }}>Coming soon</div>
        <div>Vendor tracker with document storage is up next.</div>
      </div>
    </div>
  )
}
