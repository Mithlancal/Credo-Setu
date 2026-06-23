const fs = require('fs');
const { JSDOM } = require("jsdom");

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;

window.localStorage = {
  store: {},
  getItem: function(k) { return this.store[k] || null; },
  setItem: function(k, v) { this.store[k] = v; }
};
window.crypto = { subtle: { digest: async () => new Uint8Array(32).buffer } };
global.crypto = window.crypto;

const scriptEl = window.document.createElement("script");
scriptEl.textContent = fs.readFileSync('./src/js/app.js', 'utf8');
window.document.body.appendChild(scriptEl);

try {
  // Step 1 -> 2
  window.wizardNext(2);
  console.log("Step 2 active:", window.document.getElementById('step-2').classList.contains('active'));
  
  // Step 2 -> 3
  window.simulateKYC(false);
  
  // Step 3 -> complete
  // simulateBankFetch has a setTimeout of 2500ms if true, but if false it's sync.
  window.simulateBankFetch(true);
  
  setTimeout(() => {
     console.log("Is view-merchant active?", window.document.getElementById('view-merchant').classList.contains('active'));
     console.log("Is tab-home active?", window.document.getElementById('tab-home').classList.contains('active'));
     console.log("Test finished.");
  }, 3000);
} catch(e) {
  console.error("Crash:", e);
}
