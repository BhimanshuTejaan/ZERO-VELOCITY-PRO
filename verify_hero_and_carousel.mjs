import { spawn } from 'child_process';
import { createServer } from 'vite';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\Bhimanshu\\.gemini\\antigravity\\brain\\25ed3692-3baa-4a9c-9908-6f2221e08d1b";

async function run() {
  console.log('--- STARTING ZERO VELOCITY HERO VERIFICATION ---');
  const port = 5188;
  const server = await createServer({ server: { port, host: '127.0.0.1' }, logLevel: 'error' });
  await server.listen();
  console.log(`Vite server listening on port ${port}`);

  const tempProfile = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'chrome-hero-test-' + Date.now());
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9233',
    `--user-data-dir=${tempProfile}`,
    '--no-first-run',
    '--disable-extensions',
    '--disable-gpu',
    'about:blank'
  ]);

  let targetTab = null;
  for (let i = 0; i < 30; i++) {
    try {
      const listRes = await fetch('http://127.0.0.1:9233/json');
      const tabs = await listRes.json();
      targetTab = tabs.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (targetTab) break;
    } catch {
      // wait
    }
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

  // Setup console logs monitoring
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

  console.log('Testing Desktop 1280 x 850...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 850,
    deviceScaleFactor: 1,
    mobile: false
  });

  await send('Page.navigate', { url: `http://127.0.0.1:${port}/` });
  await new Promise(r => setTimeout(r, 2200));

  // Capture Desktop Hero (initial featured: Devin Style)
  const deskHeroShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'hero_desktop_devin.png'), Buffer.from(deskHeroShot.data, 'base64'));
  console.log('✓ Captured hero_desktop_devin.png');

  // Verify Active Video Source
  const initialVideoSrc = await send('Runtime.evaluate', {
    expression: `document.querySelector(".stage-video-element").getAttribute("src")`,
    returnByValue: true
  });
  console.log('Initial Video Source:', initialVideoSrc.result.value);

  // Test Clicking Style Tabs
  console.log('Testing Style Tab Switching...');
  await send('Runtime.evaluate', {
    expression: `document.querySelector("#hero-tab-balanced-style").click();`
  });
  await new Promise(r => setTimeout(r, 800));

  const balancedVideoSrc = await send('Runtime.evaluate', {
    expression: `document.querySelector(".stage-video-element").getAttribute("src")`,
    returnByValue: true
  });
  console.log('After clicking Balanced Style Tab, Source:', balancedVideoSrc.result.value);

  const shotBalanced = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'hero_desktop_balanced.png'), Buffer.from(shotBalanced.data, 'base64'));
  console.log('✓ Captured hero_desktop_balanced.png');

  // Test Corporate Clean Tab
  await send('Runtime.evaluate', {
    expression: `document.querySelector("#hero-tab-corporate-clean").click();`
  });
  await new Promise(r => setTimeout(r, 800));

  const corporateVideoSrc = await send('Runtime.evaluate', {
    expression: `document.querySelector(".stage-video-element").getAttribute("src")`,
    returnByValue: true
  });
  console.log('After clicking Corporate Clean Tab, Source:', corporateVideoSrc.result.value);

  // Return to Devin Style
  await send('Runtime.evaluate', {
    expression: `document.querySelector("#hero-tab-devin-style").click();`
  });
  await new Promise(r => setTimeout(r, 600));

  // Test Expanded Modal Viewer
  console.log('Testing Expanded Modal Viewer...');
  await send('Runtime.evaluate', {
    expression: `document.querySelector(".stage-expand-pill").click();`
  });
  await new Promise(r => setTimeout(r, 1000));

  const modalVisible = await send('Runtime.evaluate', {
    expression: `Boolean(document.querySelector(".expanded-modal-backdrop"))`,
    returnByValue: true
  });
  console.log('Is Modal Open?:', modalVisible.result.value);

  const shotModal = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'hero_modal_expanded.png'), Buffer.from(shotModal.data, 'base64'));
  console.log('✓ Captured hero_modal_expanded.png');

  // Close modal via Escape
  await send('Runtime.evaluate', {
    expression: `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));`
  });
  await new Promise(r => setTimeout(r, 600));

  const modalAfterEsc = await send('Runtime.evaluate', {
    expression: `Boolean(document.querySelector(".expanded-modal-backdrop"))`,
    returnByValue: true
  });
  console.log('Is Modal Closed After Escape?:', !modalAfterEsc.result.value);

  // Test Mobile Viewports
  console.log('Testing Mobile Viewport 390 x 844 (iPhone 14/15)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send('Runtime.evaluate', { expression: `window.scrollTo({ top: 0, behavior: 'instant' });` });
  await new Promise(r => setTimeout(r, 1500));

  // Check horizontal overflow
  const overflowCheck = await send('Runtime.evaluate', {
    expression: `document.documentElement.scrollWidth > window.innerWidth`,
    returnByValue: true
  });
  console.log('Mobile 390px Has Horizontal Overflow?:', overflowCheck.result.value);

  const shotMobHero = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'hero_mobile_390.png'), Buffer.from(shotMobHero.data, 'base64'));
  console.log('✓ Captured hero_mobile_390.png');

  // Test 360px viewport (compact Android)
  console.log('Testing Compact Android 360 x 780...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 360,
    height: 780,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send('Runtime.evaluate', { expression: `window.scrollTo({ top: 0, behavior: 'instant' });` });
  await new Promise(r => setTimeout(r, 1000));

  const overflow360 = await send('Runtime.evaluate', {
    expression: `document.documentElement.scrollWidth > window.innerWidth`,
    returnByValue: true
  });
  console.log('Mobile 360px Has Horizontal Overflow?:', overflow360.result.value);

  const shot360 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'hero_mobile_360.png'), Buffer.from(shot360.data, 'base64'));
  console.log('✓ Captured hero_mobile_360.png');

  // Capture downstream sections to verify no regression
  console.log('Capturing downstream sections to verify integrity...');
  await send('Runtime.evaluate', { expression: `document.querySelector("#styles").scrollIntoView({ block: 'start' });` });
  await new Promise(r => setTimeout(r, 1200));
  const shotStyles = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'hero_verify_styles.png'), Buffer.from(shotStyles.data, 'base64'));

  await send('Runtime.evaluate', { expression: `document.querySelector("#pricing").scrollIntoView({ block: 'start' });` });
  await new Promise(r => setTimeout(r, 1200));
  const shotPricing = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'hero_verify_pricing.png'), Buffer.from(shotPricing.data, 'base64'));

  // Test tablet 768 x 1024
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
  const shot768 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'hero_tablet_768.png'), Buffer.from(shot768.data, 'base64'));

  // Check console error summary
  const severeErrors = consoleLogs.filter(l => l.type === 'error');
  console.log(`Console Logs: ${consoleLogs.length} total, ${severeErrors.length} errors.`);

  console.log('Verification completed successfully! Cleaning up...');
  chromeProc.kill();
  await server.close();
}

run().catch(err => {
  console.error('Fatal Verification Error:', err);
  process.exit(1);
});
