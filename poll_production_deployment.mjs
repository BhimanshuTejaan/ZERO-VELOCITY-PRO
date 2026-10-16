import https from 'https';

async function checkDeployment() {
  const domains = [
    'https://zero-velocity-eta.vercel.app',
    'https://www.zerovelocitycaptions.com'
  ];

  console.log('Polling Vercel deployment for new bundle and hero phrase...');

  for (let attempt = 1; attempt <= 20; attempt++) {
    console.log(`\n--- Attempt ${attempt}/20 (${new Date().toLocaleTimeString()}) ---`);

    for (const domain of domains) {
      try {
        const url = `${domain}/?_ts=${Date.now()}`;
        const res = await fetch(url, { cache: 'no-store' });
        const text = await res.text();
        const scriptMatch = text.match(/index-[A-Za-z0-9_-]+\.js/);
        const hasNewHero = text.includes('Captions, finished in one click.') || text.includes('ONE CLICK');
        const hasOrbit = text.includes('orbit-card') || text.includes('hero-minimalist') || text.includes('hero-one-click-sequence');

        console.log(`Domain: ${domain}`);
        console.log(`  HTTP: ${res.status}`);
        console.log(`  Bundle: ${scriptMatch ? scriptMatch[0] : 'not found'}`);
        console.log(`  Has New Hero Text: ${hasNewHero}`);
        console.log(`  Has Orbit Elements: ${hasOrbit}`);

        if (scriptMatch && scriptMatch[0] !== 'index-DrAC8f0O.js') {
          console.log(`\n🎉 NEW PRODUCTION DEPLOYMENT IS LIVE ON ${domain} (Bundle: ${scriptMatch[0]})!`);
          return true;
        }
      } catch (err) {
        console.error(`  Error querying ${domain}:`, err.message);
      }
    }

    await new Promise(r => setTimeout(r, 6000));
  }

  console.log('Deployment polling timed out after 20 attempts.');
  return false;
}

checkDeployment().then(success => {
  process.exit(success ? 0 : 1);
});
