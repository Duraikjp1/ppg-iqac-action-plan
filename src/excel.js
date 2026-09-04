import * as XLSX from 'xlsx';
import { getUpcomingMonthName, getAcademicYear, formatDisplayDate, getYearMonthForId } from './date.js';

export function generateConsolidatedExcel(allSubmissions) {
  const monthName = getUpcomingMonthName();
  const academicYear = getAcademicYear();
  const ym = getYearMonthForId();

  const rows = [];

  rows.push(['PPG COLLEGE OF ARTS AND SCIENCE']);
  rows.push(['(Affiliated To Bharathiar University)']);
  rows.push(['COIMBATORE - 35']);
  rows.push([]);
  rows.push([`ACTION PLAN FOR ${monthName}`]);
  rows.push([`Academic Year: ${academicYear}`]);
  rows.push([]);

  const sorted = [...allSubmissions].sort((a, b) => {
    if (a.department < b.department) return -1;
    if (a.department > b.department) return 1;
    if (a.tentativeDate < b.tentativeDate) return -1;
    if (a.tentativeDate > b.tentativeDate) return 1;
    return 0;
  });

  rows.push([
    'S.NO', 'DEPARTMENT / CLUB', 'TENTATIVE DATE', 'NAME OF EVENT',
    'RESOURCE PERSON', 'VENUE', 'NATURE / TYPE', 'MODE',
    'BENEFICIARY', 'BUDGET'
  ]);

  sorted.forEach((row, i) => {
    rows.push([
      i + 1,
      row.department,
      formatDisplayDate(row.tentativeDate),
      row.nameOfEvent,
      row.resourcePerson || '',
      row.venue,
      row.natureType === 'Other' ? row.otherNatureType : row.natureType,
      row.mode,
      row.beneficiary,
      row.budget || ''
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws['!cols'] = [
    { wch: 6 }, { wch: 30 }, { wch: 18 }, { wch: 35 },
    { wch: 30 }, { wch: 25 }, { wch: 22 }, { wch: 10 },
    { wch: 30 }, { wch: 15 }
  ];

  ws['!freeze'] = { xSplit: 0, ySplit: 9 };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'MASTER ACTION PLAN');

  XLSX.writeFile(wb, `PPG_IQAC_Action_Plan_${ym}.xlsx`);
}

export function generatePrintHTML(data) {
  const monthName = getUpcomingMonthName();
  const academicYear = getAcademicYear();

  let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Action Plan - ${data.department}</title>
<style>
  @page { size: A4 landscape; margin: 15mm; }
  body { font-family: 'Noto Sans Tamil', 'Nirmala UI', sans-serif; margin: 0; padding: 20px; font-size: 12px; }
  .header { text-align: center; margin-bottom: 15px; }
  .header h2 { margin: 0; font-size: 16px; }
  .header p { margin: 2px 0; font-size: 12px; }
  .info { margin-bottom: 10px; font-size: 12px; }
  .info p { margin: 3px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
  th { background: #1a3a5c; color: #fff; font-weight: bold; }
  tr:nth-child(even) { background: #f5f5f5; }
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

  (data.events || []).forEach((evt, i) => {
    const nt = evt.natureType === 'Other' ? (evt.otherNatureType || '') : (evt.natureType || '');
    html += `<tr>
  <td>${i + 1}</td>
  <td>${formatDisplayDate(evt.tentativeDate)}</td>
  <td>${evt.nameOfEvent || ''}</td>
  <td>${evt.resourcePerson || ''}</td>
  <td>${evt.venue || ''}</td>
  <td>${nt}</td>
  <td>${evt.mode || ''}</td>
  <td>${evt.beneficiary || ''}</td>
  <td>${evt.budget || ''}</td>
</tr>`;
  });

  html += `</tbody></table></body></html>`;
  return html;
}
