const { chromium } = require('playwright');
const fs = require('fs');

// Read cookies from file
const cookiesData = JSON.parse(fs.readFileSync('cookies.json', 'utf8'));

// Parse cookies and format for Playwright
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

const RESUME_PATH = './PratikResumeOct25.pdf';

async function uploadResume() {
  console.log('🚀 Starting Naukri resume upload...');
  console.log(`📅 Time: ${new Date().toISOString()}`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  // Add cookies
  await context.addCookies(cookies);
  console.log('✅ Cookies added');
  
  const page = await context.newPage();
  
  // Navigate to Naukri
  console.log('🌐 Navigating to Naukri...');
  await page.goto('https://www.naukri.com/mnjuser/homepage', { waitUntil: 'networkidle' });
  
  // Check if logged in
  const url = page.url();
  console.log(`📍 Current URL: ${url}`);
  
  if (url.includes('login') || url.includes('auth')) {
    console.log('❌ Login failed - cookies may have expired');
    await browser.close();
    process.exit(1);
  }
  
  console.log('✅ Logged in successfully');
  
  // Navigate to profile
  await page.goto('https://www.naukri.com/mnjuser/profile', { waitUntil: 'networkidle' });
  console.log('📍 Navigated to profile');
  
  // Wait for page to fully load
  await page.waitForTimeout(2000);
  
  // Find file input and upload
  try {
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles(RESUME_PATH);
      console.log('📄 Resume file selected');
      
      // Wait for upload
      await page.waitForTimeout(3000);
      
      console.log('✅ Resume upload initiated');
    } else {
      console.log('⚠️ File input not found, trying alternative method');
      
      // Alternative: click upload button and handle dialog
      const uploadBtn = await page.$('button:has-text("Upload"), button:has-text("upload")');
      if (uploadBtn) {
        await uploadBtn.click();
        console.log('🔄 Clicked upload button');
      }
    }
  } catch (error) {
    console.log(`⚠️ Upload error: ${error.message}`);
  }
  
  // Final status
  console.log(`✅ Upload process completed at ${new Date().toISOString()}`);
  console.log(`📝 Resume: ${RESUME_PATH}`);
  
  await browser.close();
  console.log('👋 Browser closed');
}

uploadResume().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
