/**
 * TaskFlow — app.js
 * Full CRUD operations on a task list using arrays for storage.
 * Task class with: id, title, description, priority, dueDate, status, createdAt
 */

// ─── Task Class ────────────────────────────────────────────────────────────────
class Task {
  constructor(title, description = '', priority = 'medium', dueDate = '') {
    this.id          = 'TASK-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    this.title       = title.trim();
    this.description = description.trim();
    this.priority    = priority;       // 'low' | 'medium' | 'high'
    this.dueDate     = dueDate;
    this.status      = 'pending';      // 'pending' | 'completed'
    this.createdAt   = new Date().toISOString();
    this.updatedAt   = null;
  }
}

// ─── TaskManager (Data Layer) ──────────────────────────────────────────────────
class TaskManager {
  constructor() {
    this.tasks = this._load();
  }

  // CREATE
  create(title, description, priority, dueDate) {
    if (!title || !title.trim()) throw new Error('Task title is required.');
    const task = new Task(title, description, priority, dueDate);
    this.tasks.push(task);
    this._save();
    return task;
  }

  // READ — all
  readAll() {
    return [...this.tasks];
  }

  // READ — by id
  readById(id) {
    return this.tasks.find(t => t.id === id) || null;
  }

  // READ — filtered + searched
  readFiltered(filter = 'all', query = '') {
    return this.tasks.filter(t => {
      const matchFilter =
        filter === 'all'       ? true :
        filter === 'pending'   ? t.status === 'pending' :
        filter === 'completed' ? t.status === 'completed' : true;

      const q = query.toLowerCase().trim();
      const matchSearch = !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.priority.toLowerCase().includes(q);

      return matchFilter && matchSearch;
    });
  }

  // UPDATE
  update(id, changes) {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Task not found.');
    const allowed = ['title', 'description', 'priority', 'dueDate', 'status'];
    allowed.forEach(key => {
      if (changes[key] !== undefined) {
        if (key === 'title' && !changes[key].trim()) throw new Error('Title cannot be empty.');
        this.tasks[idx][key] = typeof changes[key] === 'string' ? changes[key].trim() : changes[key];
      }
    });
    this.tasks[idx].updatedAt = new Date().toISOString();
    this._save();
    return this.tasks[idx];
  }

  // TOGGLE status
  toggleStatus(id) {
    const task = this.readById(id);
    if (!task) throw new Error('Task not found.');
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    return this.update(id, { status: newStatus });
  }

  // DELETE
  delete(id) {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Task not found.');
    const [removed] = this.tasks.splice(idx, 1);
    this._save();
    return removed;
  }

  // Stats
  getStats() {
    return {
      total:     this.tasks.length,
      pending:   this.tasks.filter(t => t.status === 'pending').length,
      completed: this.tasks.filter(t => t.status === 'completed').length,
    };
  }

  // LocalStorage persistence
  _save() {
    try { localStorage.setItem('taskflow_tasks', JSON.stringify(this.tasks)); } catch {}
  }
  _load() {
    try {
      const raw = localStorage.getItem('taskflow_tasks');
      return raw ? JSON.parse(raw) : this._seed();
    } catch { return this._seed(); }
  }
  _seed() {
    return [
      Object.assign(new Task('Design landing page', 'Create wireframes and mockups for the new homepage.', 'high', futureDate(2)),   { status: 'pending' }),
      Object.assign(new Task('Write unit tests',    'Cover all CRUD methods with at least 80% coverage.',   'medium', futureDate(5)), { status: 'pending' }),
      Object.assign(new Task('Setup CI/CD pipeline','Configure GitHub Actions for automated deployment.',     'low', futureDate(7)),  { status: 'completed' }),
    ];
  }
}

