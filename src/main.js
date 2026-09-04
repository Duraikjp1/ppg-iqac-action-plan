import './styles.css';
import { DEPARTMENTS, NATURE_TYPES, MODES, SEMESTERS } from './departments.js';
import { getUpcomingMonthName, getAcademicYear, getMinDate, getMaxDate } from './date.js';
import { validateForm } from './validation.js';
import { getConfiguration, submitActionPlan } from './api.js';
import { saveDraft, loadDraft, clearDraft } from './storage.js';
import { renderPreview } from './preview.js';

let events = [createEmptyEvent()];
let currentView = 'form';
let isSubmitting = false;

function createEmptyEvent() {
  return {
    tentativeDate: '',
    nameOfEvent: '',
    resourcePerson: '',
    venue: '',
    natureType: '',
    otherNatureType: '',
    mode: '',
    beneficiary: '',
    budget: ''
  };
}

async function init() {
  populateDropdowns();
  await displayActionInfo();
  loadLocalDraft();
  renderEvents();
  bindGlobalEvents();
  updatePreview();
}

function populateDropdowns() {
  const deptSel = document.getElementById('department');
  DEPARTMENTS.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    deptSel.appendChild(opt);
  });

  const semSel = document.getElementById('semester');
  SEMESTERS.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    semSel.appendChild(opt);
  });
}

async function displayActionInfo() {
  document.getElementById('actionMonth').value = getUpcomingMonthName();
  document.getElementById('academicYear').value = getAcademicYear();

  try {
    const config = await getConfiguration();
    if (config && config.actionPlanMonth) {
      document.getElementById('actionMonth').value = config.actionPlanMonth;
    }
    if (config && config.academicYear) {
      document.getElementById('academicYear').value = config.academicYear;
    }
  } catch {
    // keep fallback values from date.js
  }
}

function getFormData() {
  const dept = document.getElementById('department').value;
  return {
    department: dept,
    otherDepartment: document.getElementById('otherDepartment').value.trim(),
    semester: document.getElementById('semester').value,
    events: events
  };
}

