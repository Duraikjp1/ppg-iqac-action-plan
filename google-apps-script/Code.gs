var SS_ID = '1yYTpnWMj_LnXczdRWGxo8Ex9JX0pNLWNB7H8qR5cHwI';

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'PPG IQAC Action Plan API is running.'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;

    if (action === 'getConfiguration') {
      return handleGetConfiguration();
    }

    if (action === 'submitActionPlan') {
      return handleSubmitActionPlan(body.data);
    }

    return jsonResponse({
      success: false,
      status: 'INVALID_ACTION',
      message: 'Unknown action.'
    });
  } catch (err) {
    return jsonResponse({
      success: false,
      status: 'ERROR',
      message: 'Server error: ' + err.message
    });
  }
}

function testSheetAccess() {
  try {
    var ss = SpreadsheetApp.openById(SS_ID);
    if (!ss) {
      Logger.log('FAILED: openById returned null for ID: ' + SS_ID);
      return 'FAILED: openById returned null';
    }
    Logger.log('SUCCESS: Opened spreadsheet: ' + ss.getName());
    var sheets = ss.getSheets();
    var names = [];
    for (var i = 0; i < sheets.length; i++) {
      names.push(sheets[i].getName());
    }
    Logger.log('Sheets found: ' + names.join(', '));
    return 'SUCCESS: ' + ss.getName() + ' | Sheets: ' + names.join(', ');
  } catch (err) {
    Logger.log('FAILED: ' + err.message);
    return 'FAILED: ' + err.message;
  }
}

function getSpreadsheet() {
  if (!SS_ID) {
    throw new Error('SS_ID is empty. Set your Google Spreadsheet ID in Code.gs line 1.');
  }
  var ss = SpreadsheetApp.openById(SS_ID);
  if (!ss) {
    throw new Error('Spreadsheet not found for ID: ' + SS_ID + '. Check the ID and sharing settings.');
  }
  return ss;
}

