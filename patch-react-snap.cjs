const fs = require('fs');
const p = './node_modules/react-snap/src/puppeteer_utils.js';
if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/await page\._client\.send/g, 'await (typeof page.createCDPSession === "function" ? await page.createCDPSession() : page._client).send');
    fs.writeFileSync(p, c);
}
const trackerFile = './node_modules/react-snap/src/tracker.js';
if (fs.existsSync(trackerFile)) {
    let c = fs.readFileSync(trackerFile, 'utf8');
    c = c.replace(/page\.removeListener/g, '(page.off || page.removeListener).bind(page)');
    fs.writeFileSync(trackerFile, c);
}