function futureDate(days) {
  const d = new Date(); d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// ─── App State ─────────────────────────────────────────────────────────────────
const manager     = new TaskManager();
let currentFilter = 'all';

// ─── CRUD UI Handlers ──────────────────────────────────────────────────────────

/** CREATE */
function createTask() {
  const title    = document.getElementById('task-title').value;
  const desc     = document.getElementById('task-desc').value;
  const priority = document.getElementById('task-priority').value;
  const due      = document.getElementById('task-due').value;

  try {
    manager.create(title, desc, priority, due);
    document.getElementById('task-title').value = '';
    document.getElementById('task-desc').value  = '';
    document.getElementById('task-due').value   = '';
    renderTasks();
    updateStats();
    showToast('✓ Task created successfully!', 'success');
  } catch (e) {
    showToast('✗ ' + e.message, 'error');
    document.getElementById('task-title').focus();
  }
}

/** READ + RENDER */
function renderTasks() {
  const query  = document.getElementById('search-input').value;
  const tasks  = manager.readFiltered(currentFilter, query);
  const list   = document.getElementById('task-list');
  const empty  = document.getElementById('empty-state');

  // Clear existing cards (keep empty state node)
  [...list.querySelectorAll('.task-card')].forEach(el => el.remove());

  if (tasks.length === 0) {
    empty.style.display = 'flex';
    empty.querySelector('p').textContent =
      query ? `No tasks match "${query}".` : 'No tasks here. Create one above!';
    return;
  }

  empty.style.display = 'none';

  // Render newest first
  [...tasks].reverse().forEach((task, i) => {
    const card = buildCard(task, i);
    list.appendChild(card);
  });
}

function buildCard(task, delay) {
  const isOverdue = task.dueDate && task.dueDate < today() && task.status !== 'completed';
  const card = document.createElement('div');
  card.className = `task-card${task.status === 'completed' ? ' completed' : ''}`;
  card.dataset.priority = task.priority;
  card.dataset.id       = task.id;
  card.style.animationDelay = (delay * 0.05) + 's';

  card.innerHTML = `
    <div class="task-check${task.status === 'completed' ? ' checked' : ''}"
         onclick="toggleTask('${task.id}')" title="Toggle status"></div>
    <div class="task-body">
      <div class="task-title">${escHtml(task.title)}</div>
      ${task.description ? `<div class="task-desc">${escHtml(task.description)}</div>` : ''}
      <div class="task-meta">
        <span class="tag tag--${task.priority}">${task.priority}</span>
        <span class="tag tag--${task.status === 'completed' ? 'done' : 'pending'}">
          ${task.status === 'completed' ? '✅ done' : '⏳ pending'}
        </span>
        ${task.dueDate ? `<span class="tag tag--${isOverdue ? 'overdue' : 'due'}">
          ${isOverdue ? '⚠' : '📅'} ${formatDate(task.dueDate)}
        </span>` : ''}
      </div>
      <div class="task-id">${task.id} · created ${formatDate(task.createdAt.split('T')[0])}</div>
    </div>
    <div class="task-actions">
      <button class="icon-btn edit-btn" onclick="openEditModal('${task.id}')" title="Edit task">✎</button>
      <button class="icon-btn del-btn"  onclick="deleteTask('${task.id}')"    title="Delete task">✕</button>
    </div>
  `;
  return card;
}

/** TOGGLE STATUS */
function toggleTask(id) {
  const task = manager.toggleStatus(id);
  renderTasks();
  updateStats();
  showToast(task.status === 'completed' ? '✅ Marked as completed!' : '⏳ Marked as pending', 'info');
}

/** UPDATE — open modal */
function openEditModal(id) {
  const task = manager.readById(id);
  if (!task) return;
  document.getElementById('edit-id').value       = task.id;
  document.getElementById('edit-title').value    = task.title;
  document.getElementById('edit-desc').value     = task.description;
  document.getElementById('edit-priority').value = task.priority;
  document.getElementById('edit-due').value      = task.dueDate || '';
  document.getElementById('edit-status').value   = task.status;
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('modal-overlay') && !e.currentTarget.classList.contains('modal-close')) return;
  document.getElementById('modal-overlay').classList.remove('open');
}

function updateTask() {
  const id = document.getElementById('edit-id').value;
  try {
    manager.update(id, {
      title:       document.getElementById('edit-title').value,
      description: document.getElementById('edit-desc').value,
      priority:    document.getElementById('edit-priority').value,
      dueDate:     document.getElementById('edit-due').value,
      status:      document.getElementById('edit-status').value,
    });
    document.getElementById('modal-overlay').classList.remove('open');
    renderTasks();
    updateStats();
    showToast('✎ Task updated successfully!', 'warning');
  } catch (e) {
    showToast('✗ ' + e.message, 'error');
  }
}

/** DELETE */
function deleteTask(id) {
  const task = manager.readById(id);
  if (!task) return;
  const card = document.querySelector(`.task-card[data-id="${id}"]`);
  if (card) {
    card.style.transition = 'all 0.25s ease';
    card.style.opacity    = '0';
    card.style.transform  = 'translateX(30px)';
    setTimeout(() => { manager.delete(id); renderTasks(); updateStats(); }, 260);
  }
  showToast(`🗑 "${task.title}" deleted.`, 'error');
}

/** FILTER */
function filterTasks(btn, filter) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = filter;
  renderTasks();
}

/** STATS */
function updateStats() {
  const s = manager.getStats();
  animateNumber('stat-total',   s.total);
  animateNumber('stat-pending', s.pending);
  animateNumber('stat-done',    s.completed);
}

function animateNumber(id, target) {
  const el   = document.getElementById(id);
  const from = parseInt(el.textContent) || 0;
  const diff = target - from;
  if (diff === 0) return;
  const steps = 12;
  let step = 0;
  const iv = setInterval(() => {
    step++;
    el.textContent = Math.round(from + diff * (step / steps));
    if (step >= steps) { el.textContent = target; clearInterval(iv); }
  }, 18);
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent  = msg;
  t.className    = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function today() { return new Date().toISOString().split('T')[0]; }
function formatDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

// ─── Keyboard Shortcuts ────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.activeElement === document.getElementById('task-title')) {
    createTask();
  }
  if (e.key === 'Escape') {
    document.getElementById('modal-overlay').classList.remove('open');
  }
});

// ─── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  updateStats();
});