function getSheet(name) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function getActionPlanSheet() {
  var sheet = getSheet('ActionPlanData');
  var headers = [
    'Submission ID', 'Department', 'Other Department', 'Academic Year',
    'Action Plan Month', 'Semester', 'S.No', 'Tentative Date',
    'Name of Event', 'Resource Person', 'Venue', 'Nature / Type',
    'Mode', 'Beneficiary', 'Budget', 'Submitted At'
  ];
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getConfigSheet() {
  var sheet = getSheet('Configuration');
  var headers = ['Academic Year', 'Action Plan Month', 'Status'];
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function calculateUpcomingMonth() {
  var now = new Date();
  var month = now.getMonth();
  var year = now.getFullYear();
  var nextMonth = month + 1;
  if (nextMonth > 11) {
    return { month: 0, year: year + 1 };
  }
  return { month: nextMonth, year: year };
}

function getMonthName(m) {
  var names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return names[m];
}

function calculateAcademicYear(month, year) {
  if (month >= 3) {
    return year + '-' + (year + 1);
  }
  return (year - 1) + '-' + year;
}

function handleGetConfiguration() {
  var sheet = getConfigSheet();
  var lastRow = sheet.getLastRow();
  var status = 'OPEN';

  if (lastRow > 1) {
    var data = sheet.getRange(lastRow, 3).getValue();
    if (data) {
      status = String(data).toUpperCase().trim();
    }
  }

  var upcoming = calculateUpcomingMonth();
  var monthName = getMonthName(upcoming.month);
  var academicYear = calculateAcademicYear(upcoming.month, upcoming.year);

  return jsonResponse({
    success: true,
    status: status,
    academicYear: academicYear,
    actionPlanMonth: monthName + ' ' + upcoming.year
  });
}

function handleSubmitActionPlan(data) {
  var upcoming = calculateUpcomingMonth();
  var expectedMonth = upcoming.month;
  var expectedYear = upcoming.year;
  var expectedMonthName = getMonthName(expectedMonth) + ' ' + expectedYear;
  var expectedAcademicYear = calculateAcademicYear(expectedMonth, expectedYear);

  var configSheet = getConfigSheet();
  var lastRow = configSheet.getLastRow();
  var configStatus = 'OPEN';
  if (lastRow > 1) {
    var cs = configSheet.getRange(lastRow, 3).getValue();
    if (cs) configStatus = String(cs).toUpperCase().trim();
  }

  if (configStatus !== 'OPEN') {
    return jsonResponse({
      success: false,
      status: 'CLOSED',
      message: 'Action Plan submission is currently closed.'
    });
  }

  var department = data.department;
  var otherDepartment = data.otherDepartment || '';
  var semester = data.semester;
  var events = data.events;

  if (!department || !semester || !events || events.length === 0) {
    return jsonResponse({
      success: false,
      status: 'VALIDATION_ERROR',
      message: 'Incomplete data submitted.'
    });
  }

  var validDepartments = [
    'Department of Tamil', 'Department of English', 'Department of Mathematics',
    'Department of Computer Science', 'Department of Computer Science (AI)',
    'Department of Computer Science with DA', 'Department of BCA',
    'Department of Information Technology', 'Department of Commerce',
    'Department of Commerce (PA)', 'Department of Commerce (IT)',
    'Department of Commerce (AI)', 'Department of Commerce (CA)',
    'Department of Management', 'NSS', 'Other'
  ];

  if (validDepartments.indexOf(department) === -1) {
    return jsonResponse({
      success: false,
      status: 'VALIDATION_ERROR',
      message: 'Invalid department.'
    });
  }

  if (department === 'Other' && !otherDepartment) {
    return jsonResponse({
      success: false,
      status: 'VALIDATION_ERROR',
      message: 'Other Department / Club Name is required.'
    });
  }

  var validSemesters = ['ODD SEM', 'EVEN SEM'];
  if (validSemesters.indexOf(semester) === -1) {
    return jsonResponse({
      success: false,
      status: 'VALIDATION_ERROR',
      message: 'Invalid semester.'
    });
  }

  for (var i = 0; i < events.length; i++) {
    var evt = events[i];
    if (!evt.tentativeDate || !evt.nameOfEvent || !evt.venue || !evt.natureType || !evt.mode || !evt.beneficiary) {
      return jsonResponse({
        success: false,
        status: 'VALIDATION_ERROR',
        message: 'Event ' + (i + 1) + ' is missing required fields.'
      });
    }

    var eventDate = new Date(evt.tentativeDate);
    if (isNaN(eventDate.getTime()) || eventDate.getMonth() !== expectedMonth || eventDate.getFullYear() !== expectedYear) {
      return jsonResponse({
        success: false,
        status: 'VALIDATION_ERROR',
        message: 'Event ' + (i + 1) + ': Tentative date must be in ' + expectedMonthName + '.'
      });
    }

    var validNature = [
      'Seminar', 'Workshop', 'Orientation', 'Industrial Visit', 'Guest Lecture',
      'FDP', 'Training', 'Awareness Programme', 'Competition', 'Conference',
      'Webinar', 'Association Activity', 'Club Activity', 'Extension Activity', 'Other'
    ];
    if (validNature.indexOf(evt.natureType) === -1) {
      return jsonResponse({
        success: false,
        status: 'VALIDATION_ERROR',
        message: 'Event ' + (i + 1) + ': Invalid nature/type.'
      });
    }

    if (evt.natureType === 'Other' && !evt.otherNatureType) {
      return jsonResponse({
        success: false,
        status: 'VALIDATION_ERROR',
        message: 'Event ' + (i + 1) + ': Other Nature / Type is required.'
      });
    }

    var validModes = ['Offline', 'Online', 'Hybrid'];
    if (validModes.indexOf(evt.mode) === -1) {
      return jsonResponse({
        success: false,
        status: 'VALIDATION_ERROR',
        message: 'Event ' + (i + 1) + ': Invalid mode.'
      });
    }

    if (String(evt.nameOfEvent).length > 500) {
      return jsonResponse({
        success: false,
        status: 'VALIDATION_ERROR',
        message: 'Event ' + (i + 1) + ': Event name is too long.'
      });
    }
  }

  var sheet = getActionPlanSheet();
  var deptToCheck = department === 'Other' ? (department + ' - ' + otherDepartment) : department;

  var existingData = sheet.getDataRange().getValues();
  for (var j = 1; j < existingData.length; j++) {
    var existingDept = existingData[j][1];
    var existingAcYear = existingData[j][3];
    var existingMonth = existingData[j][4];
    if (existingDept === deptToCheck && existingAcYear === expectedAcademicYear && existingMonth === expectedMonthName) {
      return jsonResponse({
        success: false,
        status: 'DUPLICATE',
        message: 'Action Plan already submitted for this department and month.'
      });
    }
  }

  var monthStr = String(expectedMonth + 1).padStart(2, '0');
  var submissionId = 'PPG-' + expectedYear + monthStr + '-' + String(sheet.getLastRow()).padStart(4, '0');

  var now = new Date();
  var submittedAt = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  var rows = [];
  for (var k = 0; k < events.length; k++) {
    var e = events[k];
    rows.push([
      submissionId,
      department === 'Other' ? 'Other - ' + otherDepartment : department,
      otherDepartment,
      expectedAcademicYear,
      expectedMonthName,
      semester,
      k + 1,
      e.tentativeDate,
      e.nameOfEvent,
      e.resourcePerson || '',
      e.venue,
      e.natureType === 'Other' ? e.otherNatureType : e.natureType,
      e.mode,
      e.beneficiary,
      e.budget || '',
      submittedAt
    ]);
  }

  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);

  return jsonResponse({
    success: true,
    status: 'SUCCESS',
    submissionId: submissionId,
    department: department === 'Other' ? 'Other - ' + otherDepartment : department,
    otherDepartment: otherDepartment,
    actionPlanMonth: expectedMonthName,
    academicYear: expectedAcademicYear,
    eventCount: events.length,
    submittedAt: submittedAt
  });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
