const fs = require('fs');
const file = './node_modules/react-snap/src/puppeteer_utils.js';
if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/await page\._client\.send/g, 'await (typeof page.createCDPSession === "function" ? await page.createCDPSession() : page._client).send');
    fs.writeFileSync(file, code);
    console.log('Patched react-snap successfully.');
}
