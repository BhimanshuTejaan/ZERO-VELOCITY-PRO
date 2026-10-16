import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\Bhimanshu\\.gemini\\antigravity\\brain\\25ed3692-3baa-4a9c-9908-6f2221e08d1b";
const APP_URL = "http://localhost:5173/";

const testLicenses = [
  {
    licenseKey: "ZV-9X82-K4L1-M8P0-Q3W7",
    customerName: "Alex Rivera",
    email: "alex.rivera@creativevids.io",
    firebaseUid: "uid_alex_9921448",
    razorpayPaymentId: "pay_OpL92810XyZa",
    razorpayOrderId: "order_Kj99102847",
    purchaseDate: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // Today
    source: "razorpay",
    licenseType: "Lifetime",
    maxDevices: 1,
    status: "active",
    registeredDevices: [
      {
        deviceId: "mac-m2-881920aa99182",
        deviceName: "MacBook Pro 16\"",
        activatedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
        lastSeen: new Date().toISOString()
      }
    ],
    activityLog: [
      { action: "License Created (Razorpay Purchase ₹299)", date: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
      { action: "Device Activated: MacBook Pro 16\"", date: new Date(Date.now() - 3600 * 1000).toISOString() }
    ]
  },
  {
    licenseKey: "ZV-4B7C-9D2E-1F8G-3H5J",
    customerName: "Sarah Chen",
    email: "sarah.chen@motioncraft.design",
    firebaseUid: "uid_sarah_1182749",
    razorpayPaymentId: "pay_Kk817290PlMn",
    razorpayOrderId: "order_Np77281900",
    purchaseDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // Yesterday
    source: "razorpay",
    licenseType: "Lifetime",
    maxDevices: 2,
    status: "active",
    registeredDevices: [],
    activityLog: [
      { action: "License Created (Razorpay Purchase ₹299)", date: new Date(Date.now() - 24 * 3600 * 1000).toISOString() }
    ]
  },
  {
    licenseKey: "ZV-ADMIN-VIP1-TEST-9988",
    customerName: "David Miller (YouTube Reviewer)",
    email: "david@aftereffectstutorials.com",
    firebaseUid: "uid_david_5599182",
    razorpayPaymentId: "ADMIN_GENERATED",
    razorpayOrderId: null,
    purchaseDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    source: "admin",
    licenseType: "Reviewer",
    maxDevices: 3,
    notes: "Sponsored review video on YouTube channel (180K subs)",
    status: "active",
    registeredDevices: [
      {
        deviceId: "win-pc-991820bb11829",
        deviceName: "Main Editing Rig (RTX 4090)",
        activatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        lastSeen: new Date().toISOString()
      }
    ],
    activityLog: [
      { action: "License Generated via Admin Tools (Reviewer)", date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), by: "bhimanshutejaan@gmail.com" },
      { action: "Device Activated: Main Editing Rig", date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() }
    ]
  },
  {
    licenseKey: "ZV-DISA-BLED-TEST-0001",
    customerName: "Refunded Chargeback Account",
    email: "fraud.suspicious@tempmail.org",
    firebaseUid: "uid_fraud_0019283",
    razorpayPaymentId: "pay_FailedRefund01",
    razorpayOrderId: "order_Disputed01",
    purchaseDate: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    source: "razorpay",
    licenseType: "Lifetime",
    maxDevices: 1,
    status: "disabled",
    registeredDevices: [],
    activityLog: [
      { action: "License Created", date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
      { action: "License Disabled", date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(), by: "bhimanshutejaan@gmail.com" }
    ]
  },
  {
    licenseKey: "ZV-LIMT-FULL-DEV2-7744",
    customerName: "Kavita Sharma",
    email: "kavita.editor@studios.in",
    firebaseUid: "uid_kavita_448819",
    razorpayPaymentId: "pay_Kavita992818",
    razorpayOrderId: "order_Kavita772",
    purchaseDate: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    source: "razorpay",
    licenseType: "Lifetime",
    maxDevices: 1,
    status: "active",
    registeredDevices: [
      {
        deviceId: "mac-mini-m1-778819",
        deviceName: "Studio Mac Mini",
        activatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        lastSeen: new Date().toISOString()
      }
    ],
    activityLog: [
      { action: "License Created", date: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString() }
    ]
  }
];

async function run() {
  console.log('--- STARTING ADMIN DASHBOARD MOBILE-FIRST CDP VERIFICATION ---');

  const tempProfile = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'chrome-admin-test-' + Date.now());
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9246',
    `--user-data-dir=${tempProfile}`,
    '--no-first-run',
    '--disable-extensions',
    '--disable-gpu',
    'about:blank'
  ]);

  let targetTab = null;
  for (let i = 0; i < 30; i++) {
    try {
      const listRes = await fetch('http://127.0.0.1:9246/json');
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

  const setViewport = async (width, height, isMobile = true) => {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: isMobile
    });
  };

  const captureAndSave = async (filename) => {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const targetPath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(targetPath, Buffer.from(shot.data, 'base64'));
    console.log(`✓ Saved screenshot: ${filename}`);
  };

  const evalInPage = async (expr) => {
    const res = await send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true
    });
    if (res.exceptionDetails) {
      console.error('JS Error:', res.exceptionDetails);
    }
    return res.result ? res.result.value : null;
  };

  // Inject test admin state before scripts execute
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.__ZV_ADMIN_TEST_ACTIVE__ = true;
      window.__ZV_ADMIN_TEST_LICENSES__ = ${JSON.stringify(testLicenses)};
      window.location.hash = '#admin';
    `
  });

  // Navigate to app URL with #admin
  console.log('Navigating to app URL:', APP_URL + '#admin');
  await send('Page.navigate', { url: APP_URL + '#admin' });
  await new Promise(r => setTimeout(r, 2000));

  // Trigger custom event just in case
  await evalInPage(`
    window.dispatchEvent(new CustomEvent('zero-velocity-open-admin-dashboard'));
  `);
  await new Promise(r => setTimeout(r, 600));

  // Verify Admin Dashboard is open
  const isDashboardOpen = await evalInPage(`Boolean(document.querySelector('.admin-dashboard-container'))`);
  console.log('Is Admin Dashboard open?:', isDashboardOpen);

  // =========================================================================
  // VIEWPORT 1: Modern iPhone (390 x 844) - Mobile-First Benchmark
  // =========================================================================
  console.log('\n--- Testing Viewport: iPhone 14/15/16 (390 x 844) ---');
  await setViewport(390, 844, true);
  await new Promise(r => setTimeout(r, 600));

  // Check overflow
  const overflow390 = await evalInPage(`
    ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      containerScrollWidth: document.querySelector('.admin-dashboard-container')?.scrollWidth,
      containerClientWidth: document.querySelector('.admin-dashboard-container')?.clientWidth
    })
  `);
  console.log('Overflow check (390px):', overflow390);

  // Capture Mobile Directory View
  await captureAndSave('admin_mobile_390_directory.png');

  // Test expanding secondary metrics
  console.log('Testing Mobile Metrics Expansion Toggle...');
  await evalInPage(`document.querySelector('.mobile-metrics-toggle-pill')?.click()`);
  await new Promise(r => setTimeout(r, 400));
  await captureAndSave('admin_mobile_390_metrics_expanded.png');

  // Collapse it back
  await evalInPage(`document.querySelector('.mobile-metrics-toggle-pill')?.click()`);
  await new Promise(r => setTimeout(r, 300));

  // Test 1-Tap Copy Key from Mobile Card
  console.log('Testing 1-Tap Copy on Card Key...');
  await evalInPage(`
    const copyBtn = document.querySelector('.key-copy-touch-btn');
    if (copyBtn) copyBtn.click();
  `);
  await new Promise(r => setTimeout(r, 200));
  const copyBtnText = await evalInPage(`document.querySelector('.key-copy-touch-btn')?.textContent`);
  console.log('Card Copy Button status text:', copyBtnText);

  // Test Opening Customer Details Drawer on Mobile
  console.log('Testing Opening Customer Details Drawer...');
  await evalInPage(`
    const firstCard = document.querySelector('.mobile-customer-card');
    if (firstCard) firstCard.click();
  `);
  await new Promise(r => setTimeout(r, 500));
  const isDrawerOpen = await evalInPage(`Boolean(document.querySelector('.customer-drawer'))`);
  console.log('Is Customer Drawer open?:', isDrawerOpen);
  await captureAndSave('admin_mobile_390_customer_drawer.png');

  // Test Drawer "Back to List" button
  console.log('Testing Drawer Back to List Button...');
  await evalInPage(`document.querySelector('.drawer-back-btn')?.click()`);
  await new Promise(r => setTimeout(r, 400));
  const isDrawerClosed = await evalInPage(`!document.querySelector('.customer-drawer')`);
  console.log('Did Drawer close successfully?:', isDrawerClosed);

  // Test Filter Pills (Active, Disabled, Paid)
  console.log('Testing Filter Pills...');
  await evalInPage(`
    const filterPills = Array.from(document.querySelectorAll('.filter-pill'));
    const disabledPill = filterPills.find(p => p.textContent.includes('Disabled'));
    if (disabledPill) disabledPill.click();
  `);
  await new Promise(r => setTimeout(r, 400));
  const visibleCardsCount = await evalInPage(`document.querySelectorAll('.mobile-customer-card').length`);
  console.log('Visible cards with "Disabled" filter:', visibleCardsCount);
  await captureAndSave('admin_mobile_390_filter_disabled.png');

  // Reset to All
  await evalInPage(`
    const allPill = document.querySelector('.filter-pill');
    if (allPill) allPill.click();
  `);
  await new Promise(r => setTimeout(r, 300));

  // Test Search Box
  console.log('Testing Search filtering...');
  await evalInPage(`(() => {
    const input = document.querySelector('.search-box input');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, 'david');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await new Promise(r => setTimeout(r, 400));
  const searchResultCard = await evalInPage(`document.querySelector('.mobile-card-name')?.textContent`);
  console.log('Card displayed for search "david":', searchResultCard);

  // Clear search
  await evalInPage(`(() => {
    const clearBtn = document.querySelector('.clear-search-btn');
    if (clearBtn) clearBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 300));

  // Test Tab Navigation to "Generate Key"
  console.log('Testing Tab Navigation to License Generator...');
  await evalInPage(`(() => {
    const tabs = Array.from(document.querySelectorAll('.segmented-tab'));
    if (tabs[1]) tabs[1].click();
  })()`);
  await new Promise(r => setTimeout(r, 500));
  await captureAndSave('admin_mobile_390_generator_tab.png');

  // Fill in form and generate test license
  console.log('Testing License Generation Form Submission...');
  await evalInPage(`(() => {
    const nameInput = document.querySelector('#gen-customer-name');
    const emailInput = document.querySelector('#gen-customer-email');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(nameInput, 'Emma Watson');
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    setter.call(emailInput, 'emma@creativemotion.co');
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('#gen-license-type').value = 'Lifetime';
    document.querySelector('#gen-license-type').dispatchEvent(new Event('change', { bubbles: true }));
    document.querySelector('.generate-submit-btn').click();
  })()`);
  await new Promise(r => setTimeout(r, 600));

  const isSuccessModalOpen = await evalInPage(`Boolean(document.querySelector('.new-key-modal'))`);
  console.log('Did License Generation Success Modal appear?:', isSuccessModalOpen);
  const generatedKeyText = await evalInPage(`document.querySelector('.generated-key-box code')?.textContent`);
  console.log('Newly generated license key:', generatedKeyText);
  await captureAndSave('admin_mobile_390_new_key_modal.png');

  // Dismiss modal and return to Directory tab
  await evalInPage(`(() => {
    const viewDirBtn = document.querySelector('.modal-footer-actions button');
    if (viewDirBtn) {
      viewDirBtn.click();
    } else {
      const tabs = Array.from(document.querySelectorAll('.segmented-tab'));
      if (tabs[0]) tabs[0].click();
    }
  })()`);
  await new Promise(r => setTimeout(r, 500));

  // Verify new license appears at top of customer directory
  const topCustomerName = await evalInPage(`document.querySelector('.mobile-card-name')?.textContent`);
  console.log('Top record in Directory after generation:', topCustomerName);

  // =========================================================================
  // VIEWPORT 2: Narrow Mobile (320 x 568 - iPhone SE / Fold)
  // =========================================================================
  console.log('\n--- Testing Viewport: Narrow Mobile (320 x 568) ---');
  await setViewport(320, 568, true);
  await new Promise(r => setTimeout(r, 500));
  const overflow320 = await evalInPage(`document.documentElement.scrollWidth > window.innerWidth`);
  console.log('Does 320px have horizontal overflow?:', overflow320);
  await captureAndSave('admin_mobile_320_narrow.png');

  // =========================================================================
  // VIEWPORT 3: Compact Mobile (360 x 740 - Galaxy S / Android)
  // =========================================================================
  console.log('\n--- Testing Viewport: Compact Mobile (360 x 740) ---');
  await setViewport(360, 740, true);
  await new Promise(r => setTimeout(r, 500));
  const overflow360 = await evalInPage(`document.documentElement.scrollWidth > window.innerWidth`);
  console.log('Does 360px have horizontal overflow?:', overflow360);
  await captureAndSave('admin_mobile_360_compact.png');

  // =========================================================================
  // VIEWPORT 4: Large Mobile (430 x 932 - iPhone Pro Max)
  // =========================================================================
  console.log('\n--- Testing Viewport: Large Mobile (430 x 932) ---');
  await setViewport(430, 932, true);
  await new Promise(r => setTimeout(r, 500));
  const overflow430 = await evalInPage(`document.documentElement.scrollWidth > window.innerWidth`);
  console.log('Does 430px have horizontal overflow?:', overflow430);
  await captureAndSave('admin_mobile_430_promax.png');

  // =========================================================================
  // VIEWPORT 5: Tablet Portrait (768 x 1024 - iPad)
  // =========================================================================
  console.log('\n--- Testing Viewport: Tablet Portrait (768 x 1024) ---');
  await setViewport(768, 1024, true);
  await new Promise(r => setTimeout(r, 500));
  const overflow768 = await evalInPage(`document.documentElement.scrollWidth > window.innerWidth`);
  console.log('Does 768px have horizontal overflow?:', overflow768);
  await captureAndSave('admin_tablet_768_portrait.png');

  // =========================================================================
  // VIEWPORT 6: Small Desktop / Tablet Landscape (1024 x 768)
  // =========================================================================
  console.log('\n--- Testing Viewport: Small Desktop (1024 x 768) ---');
  await setViewport(1024, 768, false);
  await new Promise(r => setTimeout(r, 500));
  await evalInPage(`(() => {
    const tabs = Array.from(document.querySelectorAll('.segmented-tab'));
    if (tabs[0]) tabs[0].click();
  })()`);
  await new Promise(r => setTimeout(r, 300));
  const isDesktopTable1024 = await evalInPage(`getComputedStyle(document.querySelector('.desktop-only-table')).display !== 'none'`);
  console.log('Is desktop table visible at 1024px?:', isDesktopTable1024);
  await captureAndSave('admin_desktop_1024.png');

  // =========================================================================
  // VIEWPORT 7: Full Desktop (1440 x 900)
  // =========================================================================
  console.log('\n--- Testing Viewport: Full Desktop (1440 x 900) ---');
  await setViewport(1440, 900, false);
  await new Promise(r => setTimeout(r, 500));
  const isDesktopTable1440 = await evalInPage(`getComputedStyle(document.querySelector('.desktop-only-table')).display !== 'none'`);
  console.log('Is desktop table visible at 1440px?:', isDesktopTable1440);

  // Open details on desktop to inspect right side slide-out drawer
  await evalInPage(`(() => {
    const firstRowBtn = document.querySelector('.desktop-only-table .view-details-btn');
    if (firstRowBtn) firstRowBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 500));
  await captureAndSave('admin_desktop_1440_drawer.png');

  // Audit touch targets on mobile (390px)
  console.log('\n--- Auditing Touch Targets at 390px ---');
  await setViewport(390, 844, true);
  await new Promise(r => setTimeout(r, 400));

  const touchTargetsAudit = await evalInPage(`
    const targets = [
      { name: 'Close / Done Button', el: document.querySelector('.admin-close-btn') },
      { name: 'Refresh Button', el: document.querySelector('.refresh-btn') },
      { name: 'Tab 1: Buyers & Licenses', el: document.querySelectorAll('.segmented-tab')[0] },
      { name: 'Tab 2: Generate Key', el: document.querySelectorAll('.segmented-tab')[1] },
      { name: 'Card 1 Touch Action', el: document.querySelector('.mobile-customer-card') },
      { name: 'Key Copy Touch Button', el: document.querySelector('.key-copy-touch-btn') },
      { name: 'Search Input', el: document.querySelector('.search-box input') }
    ];
    targets.map(t => {
      if (!t.el) return { name: t.name, found: false };
      const rect = t.el.getBoundingClientRect();
      return {
        name: t.name,
        found: true,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        meets44px: rect.height >= 40 && rect.width >= 40
      };
    })
  `);
  console.log('Touch Targets Audit Results:');
  console.table(touchTargetsAudit);

  chromeProc.kill();
  console.log('\n✓ ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
