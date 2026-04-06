import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase.js'

const COLS   = ['todo', 'inprogress', 'done']
const LABELS = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' }
const CATS   = ['venue','catering','flowers','music','photo','attire','general']
const ASSIGNEES = [
  { value: '',  label: 'Unassigned', cls: '' },
  { value: 'P', label: 'Paul',       cls: 'cl-a-p' },
  { value: 'J', label: 'Jordan',     cls: 'cl-a-j' },
  { value: 'W', label: 'Planner',    cls: 'cl-a-w' },
]
const PRIORITIES = ['high','medium','low']
const BLANK_FORM = { title:'', category:'general', priority:'medium', assignee:'', due_date:'' }

export default function Checklist() {
  const [tasks,    setTasks]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [form,     setForm]     = useState(BLANK_FORM)
  const dragId  = useRef(null)
  const [overCol, setOverCol]   = useState(null)

  useEffect(() => { fetchTasks() }, [])

  async function fetchTasks() {
    setLoading(true)
    const { data } = await supabase
      .from('checklist_tasks')
      .select('*')
      .order('position')
      .order('created_at')
    if (data) setTasks(data)
    setLoading(false)
  }

  function openAdd() {
    setEditTask(null)
    setForm(BLANK_FORM)
    setModal(true)
  }

  function openEdit(task) {
    setEditTask(task)
    setForm({
      title:    task.title,
      category: task.category,
      priority: task.priority,
      assignee: task.assignee || '',
      due_date: task.due_date || '',
    })
    setModal(true)
  }

  function closeModal() {
    setModal(false)
    setEditTask(null)
    setForm(BLANK_FORM)
  }

  async function saveTask() {
    if (!form.title.trim()) return
    setSaving(true)
    if (editTask) {
      setTasks(ts => ts.map(t => t.id === editTask.id ? { ...t, ...form } : t))
      await supabase.from('checklist_tasks').update(form).eq('id', editTask.id)
    } else {
      const maxPos = tasks
        .filter(t => t.col === 'todo')
        .reduce((m, t) => Math.max(m, t.position || 0), 0)
      const { data } = await supabase
        .from('checklist_tasks')
        .insert([{ ...form, col: 'todo', position: maxPos + 1 }])
        .select()
        .single()
      if (data) setTasks(ts => [...ts, data])
    }
    closeModal()
    setSaving(false)
  }

  async function deleteTask(id) {
    setTasks(ts => ts.filter(t => t.id !== id))
    await supabase.from('checklist_tasks').delete().eq('id', id)
  }

  async function moveTask(id, newCol) {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, col: newCol } : t))
    await supabase.from('checklist_tasks').update({ col: newCol }).eq('id', id)
  }

  function onDragStart(e, id) { dragId.current = id; e.dataTransfer.effectAllowed = 'move' }
  function onDragEnd()        { dragId.current = null; setOverCol(null) }
  function onDragOver(e, col) { e.preventDefault(); setOverCol(col) }
  function onDrop(e, col)     { e.preventDefault(); if (dragId.current) moveTask(dragId.current, col); setOverCol(null) }

  const byCol = col => tasks.filter(t => t.col === col)
  const getAssignee = val => ASSIGNEES.find(a => a.value === val)

  return (
    <div className="page-content">
      <div className="page-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 className="page-title">Checklist</h1>
          <p className="page-subtitle">Drag tasks between columns to update status</p>
        </div>
        <button className="cl-add-btn" onClick={openAdd}>+ Add task</button>
      </div>

      {loading ? (
        <div style={{ padding:'48px 0', textAlign:'center', color:'var(--text3)', fontFamily:'var(--font-sans)', fontSize:14 }}>Loading…</div>
      ) : (
        <div className="cl-board">
          {COLS.map(col => (
            <div
              key={col}
              className={`cl-col${overCol === col ? ' cl-col-over' : ''}`}
              onDragOver={e => onDragOver(e, col)}
              onDrop={e => onDrop(e, col)}
            >
              <div className="cl-col-header">
                <span className="cl-col-title">{LABELS[col]}</span>
                <span className="cl-col-count">{byCol(col).length}</span>
              </div>

              {byCol(col).length === 0 && (
                <div className="cl-empty">Drop here</div>
              )}

              {byCol(col).map(task => (
                <div
                  key={task.id}
                  className={`cl-card${dragId.current === task.id ? ' cl-card-dragging' : ''}`}
                  draggable
                  onDragStart={e => onDragStart(e, task.id)}
                  onDragEnd={onDragEnd}
                  onClick={() => openEdit(task)}
                >
                  <div className="cl-card-top">
                    <span className="cl-card-title">{task.title}</span>
                    <button className="cl-delete" onClick={e => { e.stopPropagation(); deleteTask(task.id) }}>×</button>
                  </div>
                  <div className="cl-meta">
                    <div className={`cl-dot cl-dot-${task.priority}`} title={task.priority} />
                    <span className={`cl-tag cl-tag-${task.category}`}>{task.category}</span>
                    {task.due_date && <span className="cl-due">{task.due_date}</span>}
                    {task.assignee && (
                      <div className={`cl-assignee ${getAssignee(task.assignee)?.cls || ''}`}>
                        {task.assignee}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="cl-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="cl-modal">
            <div className="cl-modal-title">{editTask ? 'Edit task' : 'New task'}</div>
            <div className="cl-field">
              <label>Task</label>
              <input
                autoFocus
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && saveTask()}
                placeholder="What needs to be done?"
              />
            </div>
            <div className="cl-field-grid">
              <div className="cl-field">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="cl-field">
                <label>Priority</label>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="cl-field">
                <label>Assigned to</label>
                <select value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}>
                  {ASSIGNEES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
              <div className="cl-field">
                <label>Due (YYYY-MM)</label>
                <input
                  value={form.due_date}
                  onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                  placeholder="2027-06"
                />
              </div>
            </div>
            <div className="cl-modal-actions">
              <button className="cl-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="cl-btn-save" onClick={saveTask} disabled={saving}>
                {saving ? 'Saving…' : editTask ? 'Save changes' : 'Add task'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .cl-add-btn {
          display: flex; align-items: center; gap: 6px;
          background: var(--text); color: var(--bg);
          border: none; border-radius: var(--radius);
          padding: 9px 16px; font-size: 13px; font-weight: 500;
          font-family: var(--font-sans); cursor: pointer;
          transition: opacity 0.15s;
        }
        .cl-add-btn:hover { opacity: 0.8; }

        .cl-board {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        @media (max-width: 700px) { .cl-board { grid-template-columns: 1fr; } }

        .cl-col {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 12px;
          min-height: 280px;
          transition: background 0.12s, border-color 0.12s;
        }
        .cl-col-over {
          background: var(--surface2);
          border-color: var(--paul);
        }

        .cl-col-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 12px;
        }
        .cl-col-title {
          font-family: var(--font-sans); font-size: 11px; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.08em; color: var(--text3);
        }
        .cl-col-count {
          font-size: 12px; font-weight: 500;
          background: var(--bg); border: 1px solid var(--border);
          border-radius: 20px; padding: 1px 8px; color: var(--text3);
          font-family: var(--font-sans);
        }

        .cl-empty {
          display: flex; align-items: center; justify-content: center;
          height: 72px;
          border: 1px dashed var(--border);
          border-radius: var(--radius);
          color: var(--text3); font-size: 13px; font-family: var(--font-sans);
        }

        .cl-card {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 10px 12px;
          margin-bottom: 8px;
          cursor: grab;
          transition: border-color 0.1s, opacity 0.1s;
          user-select: none;
        }
        .cl-card:hover { border-color: var(--border2); }
        .cl-card-dragging { opacity: 0.3; cursor: grabbing; }

        .cl-card-top {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
        }
        .cl-card-title {
          font-family: var(--font-sans); font-size: 14px; color: var(--text); line-height: 1.4; flex: 1;
        }
        .cl-delete {
          background: none; border: none; cursor: pointer;
          color: var(--text3); font-size: 18px; line-height: 1;
          padding: 0; opacity: 0; transition: opacity 0.15s; flex-shrink: 0;
        }
        .cl-card:hover .cl-delete { opacity: 1; }
        .cl-delete:hover { color: #E24B4A; }

        .cl-meta {
          display: flex; align-items: center; gap: 6px; margin-top: 8px; flex-wrap: wrap;
        }
        .cl-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .cl-dot-high   { background: #E24B4A; }
        .cl-dot-medium { background: #EF9F27; }
        .cl-dot-low    { background: #639922; }

        .cl-tag {
          font-size: 11px; font-weight: 500; padding: 2px 8px;
          border-radius: 20px; font-family: var(--font-sans);
        }
        .cl-tag-venue    { background:#EEEDFE; color:#3C3489; }
        .cl-tag-catering { background:#FAEEDA; color:#633806; }
        .cl-tag-flowers  { background:#FBEAF0; color:#72243E; }
        .cl-tag-music    { background:#E1F5EE; color:#085041; }
        .cl-tag-photo    { background:#E6F1FB; color:#0C447C; }
        .cl-tag-attire   { background:#FAECE7; color:#712B13; }
        .cl-tag-general  { background:#F1EFE8; color:#444441; }

        .cl-due {
          font-size: 11px; color: var(--text3); font-family: var(--font-sans);
        }
        .cl-assignee {
          width: 20px; height: 20px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 500; flex-shrink: 0;
          font-family: var(--font-sans);
        }
        .cl-a-p { background:#EEEDFE; color:#3C3489; }
        .cl-a-j { background:#FBEAF0; color:#72243E; }
        .cl-a-w { background:#FAEEDA; color:#633806; }

        .cl-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center;
          z-index: 999;
        }
        .cl-modal {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.5rem; width: 380px; max-width: calc(100vw - 2rem);
        }
        .cl-modal-title {
          font-family: var(--font-serif); font-size: 20px; font-weight: 400;
          color: var(--text); margin-bottom: 1.25rem;
        }
        .cl-field { margin-bottom: 12px; }
        .cl-field label {
          display: block; font-size: 11px; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--text3); margin-bottom: 4px;
          font-family: var(--font-sans);
        }
        .cl-field input, .cl-field select {
          width: 100%; font-size: 14px; padding: 8px 10px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: var(--bg); color: var(--text);
          font-family: var(--font-sans);
        }
        .cl-field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .cl-modal-actions {
          display: flex; gap: 8px; justify-content: flex-end; margin-top: 1.25rem;
        }
        .cl-btn-cancel {
          background: none; border: 1px solid var(--border);
          border-radius: var(--radius); padding: 8px 14px;
          font-size: 13px; cursor: pointer; color: var(--text2);
          font-family: var(--font-sans);
        }
        .cl-btn-cancel:hover { background: var(--surface); }
        .cl-btn-save {
          background: var(--text); color: var(--bg);
          border: none; border-radius: var(--radius);
          padding: 8px 18px; font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: var(--font-sans);
        }
        .cl-btn-save:hover { opacity: 0.8; }
        .cl-btn-save:disabled { opacity: 0.5; cursor: default; }
      `}</style>
    </div>
  )
}
