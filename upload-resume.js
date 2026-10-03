const { chromium } = require('playwright');
const fs = require('fs');
const https = require('https');
const http = require('http');

// Try to use proxy-free stealth
async function uploadResume() {
  console.log('🚀 Starting Naukri resume upload...');
  
  // Launch with stealth settings
  const browser = await chromium.launch({ 
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });
  
  const context = await browser.newContext({ 
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'Asia/Kolkata'
  });
  
  // Load cookies from file
  const cookiesData = JSON.parse(fs.readFileSync('cookies.json', 'utf8'));
  
  const cookies = cookiesData.map(c => ({
    domain: c.domain,
    expires: c.expirationDate || -1,
    httpOnly: c.httpOnly || false,
    name: c.name,
    path: c.path || '/',
    secure: c.secure || true,
    sameSite: c.sameSite === 'Lax' ? 'Lax' : c.sameSite === 'None' ? 'None' : 'Strict',
    value: c.value
  }));
  
  // First go to a page to set cookies properly
  await context.addCookies(cookies);
  console.log('✅ Cookies added');
  
  const page = await context.newPage();
  
  // Bypass automation detection
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });
  
  console.log('🌐 Navigating to Naukri...');
  
  // Try different approach - go to login first then navigate
  try {
    await page.goto('https://www.naukri.com/nlogin/login', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);
    
    // Check if we're logged in by checking URL
    console.log(`📍 After login page: ${page.url()}`);
    
    // If redirected away from login, we're logged in
    if (!page.url().includes('login')) {
      console.log('✅ Logged in via cookies');
    }
    
    // Now go to profile
    await page.goto('https://www.naukri.com/mnjuser/profile', { waitUntil: 'networkidle', timeout: 25000 });
    await page.waitForTimeout(5000);
    
    console.log(`📍 Profile: ${page.url()}`);
    
    // Get page content for analysis
    const content = await page.content();
    const hasResumeSection = content.includes('resume') || content.includes('Resume');
    console.log(`📄 Page contains resume: ${hasResumeSection}`);
    
    // Try to find upload section
    const uploadSections = await page.$$('[class*="resume"], [id*="resume"], [name*="resume"]');
    console.log(`📄 Found ${uploadSections.length} resume-related elements`);
    
  } catch (e) {
    console.log(`⚠️ Navigation error: ${e.message}`);
  }
  
  console.log(`✅ Done at ${new Date().toISOString()}`);
  await browser.close();
}

uploadResume().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
