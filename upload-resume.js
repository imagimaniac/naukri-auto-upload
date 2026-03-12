const { chromium } = require('playwright');
const fs = require('fs');

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

const RESUME_PATH = './PratikResumeOct25.pdf';

async function uploadResume() {
  console.log('🚀 Starting Naukri resume upload...');
  console.log(`📅 Time: ${new Date().toISOString()}`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  
  await context.addCookies(cookies);
  console.log('✅ Cookies added');
  
  const page = await context.newPage();
  
  console.log('🌐 Navigating to Naukri...');
  await page.goto('https://www.naukri.com/mnjuser/homepage', { waitUntil: 'networkidle', timeout: 30000 });
  
  const url = page.url();
  console.log(`📍 Current URL: ${url}`);
  
  if (url.includes('login') || url.includes('auth')) {
    console.log('❌ Login failed - cookies may have expired');
    await browser.close();
    process.exit(1);
  }
  
  console.log('✅ Logged in successfully');
  
  // Try multiple profile URLs
  const profileUrls = [
    'https://www.naukri.com/mnjuser/profile',
    'https://www.naukri.com/mnjuser/profileView',
    'https://www.naukri.com/nprofile/profile'
  ];
  
  for (const profileUrl of profileUrls) {
    console.log(`📍 Trying: ${profileUrl}`);
    await page.goto(profileUrl, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Look for any file input or upload button
    const fileInput = await page.$('input[type="file"]');
    const uploadButtons = await page.$$('button');
    
    console.log(`   Found ${uploadButtons.length} buttons, checking for upload option...`);
    
    if (fileInput) {
      console.log('   ✅ Found file input!');
      await fileInput.setInputFiles(RESUME_PATH);
      await page.waitForTimeout(3000);
      
      // Look for save/submit button
      const saveBtn = await page.$('button:has-text("Save"), button:has-text("submit"), button:has-text("Update")');
      if (saveBtn) {
        await saveBtn.click();
        console.log('   ✅ Clicked save button');
        await page.waitForTimeout(2000);
      }
      
      console.log('✅ Resume upload completed!');
      await browser.close();
      return;
    }
  }
  
  // If we can't find file input, try clicking on profile edit
  console.log('🔄 Trying alternative: clicking edit profile...');
  await page.goto('https://www.naukri.com/nprofile/editProfile', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  
  const editFileInput = await page.$('input[type="file"]');
  if (editFileInput) {
    await editFileInput.setInputFiles(RESUME_PATH);
    console.log('✅ Resume uploaded via edit profile!');
    await page.waitForTimeout(3000);
  } else {
    console.log('⚠️ Could not find upload element, but process completed');
    console.log('📝 This may need manual verification');
  }
  
  console.log(`✅ Process completed at ${new Date().toISOString()}`);
  await browser.close();
}

uploadResume().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
