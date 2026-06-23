/**
 * Credo Setu - Single File Application Logic
 */

// ==========================================
// 0. THEME LOGIC
// ==========================================
function initTheme() {
  const savedTheme = localStorage.getItem('credo_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}
initTheme(); // Run immediately

window.toggleTheme = function() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('credo_theme', newTheme);
};

// ==========================================
// 1. CORE DATA STORE
// ==========================================
const STORE_KEY = 'credo_setu_v4';
const defaultState = {
  merchant: null,
  transactions: [],
  peerRequests: []
};

function getStore() {
  try {
    const data = localStorage.getItem(STORE_KEY);
    return data ? JSON.parse(data) : JSON.parse(JSON.stringify(defaultState));
  } catch(e) {
    console.error("Local storage parse error:", e);
    return JSON.parse(JSON.stringify(defaultState));
  }
}

function saveStore(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function initPeerRequests() {
  const store = getStore();
  if (store.peerRequests.length === 0) {
    store.peerRequests = [
      { id: 'req_1', name: 'Rajesh (Web Dev)', amount: 15000, type: 'freelance', time: Date.now() - 3600000, status: 'pending' },
      { id: 'req_2', name: 'Anita (Boutique)', amount: 2500, type: 'sale', time: Date.now() - 7200000, status: 'pending' },
      { id: 'req_3', name: 'Vikram (Creator)', amount: 8000, type: 'repayment', time: Date.now() - 14400000, status: 'pending' }
    ];
    saveStore(store);
  }
}

// ==========================================
// 2. CRYPTO & LEDGER
// ==========================================
async function generateHash(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function addTransaction(type, amount, identifier) {
  const store = getStore();
  const prevTx = store.transactions.length > 0 ? store.transactions[0] : null; 
  const prevHash = prevTx ? prevTx.hash : 'GENESIS_000000000000000000000000';
  
  const tx = {
    id: `tx_${Date.now()}`,
    timestamp: Date.now(),
    type,
    amount: Number(amount),
    identifier: identifier || 'Anonymous',
    status: 'pending',
    prevHash
  };

  const dataStr = `${tx.id}|${tx.timestamp}|${tx.amount}|${tx.type}|${prevHash}`;
  tx.hash = await generateHash(dataStr);
  
  store.transactions.unshift(tx);
  saveStore(store);
  
  recalculateScore();
}

function autoValidateTransactions() {
  const store = getStore();
  let changed = false;
  store.transactions.forEach(tx => {
    if (tx.status === 'pending' && (Date.now() - tx.timestamp > 8000)) {
      tx.status = 'verified';
      changed = true;
    }
  });
  if (changed) {
    saveStore(store);
    recalculateScore();
    if(document.getElementById('view-merchant').classList.contains('active')) {
      renderDashboard();
    }
  }
}
setInterval(autoValidateTransactions, 4000);

// ==========================================
// 3. AI SCORING
// ==========================================
function recalculateScore() {
  const store = getStore();
  if(!store.merchant) return;
  
  let score = 300; 
  const verifiedTxs = store.transactions.filter(t => t.status === 'verified');
  
  score += Math.min(verifiedTxs.length * 8, 250);
  const totalVal = verifiedTxs.reduce((sum, t) => sum + t.amount, 0);
  score += Math.min(Math.floor(totalVal / 1000) * 5, 200);
  
  const approvedPeers = store.peerRequests.filter(p => p.status === 'approved').length;
  score += Math.min(approvedPeers * 20, 100);
  
  if(store.merchant.assets) {
    if(store.merchant.assets.card) score += 40;
    if(store.merchant.assets.itr) score += 75;
  }
  
  if(score > 850) score = 850;
  
  store.merchant.score = score;
  saveStore(store);
  return score;
}

// ==========================================
// 4. UI ROUTING & WIZARD
// ==========================================
let tempKycStatus = false;
let tempBankStatus = false;

window.switchView = function(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
  
  if (viewId === 'view-nbfc') {
    document.body.classList.add('nbfc-mode');
    renderNBFC();
  } else {
    document.body.classList.remove('nbfc-mode');
  }
  
  if (viewId === 'view-merchant') {
    renderDashboard();
  }
};

window.wizardNext = function(step) {
  document.querySelectorAll('#view-onboarding .wizard-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`step-${step}`).classList.add('active');
  
  document.querySelectorAll('.step-dot').forEach((dot, index) => {
    dot.classList.remove('current', 'completed');
    if (index + 1 < step) dot.classList.add('completed');
    if (index + 1 === step) dot.classList.add('current');
  });
};

window.simulateKYC = function(didVerify) {
  tempKycStatus = didVerify;
  document.getElementById('kycInputs').style.display = 'none';
  document.getElementById('kycLoader').style.display = 'flex';
  const title = document.querySelector('#kycLoader h3');
  if(title) title.textContent = didVerify ? 'Verifying with UIDAI...' : 'Simulating Demo Mode...';
  
  setTimeout(() => window.wizardNext(3), didVerify ? 2000 : 1000);
};

window.simulateBankFetch = function(didVerify) {
  tempBankStatus = didVerify;
  document.getElementById('bankInputs').style.display = 'none';
  document.getElementById('bankLoader').style.display = 'flex';
  const title = document.querySelector('#bankLoader h3');
  if(title) title.textContent = didVerify ? 'Connecting to Account Aggregator...' : 'Finalizing Demo Account...';
  
  setTimeout(() => window.completeOnboarding(), didVerify ? 2500 : 1200);
};

window.completeOnboarding = function() {
  try {
    const name = document.getElementById('regName').value || 'Independent Worker';
    const type = document.getElementById('regType').value;
    const phone = document.getElementById('regPhone').value || '0000000000';
    
    const store = getStore();
    store.merchant = {
      id: `UID_${Math.floor(Math.random()*1000000)}`,
      name, type, phone, score: 300, joined: Date.now(),
      kycVerified: tempKycStatus,
      bankLinked: tempBankStatus,
      assets: { card: false, itr: false }
    };
    saveStore(store);
    initPeerRequests();

    // Reset wizard loaders/inputs so they don't persist
    document.getElementById('kycLoader').style.display = 'none';
    document.getElementById('kycInputs').style.display = '';
    document.getElementById('bankLoader').style.display = 'none';
    document.getElementById('bankInputs').style.display = '';

    window.switchView('view-merchant');
    window.switchTab('home', document.querySelector('.nav-btn')); // Ensure home tab is active
  } catch(err) {
    console.error(err);
    alert("Application Error: " + err.message);
  }
};

// ==========================================
// 5. DASHBOARD UI
// ==========================================
window.switchTab = function(tabId, btnElement) {
  document.querySelectorAll('#view-merchant .wizard-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`tab-${tabId}`).classList.add('active');
  
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  btnElement.classList.add('active');
  
  renderDashboard();
};

window.openTxModal = function() { document.getElementById('txModal').classList.add('active'); };
window.closeTxModal = function() { document.getElementById('txModal').classList.remove('active'); };

window.submitTransaction = async function() {
  const type = document.getElementById('txType').value;
  const amount = document.getElementById('txAmount').value;
  const identifier = document.getElementById('txPhone').value;
  
  if(!amount) return alert('Enter amount');
  
  await addTransaction(type, amount, identifier);
  window.closeTxModal();
  document.getElementById('txAmount').value = '';
  document.getElementById('txPhone').value = '';
  renderDashboard();
};

window.approvePeer = function(id) {
  const store = getStore();
  const req = store.peerRequests.find(r => r.id === id);
  if(req) {
    req.status = 'approved';
    saveStore(store);
    recalculateScore();
    renderDashboard();
  }
};

let currentScoreDisplayed = 300;

function renderDashboard() {
  const store = getStore();
  if(!store.merchant) return;
  
  // Adaptive Terminology (Simple Mode for Vendors)
  const isVendor = store.merchant.type === 'merchant';
  document.querySelectorAll('.lbl-score').forEach(el => el.textContent = isVendor ? 'Trust Points' : 'AI Trust Score');
  document.querySelectorAll('.lbl-ledger').forEach(el => el.textContent = isVendor ? 'Book' : 'Ledger');
  document.querySelectorAll('.lbl-network').forEach(el => el.textContent = isVendor ? 'Community' : 'Network');
  document.querySelectorAll('.lbl-new-tx').forEach(el => el.textContent = isVendor ? 'Add Entry' : 'Record Transaction');
  document.querySelectorAll('.lbl-ledger-title').forEach(el => el.textContent = isVendor ? 'Daily Khata Book' : 'Decentralized Ledger');
  document.querySelectorAll('.lbl-ledger-desc').forEach(el => el.textContent = isVendor ? 'Your daily secure business entries.' : 'All transactions are cryptographically hashed via SHA-256 and stored on the peer network.');
  document.querySelectorAll('.lbl-network-title').forEach(el => el.textContent = isVendor ? 'Community Support' : 'Peer Validation');
  document.querySelectorAll('.lbl-network-desc').forEach(el => el.textContent = isVendor ? 'Help other vendors confirm their business to build mutual trust.' : 'Boost your AI Trust Score by validating transactions from fellow independent professionals.');

  document.getElementById('dashNameDisplay').textContent = store.merchant.name;
  
  // Profile Badges
  if(store.merchant.kycVerified) {
    const b = document.getElementById('badgeKyc');
    b.querySelector('.badge-icon').className = 'badge-icon success';
    b.querySelector('.badge-title').textContent = 'KYC Verified';
    b.querySelector('.badge-desc').textContent = 'Aadhaar & PAN Linked';
  }
  if(store.merchant.bankLinked) {
    const b = document.getElementById('badgeBank');
    b.querySelector('.badge-icon').className = 'badge-icon success';
    b.querySelector('.badge-title').textContent = 'Bank Linked';
    b.querySelector('.badge-desc').textContent = 'Account Aggregator Active';
  }

  // Animated Score
  const targetScore = store.merchant.score || 300;
  document.getElementById('profScoreVal').textContent = targetScore;
  if (currentScoreDisplayed !== targetScore) {
    let current = currentScoreDisplayed;
    const diff = targetScore - current;
    const inc = diff / 20; 
    const timer = setInterval(() => {
      current += inc;
      if ((inc > 0 && current >= targetScore) || (inc < 0 && current <= targetScore)) {
        current = targetScore;
        clearInterval(timer);
      }
      currentScoreDisplayed = Math.round(current);
      updateScoreRing(currentScoreDisplayed);
    }, 30);
  } else {
    updateScoreRing(targetScore);
  }
  
  // Render Assets
  if(store.merchant.assets) {
    if(store.merchant.assets.card) {
      const cardEl = document.getElementById('assetCard');
      cardEl.querySelector('.asset-status').textContent = '1 Linked';
      cardEl.querySelector('.asset-status').style.color = 'var(--accent-success)';
      cardEl.querySelector('.asset-btn').outerHTML = '<i class="fa-solid fa-circle-check text-success" style="font-size:24px;"></i>';
    }
    if(store.merchant.assets.itr) {
      const itrEl = document.getElementById('assetItr');
      itrEl.querySelector('.asset-status').textContent = 'Verified';
      itrEl.querySelector('.asset-status').style.color = 'var(--accent-success)';
      itrEl.querySelector('.asset-btn').outerHTML = '<i class="fa-solid fa-circle-check text-success" style="font-size:24px;"></i>';
    }
  }

  const verifiedTxs = store.transactions.filter(t => t.status === 'verified');
  document.getElementById('dashTxCount').textContent = verifiedTxs.length;
  
  // Render Lists
  const createTxHTML = (tx) => {
    const isIncome = ['sale', 'freelance', 'repayment'].includes(tx.type);
    const sign = isIncome ? '+' : '-';
    const color = isIncome ? 'var(--accent-success)' : 'var(--accent-danger)';
    const date = new Date(tx.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const badge = tx.status === 'verified' ? '<span class="status-badge verified">Verified</span>' : '<span class="status-badge pending">Validating</span>';
    
    return `
      <div class="tx-card">
        <div>
          <div style="font-weight: 600;">${tx.type.toUpperCase()} • ${tx.identifier}</div>
          <div class="tx-hash">${tx.hash.substring(0,16)}...</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${date}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 18px; font-weight: 700; color: ${color};">${sign}₹${tx.amount}</div>
          <div style="margin-top: 6px;">${badge}</div>
        </div>
      </div>
    `;
  };

  document.getElementById('recentTxList').innerHTML = store.transactions.slice(0,3).map(createTxHTML).join('') || '<p style="color:var(--text-muted);">No transactions yet.</p>';
  document.getElementById('fullTxList').innerHTML = store.transactions.map(createTxHTML).join('') || '<p style="color:var(--text-muted);">Ledger is empty.</p>';
  
  // Render Peers
  const pendingPeers = store.peerRequests.filter(p => p.status === 'pending');
  const peerHTML = pendingPeers.map(p => `
    <div class="glass" style="padding: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
          <div style="font-weight: 600; font-size: 16px;">${p.name}</div>
          <div style="font-size: 12px; color: var(--text-muted);">Recorded a ${p.type.toUpperCase()}</div>
        </div>
        <div style="font-size: 18px; font-weight: 700;">₹${p.amount}</div>
      </div>
      <button class="btn btn-primary" onclick="window.approvePeer('${p.id}')">
        <i class="fa-solid fa-check"></i> Validate
      </button>
    </div>
  `).join('');
  document.getElementById('peerRequestsList').innerHTML = peerHTML || '<div class="glass" style="text-align:center;"><i class="fa-solid fa-check-double text-success" style="font-size:32px; margin-bottom:12px;"></i><div>All network transactions validated!</div></div>';
}

function updateScoreRing(score) {
  document.getElementById('scoreDisplay').textContent = score;
  const pct = (score - 300) / 550; // max 850
  const offset = 502 - (502 * pct);
  document.getElementById('scoreCircle').style.strokeDashoffset = offset;
}

window.linkAsset = function(type) {
  const store = getStore();
  if(!store.merchant) return;
  
  // Simulate API fetch delay
  const btn = document.querySelector(`#asset${type === 'card' ? 'Card' : 'Itr'} .asset-btn`);
  btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
  btn.disabled = true;
  
  setTimeout(() => {
    store.merchant.assets = store.merchant.assets || {};
    store.merchant.assets[type] = true;
    saveStore(store);
    recalculateScore();
    renderDashboard();
  }, 1500);
};

// ==========================================
// 6. NBFC DASHBOARD
// ==========================================
function renderNBFC() {
  const store = getStore();
  const dummies = [
    { name: 'Node #9x8F (Freelancer)', score: 780, vol: '₹340,000' },
    { name: 'Node #2a1C (Boutique)', score: 450, vol: '₹12,500' },
    { name: 'Node #7b4D (Creator)', score: 810, vol: '₹890,000' }
  ];

  if (store.merchant) {
    const totalVol = store.transactions.filter(t=>t.status==='verified').reduce((s,t)=>s+t.amount,0);
    dummies.unshift({
      name: `${store.merchant.name} (Local Demo)`,
      score: store.merchant.score,
      vol: `₹${totalVol}`
    });
  }

  const html = dummies.map(d => {
    const color = d.score > 600 ? 'var(--accent-success)' : (d.score > 400 ? 'var(--accent-warning)' : 'var(--accent-danger)');
    return `
      <div class="glass" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
          <div>
            <h3 style="font-size: 16px;">${d.name}</h3>
            <div style="font-size: 11px; color: var(--text-muted); font-family: monospace; margin-top: 4px;">SHA256 LINKED</div>
          </div>
          <div style="background: var(--input-bg); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid ${color}; text-align: center;">
            <div style="font-size: 20px; font-weight: 800; color: ${color};">${d.score}</div>
            <div style="font-size: 9px; color: var(--text-muted); letter-spacing: 1px;">AI SCORE</div>
          </div>
        </div>
        <div style="background: var(--input-bg); padding: 12px; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div style="font-size: 12px; color: var(--text-secondary);">Verified Volume</div>
          <div style="font-weight: 700;">${d.vol}</div>
        </div>
        <button class="btn btn-secondary" style="font-size: 13px; padding: 12px;"><i class="fa-solid fa-code-merge"></i> View Merkle Chain</button>
      </div>
    `;
  }).join('');
  document.getElementById('nbfcGrid').innerHTML = html;
}

// ==========================================
// 7. DOWNLOAD REPORT (PRINT)
// ==========================================
window.downloadReport = function() {
  const store = getStore();
  if(!store.merchant) return;

  document.getElementById('prName').textContent = store.merchant.name;
  document.getElementById('prType').textContent = store.merchant.type.toUpperCase();
  document.getElementById('prPhone').textContent = store.merchant.phone;
  document.getElementById('prKyc').textContent = store.merchant.kycVerified ? "Yes (Aadhaar & PAN)" : "No (Demo Mode)";
  document.getElementById('prScore').textContent = store.merchant.score;

  const verified = store.transactions.filter(t => t.status === 'verified');
  document.getElementById('prTable').innerHTML = verified.map(t => {
    const d = new Date(t.timestamp).toLocaleString();
    return `<tr><td>${d}</td><td>${t.type.toUpperCase()}</td><td>${t.identifier}</td><td>${t.amount}</td><td style="font-family:monospace; font-size:10px;">${t.hash}</td></tr>`;
  }).join('');

  window.print();
};

// ==========================================
// 8. INITIALIZATION
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  const store = getStore();
  if (store.merchant) {
    window.switchView('view-merchant');
  } else {
    window.switchView('view-onboarding');
  }
});
