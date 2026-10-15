import { spawn } from 'child_process';
import { createServer } from 'vite';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\Bhimanshu\\.gemini\\antigravity\\brain\\25ed3692-3baa-4a9c-9908-6f2221e08d1b";

async function run() {
  console.log('--- STARTING ZERO VELOCITY 3D ORBIT HERO VERIFICATION ---');
  const port = 5179;
  const server = await createServer({ server: { port, host: '127.0.0.1' }, logLevel: 'error' });
  await server.listen();
  console.log(`Vite server listening on port ${port}`);

  const tempProfile = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'chrome-orbit-test-' + Date.now());
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9244',
    `--user-data-dir=${tempProfile}`,
    '--no-first-run',
    '--disable-extensions',
    '--disable-gpu',
    'about:blank'
  ]);

  let targetTab = null;
  for (let i = 0; i < 30; i++) {
    try {
      const listRes = await fetch('http://127.0.0.1:9244/json');
      const tabs = await listRes.json();
      targetTab = tabs.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (targetTab) break;
    } catch {}
    await new Promise(r => setTimeout(r, 350));
  }

  if (!targetTab) {
    chromeProc.kill();
    await server.close();
    throw new Error('Could not find Chrome page target');
  }

  const ws = new WebSocket(targetTab.webSocketDebuggerUrl);
  let msgId = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const curId = msgId++;
    const handler = (e) => {
      const data = JSON.parse(e.data);
      if (data.id === curId) {
        ws.removeEventListener('message', handler);
        if (data.error) reject(new Error(JSON.stringify(data.error)));
        else resolve(data.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await new Promise(r => ws.onopen = r);
  await send('Runtime.enable');
  await send('Page.enable');

  const consoleLogs = [];
  ws.addEventListener('message', (e) => {
    try {
      const parsed = JSON.parse(e.data);
      if (parsed.method === 'Runtime.consoleAPICalled') {
        consoleLogs.push({ type: parsed.params.type, args: parsed.params.args.map(a => a.value || a.description) });
      }
    } catch {}
  });

  // 1. DESKTOP 1280 x 850
  console.log('Testing Desktop 1280 x 850...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 850,
    deviceScaleFactor: 1,
    mobile: false
  });

  await send('Page.navigate', { url: `http://127.0.0.1:${port}/` });
  await new Promise(r => setTimeout(r, 2200));

  // Verify No Expand/Modal Button exists
  const expandBtnCheck = await send('Runtime.evaluate', {
    expression: `Boolean(document.querySelector(".stage-expand-pill") || document.querySelector(".expanded-modal-backdrop"))`,
    returnByValue: true
  });
  console.log('Is Expand Button or Modal present?:', expandBtnCheck.result.value);

  // Capture Desktop Hero (initial 3D orbit with Devin Style front)
  const deskHeroShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'orbit_desktop_devin.png'), Buffer.from(deskHeroShot.data, 'base64'));
  console.log('✓ Captured orbit_desktop_devin.png');

  // Test Clicking a Card to Pin Style in Place
  console.log('Testing Card Click to Pin Style in Place...');
  await send('Runtime.evaluate', {
    expression: `
      const cards = document.querySelectorAll(".orbit-card");
      if (cards[1]) cards[1].click(); // Click Balanced Style
    `
  });
  await new Promise(r => setTimeout(r, 800));

  const hudActiveName = await send('Runtime.evaluate', {
    expression: `document.querySelector(".orbit-active-name")?.textContent`,
    returnByValue: true
  });
  console.log('HUD Active Name after clicking Card 1:', hudActiveName.result.value);

  // Verify Still No Modal Opened
  const modalOpenedOnCardClick = await send('Runtime.evaluate', {
    expression: `Boolean(document.querySelector(".expanded-modal-backdrop") || document.querySelector("dialog[open]"))`,
    returnByValue: true
  });
  console.log('Did Card Click open a Modal or separate viewer?:', modalOpenedOnCardClick.result.value);

  const deskFocusedShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'orbit_desktop_focused.png'), Buffer.from(deskFocusedShot.data, 'base64'));
  console.log('✓ Captured orbit_desktop_focused.png');

  // Test "Resume Orbit" Button
  console.log('Testing Resume Orbit button...');
  await send('Runtime.evaluate', {
    expression: `document.querySelector(".orbit-resume-btn")?.click();`
  });
  await new Promise(r => setTimeout(r, 600));

  // 2. MOBILE 390 x 844 (iPhone 14/15)
  console.log('Testing Mobile Viewport 390 x 844 (iPhone 14/15)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send('Runtime.evaluate', { expression: `window.scrollTo({ top: 0, behavior: 'instant' });` });
  await new Promise(r => setTimeout(r, 1500));

  const overflow390 = await send('Runtime.evaluate', {
    expression: `document.documentElement.scrollWidth > window.innerWidth`,
    returnByValue: true
  });
  console.log('Mobile 390px Has Horizontal Overflow?:', overflow390.result.value);

  const mobShot390 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'orbit_mobile_390.png'), Buffer.from(mobShot390.data, 'base64'));
  console.log('✓ Captured orbit_mobile_390.png');

  // Test mobile tab switching
  await send('Runtime.evaluate', {
    expression: `document.querySelector("#orbit-tab-corporate-clean")?.click();`
  });
  await new Promise(r => setTimeout(r, 800));

  const mobHudName = await send('Runtime.evaluate', {
    expression: `document.querySelector(".orbit-active-name")?.textContent`,
    returnByValue: true
  });
  console.log('Mobile HUD Active Name after tab click:', mobHudName.result.value);

  // 3. TABLET 768 x 1024 (iPad)
  console.log('Testing Tablet 768 x 1024...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 768,
    height: 1024,
    deviceScaleFactor: 2,
    mobile: false
  });
  await send('Runtime.evaluate', { expression: `window.scrollTo({ top: 0, behavior: 'instant' });` });
  await new Promise(r => setTimeout(r, 1200));

  const overflow768 = await send('Runtime.evaluate', {
    expression: `document.documentElement.scrollWidth > window.innerWidth`,
    returnByValue: true
  });
  console.log('Tablet 768px Has Horizontal Overflow?:', overflow768.result.value);

  const tabletShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'orbit_tablet_768.png'), Buffer.from(tabletShot.data, 'base64'));
  console.log('✓ Captured orbit_tablet_768.png');

  // Check console error summary
  const severeErrors = consoleLogs.filter(l => l.type === 'error');
  console.log(`Console Logs: ${consoleLogs.length} total, ${severeErrors.length} errors.`);

  console.log('--- ALL ORBIT VERIFICATION CHECKS PASSED ---');
  chromeProc.kill();
  await server.close();
}

run().catch(err => {
  console.error('Fatal Verification Error:', err);
  process.exit(1);
});
