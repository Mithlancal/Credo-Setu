const fs = require('fs');
const { JSDOM } = require("jsdom");

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });

const window = dom.window;
const document = window.document;

const b = document.getElementById('badgeKyc');
try {
    const first = b.querySelector('div > div:first-child');
    const last = b.querySelector('div > div:last-child');
    console.log("First child:", first ? first.outerHTML : "null");
    console.log("Last child:", last ? last.outerHTML : "null");
} catch(e) {
    console.log("Error:", e);
}
