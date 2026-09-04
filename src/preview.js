import { formatDisplayDate, getUpcomingMonthName, getAcademicYear } from './date.js';

function safeText(str) {
  if (!str) return '';
  return String(str);
}

export function renderPreview(container, data) {
  const monthName = getUpcomingMonthName();
  const academicYear = getAcademicYear();

  let html = `
    <div class="preview-doc">
      <div class="preview-header">
        <h2>PPG COLLEGE OF ARTS AND SCIENCE</h2>
        <p class="preview-affiliation">(Affiliated To Bharathiar University)</p>
        <p>COIMBATORE - 35</p>
      </div>
      <div class="preview-title">
        <h3>ACTION PLAN FOR ${monthName}</h3>
        <p><strong>Academic Year:</strong> ${academicYear}</p>
        <p><strong>Department:</strong> ${safeText(data.department)}${data.department === 'Other' && data.otherDepartment ? ' - ' + safeText(data.otherDepartment) : ''}</p>
        <p><strong>Semester:</strong> ${safeText(data.semester)}</p>
      </div>
      <div class="preview-table-wrap">
        <table class="preview-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Tentative Date</th>
              <th>Name of Event</th>
              <th>Resource Person</th>
              <th>Venue</th>
              <th>Nature / Type</th>
              <th>Mode</th>
              <th>Beneficiary</th>
              <th>Budget</th>
            </tr>
          </thead>
          <tbody>
  `;

  (data.events || []).forEach((evt, i) => {
    const nt = evt.natureType === 'Other' ? safeText(evt.otherNatureType) : safeText(evt.natureType);
    html += `
            <tr>
              <td>${i + 1}</td>
              <td>${formatDisplayDate(evt.tentativeDate)}</td>
              <td>${safeText(evt.nameOfEvent)}</td>
              <td>${safeText(evt.resourcePerson)}</td>
              <td>${safeText(evt.venue)}</td>
              <td>${nt}</td>
              <td>${safeText(evt.mode)}</td>
              <td>${safeText(evt.beneficiary)}</td>
              <td>${safeText(evt.budget)}</td>
            </tr>
    `;
  });

  html += `
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;
}
