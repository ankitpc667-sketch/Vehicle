// capture.js - runs puppeteer to log in as customer and driver and capture key pages
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const baseUrl = 'https://car-rental-frontend-six-pied.vercel.app';
  const screenshotDir = path.resolve(__dirname, '../screenshots');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

  const accounts = [
    { role: 'customer', email: 'carrent9988@gmail.com', password: 'Carrent@168' },
    { role: 'driver',   email: 'carrent167@gmail.com', password: 'Carrent@188' },
  ];

  const pagesToVisit = {
    customer: [
      '/', // home redirects to role selection
      '/customer-dashboard',
      '/book-car',
      '/available-vehicles',
      '/my-bookings',
    ],
    driver: [
      '/',
      '/driver-dashboard',
      '/driver', // add vehicle form
      '/my-vehicles',
      '/driver-bookings',
    ],
  };

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  for (const acc of accounts) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // go to login page for the role
    const loginPath = acc.role === 'customer' ? '/login/user' : '/login/admin';
    await page.goto(`${baseUrl}${loginPath}`, { waitUntil: 'networkidle2' });

    // fill form (use generic selectors)
    await page.type('input[type="email"]', acc.email, { delay: 30 });
    await page.type('input[type="password"]', acc.password, { delay: 30 });
    // click submit button
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
    ]);

    // take a screenshot of the landing dashboard after login
    const rolePages = pagesToVisit[acc.role];
    for (const p of rolePages) {
      await page.goto(`${baseUrl}${p}`, { waitUntil: 'networkidle2' });
      // slight delay for UI animations to settle
      // slight delay for UI animations to settle
await new Promise(resolve => setTimeout(resolve, 1500));
      const fileName = `${acc.role}_${p.replace(/\//g, '_') || 'home'}.png`;
      const filePath = path.join(screenshotDir, fileName);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log('Saved', filePath);
    }
    await page.close();
  }
  await browser.close();
})();
