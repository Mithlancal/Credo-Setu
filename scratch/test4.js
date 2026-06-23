const fs = require('fs');
const { JSDOM } = require("jsdom");

const html = fs.readFileSync('index.html', 'utf8');

// We need to bypass jsdom's SecurityError for localStorage on opaque origins.
// We can just use url: "http://localhost/"
const dom = new JSDOM(html, { url: "http://localhost/", runScripts: "dangerously" });
const window = dom.window;

window.crypto = { subtle: { digest: async () => new Uint8Array(32).buffer } };
global.crypto = window.crypto;

const scriptEl = window.document.createElement("script");
scriptEl.textContent = fs.readFileSync('./src/js/app.js', 'utf8');
window.document.body.appendChild(scriptEl);

try {
  console.log("Starting test...");
  window.document.getElementById('regName').value = "Test User";
  window.document.getElementById('regPhone').value = "1234567890";
  window.wizardNext(2);
  console.log("Step 2 active:", window.document.getElementById('step-2').classList.contains('active'));
  
  window.simulateKYC(false);
  console.log("Step 3 active:", window.document.getElementById('step-3').classList.contains('active'));
  
  window.simulateBankFetch(false);
  
  console.log("view-merchant active:", window.document.getElementById('view-merchant').classList.contains('active'));
  console.log("tab-home active:", window.document.getElementById('tab-home').classList.contains('active'));
  
  console.log("All OK!");
} catch(e) {
  console.error("Crash during test:", e);
}
