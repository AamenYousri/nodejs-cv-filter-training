const API = '/api/cvs';

const form       = document.getElementById('cv-form');
const formTitle  = document.getElementById('form-title');
const editIdEl   = document.getElementById('edit-id');
const submitBtn  = document.getElementById('submit-btn');
const cancelBtn  = document.getElementById('cancel-btn');
const formMsg    = document.getElementById('form-msg');
const cvList     = document.getElementById('cv-list');

// ── helpers ──────────────────────────────────────────────────────────────────

function showMsg(text, type = 'success') {
  formMsg.textContent = text;
  formMsg.className   = `msg ${type}`;
  formMsg.classList.remove('hidden');
  setTimeout(() => formMsg.classList.add('hidden'), 3500);
}

function resetForm() {
  form.reset();
  editIdEl.value = '';
  formTitle.textContent = 'Add New CV';
  submitBtn.textContent = 'Save CV';
  cancelBtn.classList.add('hidden');
}

function buildSkillTags(skillsText) {
  if (!skillsText) return '';
  return skillsText
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => `<span class="tag">${s}</span>`)
    .join('');
}

// ── render ────────────────────────────────────────────────────────────────────

function renderCVs(cvs) {
  if (!cvs.length) {
    cvList.innerHTML = '<p class="empty-msg">No CVs yet. Add one above!</p>';
    return;
  }

  cvList.innerHTML = cvs.map(cv => `
    <div class="cv-item" data-id="${cv.id}">
      <div class="cv-item-header">
        <h3>${escHtml(cv.name)}</h3>
        <div class="cv-item-actions">
          <button class="edit-btn"   onclick="startEdit(${cv.id})">Edit</button>
          <button class="danger"     onclick="deleteCV(${cv.id})">Delete</button>
        </div>
      </div>
      <div class="cv-meta">
        <span><span class="label">Email:</span> ${escHtml(cv.email)}</span>
        ${cv.phone ? `<span><span class="label">Phone:</span> ${escHtml(cv.phone)}</span>` : ''}
      </div>
      ${cv.skills ? `<div class="cv-skills">${buildSkillTags(cv.skills)}</div>` : ''}
      ${cv.experience ? `<p class="cv-meta" style="margin-top:8px">${escHtml(cv.experience)}</p>` : ''}
    </div>
  `).join('');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── API calls ─────────────────────────────────────────────────────────────────

async function loadCVs() {
  try {
    const res  = await fetch(API);
    const data = await res.json();
    renderCVs(data);
  } catch {
    cvList.innerHTML = '<p class="empty-msg" style="color:#e74c3c">Failed to load CVs.</p>';
  }
}

async function startEdit(id) {
  try {
    const res = await fetch(`${API}/${id}`);
    const cv  = await res.json();

    document.getElementById('name').value       = cv.name       || '';
    document.getElementById('email').value      = cv.email      || '';
    document.getElementById('phone').value      = cv.phone      || '';
    document.getElementById('skills').value     = cv.skills     || '';
    document.getElementById('experience').value = cv.experience || '';
    editIdEl.value = cv.id;

    formTitle.textContent = 'Edit CV';
    submitBtn.textContent = 'Update CV';
    cancelBtn.classList.remove('hidden');

    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
  } catch {
    showMsg('Could not load CV for editing.', 'error');
  }
}

async function deleteCV(id) {
  if (!confirm('Delete this CV?')) return;
  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    showMsg('CV deleted.');
    loadCVs();
  } catch {
    showMsg('Failed to delete CV.', 'error');
  }
}

// ── form submit ───────────────────────────────────────────────────────────────

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name:       document.getElementById('name').value.trim(),
    email:      document.getElementById('email').value.trim(),
    phone:      document.getElementById('phone').value.trim(),
    skills:     document.getElementById('skills').value.trim(),
    experience: document.getElementById('experience').value.trim(),
  };

  const id     = editIdEl.value;
  const method = id ? 'PUT' : 'POST';
  const url    = id ? `${API}/${id}` : API;

  try {
    const res  = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      showMsg(data.error || 'Something went wrong.', 'error');
      return;
    }

    showMsg(id ? 'CV updated successfully.' : 'CV added successfully.');
    resetForm();
    loadCVs();
  } catch {
    showMsg('Network error. Please try again.', 'error');
  }
});

cancelBtn.addEventListener('click', resetForm);

// ── init ──────────────────────────────────────────────────────────────────────
loadCVs();
