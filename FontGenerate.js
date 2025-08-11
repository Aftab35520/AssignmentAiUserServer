// calligraphr-automation.js

const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');
const fs = require('fs');
const chromedriver = require('chromedriver');
const { ServiceBuilder } = require('selenium-webdriver/chrome');
const a=require("")
const service = new ServiceBuilder(chromedriver.path)

const EMAIL = 'aftab.alam355201@gmail.com';
const PASSWORD = '#Aftab35520';




// const options = new chrome.Options()
//   .addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage')
//   .setUserPreferences({
//     'download.default_directory': DOWNLOAD_DIR,
//     'download.prompt_for_download': false,
//     'download.directory_upgrade': true,
//     'safebrowsing.enabled': true,
//   });

async function generateFont(email) {
  const DOWNLOAD_DIR = path.resolve(__dirname, `download_folder/${email}`);
  const TEMPLATE_PATH = path.resolve(__dirname, `./uploads/${email}.png`);
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);
  const options = new chrome.Options()
    .addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage')
      .setUserPreferences({
    'download.default_directory': DOWNLOAD_DIR,
    'download.prompt_for_download': false,
    'download.directory_upgrade': true,
    'safebrowsing.enabled': true,
  });

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeService(service)  // pass ServiceBuilder instance directly, no .build()
    .setChromeOptions(options)
    .build();

  try {
    // ─── 1️⃣ Open homepage ─────────────────────────────────────────────
    console.log('Opening Calligraphr...');
    await driver.get('https://www.calligraphr.com/en/');

    // ─── 2️⃣ Click "Login" ─────────────────────────────────────────────
    console.log('Clicking login...');
    await driver.wait(
      until.elementLocated(By.xpath("//a[contains(., 'Log in') or contains(., 'LOG IN')]")),
      30000
    ).click();

    // ─── 3️⃣ Enter login details ────────────────────────────────────────
    console.log('Logging in...');
    await driver.wait(until.elementLocated(By.id('id_username')), 30000)
                .sendKeys(EMAIL);
    await driver.findElement(By.id('id_password'))
                .sendKeys(PASSWORD, Key.RETURN);

    // ─── 4️⃣ Click on "My Fonts" ────────────────────────────────────────
    console.log('Navigating to My Fonts...');
    await driver.wait(
      until.elementLocated(By.xpath("//a[contains(., 'My Fonts')]")),
      30000
    ).click();

    // ─── 5️⃣ Click "Upload Template" ───────────────────────────────────
    console.log('Preparing to upload template...');
    await driver.wait(
      until.elementLocated(By.xpath("//a[contains(., 'Upload Template')]")),
      30000
    ).click();

    // ─── 6️⃣ Upload template ────────────────────────────────────────────
    console.log(`Uploading template from ${TEMPLATE_PATH}...`);
    if (!fs.existsSync(TEMPLATE_PATH)) {
      throw new Error(`Template not found: ${TEMPLATE_PATH}`);
    }

    let uploadSucceeded = false;
    for (const selector of [
      "input[type='file']",
      "input[name='image_file']",
      "//input[@type='file']"
    ]) {
      try {
        const el = selector.startsWith('//')
          ? await driver.findElement(By.xpath(selector))
          : await driver.findElement(By.css(selector));
        await driver.executeScript(
          "arguments[0].style.visibility='visible'; arguments[0].style.display='block';",
          el
        );
        await el.sendKeys(TEMPLATE_PATH);
        await driver.sleep(2000);
        uploadSucceeded = true;
        console.log(`Uploaded via selector: ${selector}`);
        break;
      } catch (e) {
        console.warn(`Upload attempt failed with ${selector}: ${e.message}`);
      }
    }
    if (!uploadSucceeded) {
      throw new Error('File upload failed with all selectors');
    }

    // quick check
    const pageHTML = await driver.getPageSource();
    if (!/Upload successful|Processing/.test(pageHTML)) {
      console.warn('Warning: No upload confirmation detected');
    }

    // ─── 7️⃣ Submit upload ──────────────────────────────────────────────
    console.log('Submitting upload...');
    await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Upload') or contains(., 'UPLOAD')] | //input[contains(@value, 'Upload')]")),
      10000
    ).click();

    await driver.wait(async () => {
      const html = await driver.getPageSource();
      return /Upload successful|Processing/.test(html);
    }, 30000);
    console.log('Template submitted');

    // ─── 8️⃣ Add characters ─────────────────────────────────────────────
    console.log('Processing template...');
    try {
      const btn = await driver.wait(
        until.elementLocated(By.id('upload-template-add-chars-button')),
        30000
      );
      await btn.click();
      console.log("Clicked 'Add characters to your font'");
    } catch (e1) {
      console.warn(`Error clicking by ID: ${e1.message}`);
      try {
        const btn2 = await driver.wait(
          until.elementLocated(By.css('button.mdl-button.mdl-button--primary')),
          10000
        );
        await btn2.click();
        console.log('Clicked via CSS fallback');
      } catch (e2) {
        throw new Error(`Fallback failed for Add Characters: ${e2.message}`);
        return ;
      }
    }

    // ─── 9️⃣ Build Font ─────────────────────────────────────────────────
    try {
      const btn = await driver.wait(
        until.elementLocated(By.id('fonts-tb-build-font')),
        30000
      );
      await btn.click();
      console.log("Clicked 'Build Font' button");
    } catch (e1) {
      console.warn(`Error clicking Build Font by ID: ${e1.message}`);
      try {
        const btn2 = await driver.wait(
          until.elementLocated(By.xpath("//a[@title='Build a font file using the character images below.']")),
          10000
        );
        await btn2.click();
        console.log('Clicked via title-attribute fallback');
      } catch {
        const btn3 = await driver.findElement(By.id('fonts-tb-build-font'));
        await driver.executeScript('arguments[0].click();', btn3);
        console.log('Clicked via JavaScript fallback');
      }
    }

    // ─── 🔟 Final Build click ────────────────────────────────────────────
    try {
      const btn = await driver.wait(
        until.elementLocated(By.id('build-font-submit-button')),
        30000
      );
      await btn.click();
      console.log("Clicked 'Build' using ID");
      await driver.sleep(10000);
    } catch (e1) {
      console.warn(`Error clicking final Build by ID: ${e1.message}`);
      try {
        const btn2 = await driver.wait(
          until.elementLocated(By.xpath("//button[text()='Build']")),
          10000
        );
        await btn2.click();
        console.log('Clicked via text fallback');
        await driver.sleep(3000);
      } catch {
        try {
          const btn3 = await driver.findElement(By.id('build-font-submit-button'));
          await driver.executeScript('arguments[0].click();', btn3);
          console.log('Clicked via JavaScript fallback');
        } catch (e3) {
          await driver.takeScreenshot().then(img => {
            fs.writeFileSync('build_button_error.png', img, 'base64');
          });
          throw new Error(`Could not click Build button: ${e3.message}`);
        }
      }
    }

    // ─── 1️⃣1️⃣ Download TTF ─────────────────────────────────────────────
    console.log('Clicking Download TTF...');
    const downloadLink = await driver.wait(
      until.elementLocated(By.css("a.result-font-link[href$='.ttf']")),
      10000
    );
    const downloadUrl = await downloadLink.getAttribute('href');
    await downloadLink.click();
    console.log(`Clicked download link: ${downloadUrl}`);

    await driver.sleep(5000);

    const expected = path.join(DOWNLOAD_DIR, `Myfont-Regular.ttf`);
    if (fs.existsSync(expected)) {
      console.log(`✅ File downloaded: ${expected}`);
    } else {
      console.error('❌ File not found in', DOWNLOAD_DIR);
      const partials = fs.readdirSync(DOWNLOAD_DIR).filter(f => f.endsWith('.tmp') || f.endsWith('.crdownload'));
      if (partials.length) {
        console.warn('Found incomplete download:', partials[0]);
      } else {
        console.error('No download files found at all');
      }
    }

  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await driver.quit();
  }
}

module.exports=generateFont