function renderEvents() {
  const container = document.getElementById('eventsContainer');
  container.innerHTML = '';

  const minDate = getMinDate();
  const maxDate = getMaxDate();

  events.forEach((evt, i) => {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = `
      <div class="event-number">Event ${i + 1}</div>
      ${events.length > 1 ? `<button type="button" class="btn-remove no-print" data-index="${i}">✕ REMOVE</button>` : ''}
      <div class="event-grid">
        <div class="form-group">
          <label>Tentative Date <span class="required">*</span></label>
          <input type="date" class="evt-field" data-index="${i}" data-field="tentativeDate" value="${evt.tentativeDate}" min="${minDate}" max="${maxDate}">
        </div>
        <div class="form-group">
          <label>Nature / Type <span class="required">*</span></label>
          <select class="evt-field" data-index="${i}" data-field="natureType">
            <option value="">-- Select --</option>
            ${NATURE_TYPES.map(n => `<option value="${n}" ${evt.natureType === n ? 'selected' : ''}>${n}</option>`).join('')}
          </select>
        </div>
        <div class="form-group full-width" id="otherNatureWrap_${i}" style="${evt.natureType === 'Other' ? '' : 'display:none'}">
          <label>Other Nature / Type <span class="required">*</span></label>
          <input type="text" class="evt-field" data-index="${i}" data-field="otherNatureType" value="${escapeAttr(evt.otherNatureType)}" placeholder="Enter nature/type">
        </div>
        <div class="form-group full-width">
          <label>Name of Event <span class="required">*</span></label>
          <input type="text" class="evt-field" data-index="${i}" data-field="nameOfEvent" value="${escapeAttr(evt.nameOfEvent)}" placeholder="Event name (English, Tamil, or both)">
        </div>
        <div class="form-group full-width">
          <label>Resource Person</label>
          <textarea class="evt-field" data-index="${i}" data-field="resourcePerson" rows="2" placeholder="Name, Designation, Organization (optional)">${escapeHtml(evt.resourcePerson)}</textarea>
        </div>
        <div class="form-group full-width">
          <label>Venue <span class="required">*</span></label>
          <input type="text" class="evt-field" data-index="${i}" data-field="venue" value="${escapeAttr(evt.venue)}" placeholder="Venue">
        </div>
        <div class="form-group">
          <label>Mode <span class="required">*</span></label>
          <select class="evt-field" data-index="${i}" data-field="mode">
            <option value="">-- Select --</option>
            ${MODES.map(m => `<option value="${m}" ${evt.mode === m ? 'selected' : ''}>${m}</option>`).join('')}
          </select>
        </div>
        <div class="form-group full-width">
          <label>Beneficiary <span class="required">*</span></label>
          <input type="text" class="evt-field" data-index="${i}" data-field="beneficiary" value="${escapeAttr(evt.beneficiary)}" placeholder="e.g. II B.Sc Computer Science Students">
        </div>
        <div class="form-group">
          <label>Budget</label>
          <input type="text" class="evt-field" data-index="${i}" data-field="budget" value="${escapeAttr(evt.budget)}" placeholder="e.g. 5000, Nil, Sponsored">
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('.evt-field').forEach(el => {
    el.addEventListener('input', onEventFieldChange);
    el.addEventListener('change', onEventFieldChange);
  });

  container.querySelectorAll('.btn-remove').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.index, 10);
      removeEvent(idx);
    });
  });
}

function onEventFieldChange(e) {
  const idx = parseInt(e.target.dataset.index, 10);
  const field = e.target.dataset.field;
  events[idx][field] = e.target.value;

  if (field === 'natureType') {
    const wrap = document.getElementById(`otherNatureWrap_${idx}`);
    if (wrap) wrap.style.display = e.target.value === 'Other' ? '' : 'none';
  }

  autoSaveDraft();
  updatePreview();
}

function addEvent() {
  events.push(createEmptyEvent());
  renderEvents();
  autoSaveDraft();
  updatePreview();
}

function removeEvent(idx) {
  if (events.length <= 1) return;
  events.splice(idx, 1);
  renderEvents();
  autoSaveDraft();
  updatePreview();
}

function bindGlobalEvents() {
  document.getElementById('btnAddEvent').addEventListener('click', addEvent);

  document.getElementById('btnPreview').addEventListener('click', () => {
    showPreview();
  });

  document.getElementById('btnBackToForm').addEventListener('click', () => {
    showForm();
  });

  document.getElementById('btnSubmit').addEventListener('click', handleSubmit);
  document.getElementById('btnSubmitPreview').addEventListener('click', handleSubmit);

  document.getElementById('btnReset').addEventListener('click', handleReset);

  document.getElementById('btnRestoreDraft').addEventListener('click', () => {
    loadLocalDraft();
    renderEvents();
    updatePreview();
    hideRestoreBanner();
  });

  document.getElementById('btnDismissDraft').addEventListener('click', () => {
    clearDraft();
    hideRestoreBanner();
  });

  document.getElementById('btnPrint').addEventListener('click', handlePrint);
  document.getElementById('btnPrintSuccess').addEventListener('click', handlePrint);
  document.getElementById('btnNewSubmission').addEventListener('click', handleNewSubmission);

  document.getElementById('btnConfirmReset').addEventListener('click', () => {
    performReset();
    hideResetModal();
  });

  document.getElementById('btnCancelReset').addEventListener('click', hideResetModal);

  document.getElementById('department').addEventListener('change', (e) => {
    const otherWrap = document.getElementById('otherDeptWrap');
    otherWrap.style.display = e.target.value === 'Other' ? '' : 'none';
    autoSaveDraft();
    updatePreview();
  });

  document.getElementById('otherDepartment').addEventListener('input', () => {
    autoSaveDraft();
    updatePreview();
  });

  document.getElementById('semester').addEventListener('change', () => {
    autoSaveDraft();
    updatePreview();
  });
}

function showPreview() {
  const data = getFormData();
  const previewContainer = document.getElementById('previewContent');
  renderPreview(previewContainer, data);
  document.getElementById('formSection').style.display = 'none';
  document.getElementById('previewSection').style.display = 'block';
  currentView = 'preview';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showForm() {
  document.getElementById('formSection').style.display = 'block';
  document.getElementById('previewSection').style.display = 'none';
  currentView = 'form';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updatePreview() {
  const data = getFormData();
  const previewContainer = document.getElementById('previewContent');
  renderPreview(previewContainer, data);
}

async function handleSubmit() {
  if (isSubmitting) return;

  const data = getFormData();
  const errors = validateForm(data);

  if (errors.length > 0) {
    showErrors(errors);
    return;
  }

  hideErrors();
  isSubmitting = true;
  setSubmitButtons(true, 'SUBMITTING...');

  const payload = {
    department: data.department,
    otherDepartment: data.otherDepartment,
    semester: data.semester,
    events: data.events.map((e, i) => ({
      sno: i + 1,
      tentativeDate: e.tentativeDate,
      nameOfEvent: e.nameOfEvent,
      resourcePerson: e.resourcePerson,
      venue: e.venue,
      natureType: e.natureType,
      otherNatureType: e.otherNatureType,
      mode: e.mode,
      beneficiary: e.beneficiary,
      budget: e.budget
    }))
  };

  const result = await submitActionPlan(payload);

  isSubmitting = false;
  setSubmitButtons(false, 'SUBMIT ACTION PLAN');

  if (result.success) {
    clearDraft();
    showSuccessScreen(result);
  } else {
    if (result.status === 'DUPLICATE') {
      showErrors([result.message || 'Action Plan already submitted for this department and month.']);
    } else if (result.status === 'CLOSED') {
      showErrors([result.message || 'Action Plan submission is currently closed.']);
    } else {
      showErrors([result.message || 'Unable to connect to the server. Please try again.']);
    }
  }
}

function setSubmitButtons(disabled, text) {
  const btn1 = document.getElementById('btnSubmit');
  const btn2 = document.getElementById('btnSubmitPreview');
  if (btn1) { btn1.disabled = disabled; btn1.textContent = text; }
  if (btn2) { btn2.disabled = disabled; btn2.textContent = text; }
}

function showSuccessScreen(result) {
  document.getElementById('formSection').style.display = 'none';
  document.getElementById('previewSection').style.display = 'none';
  document.getElementById('successSection').style.display = 'block';

  const details = document.getElementById('successDetails');
  details.innerHTML = `
    <p><strong>Department:</strong> ${escapeHtml(result.department)}${result.otherDepartment ? ' - ' + escapeHtml(result.otherDepartment) : ''}</p>
    <p><strong>Action Plan Month:</strong> ${escapeHtml(result.actionPlanMonth)}</p>
    <p><strong>Academic Year:</strong> ${escapeHtml(result.academicYear)}</p>
    <p><strong>Number of Events:</strong> ${result.eventCount}</p>
    <p><strong>Submission ID:</strong> ${escapeHtml(result.submissionId)}</p>
    <p><strong>Submitted At:</strong> ${escapeHtml(result.submittedAt)}</p>
  `;

  currentView = 'success';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleNewSubmission() {
  document.getElementById('successSection').style.display = 'none';
  document.getElementById('formSection').style.display = 'block';
  events = [createEmptyEvent()];
  renderEvents();
  updatePreview();
  clearFormFields();
  currentView = 'form';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleReset() {
  document.getElementById('resetModal').classList.add('visible');
}

function hideResetModal() {
  document.getElementById('resetModal').classList.remove('visible');
}

function performReset() {
  events = [createEmptyEvent()];
  renderEvents();
  updatePreview();
  clearFormFields();
  clearDraft();
  hideErrors();
  hideRestoreBanner();
}

function clearFormFields() {
  document.getElementById('department').value = '';
  document.getElementById('otherDepartment').value = '';
  document.getElementById('semester').value = '';
  document.getElementById('otherDeptWrap').style.display = 'none';
}

function handlePrint() {
  const data = getFormData();
  if (currentView !== 'preview') {
    showPreview();
  }
  const printHtml = generatePrintContent(data);
  const win = window.open('', '_blank');
  win.document.write(printHtml);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 300);
}

function generatePrintContent(data) {
  const monthName = getUpcomingMonthName();
  const academicYear = getAcademicYear();

  let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Action Plan - ${data.department}</title>
<style>
  @page { size: A4 landscape; margin: 15mm; }
  body { font-family: 'Noto Sans Tamil', 'Nirmala UI', sans-serif; margin: 0; padding: 15px; font-size: 11px; color: #000; }
  .header { text-align: center; margin-bottom: 12px; }
  .header h2 { margin: 0; font-size: 14px; }
  .header p { margin: 2px 0; font-size: 11px; }
  .info { margin-bottom: 8px; font-size: 11px; }
  .info p { margin: 2px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  th, td { border: 1px solid #333; padding: 5px 6px; text-align: left; }
  th { background: #1a3a5c; color: #fff; font-weight: bold; }
  td { vertical-align: top; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
<div class="header">
  <h2>PPG COLLEGE OF ARTS AND SCIENCE</h2>
  <p>(Affiliated To Bharathiar University)</p>
  <p>COIMBATORE - 35</p>
</div>
<div class="info">
  <p><strong>ACTION PLAN FOR ${monthName}</strong></p>
  <p><strong>Academic Year:</strong> ${academicYear}</p>
  <p><strong>Department:</strong> ${data.department}${data.department === 'Other' && data.otherDepartment ? ' - ' + data.otherDepartment : ''}</p>
  <p><strong>Semester:</strong> ${data.semester}</p>
</div>
<table>
<thead>
<tr>
  <th>S.No</th><th>Tentative Date</th><th>Name of Event</th><th>Resource Person</th>
  <th>Venue</th><th>Nature / Type</th><th>Mode</th><th>Beneficiary</th><th>Budget</th>
</tr>
</thead>
<tbody>`;

  data.events.forEach((evt, i) => {
    const nt = evt.natureType === 'Other' ? evt.otherNatureType : evt.natureType;
    html += `<tr>
  <td>${i + 1}</td>
  <td>${formatPrintDate(evt.tentativeDate)}</td>
  <td>${escapeHtml(evt.nameOfEvent)}</td>
  <td>${escapeHtml(evt.resourcePerson)}</td>
  <td>${escapeHtml(evt.venue)}</td>
  <td>${escapeHtml(nt)}</td>
  <td>${escapeHtml(evt.mode)}</td>
  <td>${escapeHtml(evt.beneficiary)}</td>
  <td>${escapeHtml(evt.budget)}</td>
</tr>`;
  });

  html += `</tbody></table></body></html>`;
  return html;
}

function formatPrintDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function showErrors(errors) {
  const container = document.getElementById('errorContainer');
  container.innerHTML = `<div class="error-list"><ul>${errors.map(e => `<li>${escapeHtml(e)}</li>`).join('')}</ul></div>`;
  container.style.display = 'block';
  window.scrollTo({ top: container.offsetTop - 20, behavior: 'smooth' });
}

function hideErrors() {
  document.getElementById('errorContainer').innerHTML = '';
  document.getElementById('errorContainer').style.display = 'none';
}

function autoSaveDraft() {
  const data = getFormData();
  saveDraft(data);
}

function loadLocalDraft() {
  const draft = loadDraft();
  if (!draft) return;

  if (draft.department) {
    document.getElementById('department').value = draft.department;
    document.getElementById('otherDeptWrap').style.display = draft.department === 'Other' ? '' : 'none';
  }
  if (draft.otherDepartment) {
    document.getElementById('otherDepartment').value = draft.otherDepartment;
  }
  if (draft.semester) {
    document.getElementById('semester').value = draft.semester;
  }
  if (draft.events && draft.events.length > 0) {
    events = draft.events;
  }
  showRestoreBanner();
}

function showRestoreBanner() {
  document.getElementById('restoreBanner').style.display = 'flex';
}

function hideRestoreBanner() {
  document.getElementById('restoreBanner').style.display = 'none';
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

document.addEventListener('DOMContentLoaded', init);
