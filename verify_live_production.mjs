import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\Bhimanshu\\.gemini\\antigravity\\brain\\25ed3692-3baa-4a9c-9908-6f2221e08d1b";
const LIVE_URL = "https://www.zerovelocitycaptions.com";

async function verifyLive() {
  console.log(`--- VERIFYING LIVE PRODUCTION: ${LIVE_URL} ---`);

  const tempProfile = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'chrome-live-prod-' + Date.now());
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9255',
    `--user-data-dir=${tempProfile}`,
    '--no-first-run',
    '--disable-extensions',
    '--disable-gpu',
    'about:blank'
  ]);

  let targetTab = null;
  for (let i = 0; i < 30; i++) {
    try {
      const listRes = await fetch('http://127.0.0.1:9255/json');
      const tabs = await listRes.json();
      targetTab = tabs.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (targetTab) break;
    } catch {}
    await new Promise(r => setTimeout(r, 350));
  }

  if (!targetTab) {
    chromeProc.kill();
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

  const consoleErrors = [];
  ws.addEventListener('message', (e) => {
    try {
      const parsed = JSON.parse(e.data);
      if (parsed.method === 'Runtime.consoleAPICalled' && parsed.params.type === 'error') {
        consoleErrors.push(parsed.params.args.map(a => a.value || a.description).join(' '));
      }
    } catch {}
  });

  // 1. DESKTOP LIVE VERIFICATION (1280 x 850)
  console.log('1. Loading Live Desktop (1280 x 850)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 850,
    deviceScaleFactor: 1,
    mobile: false
  });

  await send('Page.navigate', { url: `${LIVE_URL}/?_cacheBust=${Date.now()}` });
  await new Promise(r => setTimeout(r, 3500));

  // Check live title and headline
  const headline = await send('Runtime.evaluate', {
    expression: `document.querySelector(".hero-title")?.textContent?.trim()`,
    returnByValue: true
  });
  console.log('Live Hero Headline:', headline.result.value);

  const oneClickSeq = await send('Runtime.evaluate', {
    expression: `document.querySelector(".hero-one-click-sequence")?.textContent?.trim()`,
    returnByValue: true
  });
  console.log('Live One-Click Sequence:', oneClickSeq.result.value);

  const cardCount = await send('Runtime.evaluate', {
    expression: `document.querySelectorAll(".orbit-card").length`,
    returnByValue: true
  });
  console.log('Live 3D Orbit Card Count:', cardCount.result.value);

  const shotDesk = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'live_prod_desktop_hero.png'), Buffer.from(shotDesk.data, 'base64'));
  console.log('✓ Captured live_prod_desktop_hero.png');

  // Test Pricing Section on Live
  await send('Runtime.evaluate', { expression: `document.querySelector("#pricing")?.scrollIntoView({ block: "start" });` });
  await new Promise(r => setTimeout(r, 1200));
  const shotPricing = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'live_prod_desktop_pricing.png'), Buffer.from(shotPricing.data, 'base64'));
  console.log('✓ Captured live_prod_desktop_pricing.png');

  // 2. MOBILE LIVE VERIFICATION (iPhone 14/15: 390 x 844)
  console.log('2. Loading Live Mobile (390 x 844)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send('Runtime.evaluate', { expression: `window.scrollTo({ top: 0, behavior: "instant" });` });
  await new Promise(r => setTimeout(r, 2000));

  const overflowMobile = await send('Runtime.evaluate', {
    expression: `document.documentElement.scrollWidth > window.innerWidth`,
    returnByValue: true
  });
  console.log('Live Mobile 390px Horizontal Overflow?:', overflowMobile.result.value);

  const shotMob = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'live_prod_mobile_hero.png'), Buffer.from(shotMob.data, 'base64'));
  console.log('✓ Captured live_prod_mobile_hero.png');

  console.log(`Console Errors on Live Domain: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Errors:', consoleErrors);
  }

  console.log('--- LIVE PRODUCTION VERIFICATION COMPLETED SUCCESSFULLY ---');
  chromeProc.kill();
}

verifyLive().catch(err => {
  console.error('Live Verification Failed:', err);
  process.exit(1);
});
