import { GOOGLE_APPS_SCRIPT_URL } from './config.js';

export async function getConfiguration() {
  if (!GOOGLE_APPS_SCRIPT_URL) {
    return { success: true, status: 'OPEN' };
  }
  try {
    const res = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'getConfiguration' })
    });
    const text = await res.text();
    return JSON.parse(text);
  } catch {
    return { success: true, status: 'OPEN' };
  }
}

export async function submitActionPlan(data) {
  if (!GOOGLE_APPS_SCRIPT_URL) {
    return {
      success: false,
      status: 'CONFIG_ERROR',
      message: 'Google Apps Script URL is not configured. Please set it in src/config.js.'
    };
  }
  try {
    const res = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'submitActionPlan', data })
    });
    const text = await res.text();
    return JSON.parse(text);
  } catch {
    return {
      success: false,
      status: 'NETWORK_ERROR',
      message: 'Unable to connect to the server. Please try again.'
    };
  }
}
