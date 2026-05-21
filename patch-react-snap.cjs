const fs = require('fs');
const p = './node_modules/react-snap/src/puppeteer_utils.js';
if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/await page\._client\.send/g, 'await (typeof page.createCDPSession === "function" ? await page.createCDPSession() : page._client).send');
    fs.writeFileSync(p, c);
}
