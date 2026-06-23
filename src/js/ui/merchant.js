import { getStore } from '../core/store.js';
import { addTransaction, getTransactions } from '../core/ledger.js';
import { getPendingPeerRequests, approvePeerRequest, autoValidateOurTransactions } from '../core/peerNetwork.js';
import { getScore, recalculateScore } from '../core/scoring.js';

document.addEventListener('DOMContentLoaded', () => {
  const store = getStore();
  if (!store.merchant.id) {
    window.location.href = '../../index.html';
    return;
  }

  // Initial UI Setup
  document.getElementById('merchantNameDisplay').textContent = store.merchant.name;
  updateScoreUI();
  renderTxList();
  renderPeerRequests();

  // Tab Switching Logic
  const tabs = document.querySelectorAll('.tab-content');
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // update active nav
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      // show content
      const tabId = item.getAttribute('data-tab');
      tabs.forEach(t => t.style.display = 'none');
      document.getElementById(`tab-${tabId}`).style.display = 'block';

      // specific tab actions
      if (tabId === 'network') renderPeerRequests();
      if (tabId === 'transactions') renderTxList(true);
      if (tabId === 'home') {
        updateScoreUI();
        renderTxList();
      }
    });
  });

  document.getElementById('viewAllTx').addEventListener('click', () => {
    document.querySelector('.nav-item[data-tab="transactions"]').click();
  });

  // Modal Logic
  const txModal = document.getElementById('txModal');
  const btnNewTx = document.getElementById('btnNewTx');
  const closeTxModal = document.getElementById('closeTxModal');
  
  btnNewTx.addEventListener('click', () => txModal.classList.add('active'));
  closeTxModal.addEventListener('click', () => txModal.classList.remove('active'));

  // Handle Form Submission
  document.getElementById('txForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = document.getElementById('txType').value;
    const amount = document.getElementById('txAmount').value;
    const phone = document.getElementById('txPhone').value;

    await addTransaction({ type, amount, customerPhone: phone });
    
    txModal.classList.remove('active');
    document.getElementById('txForm').reset();
    
    updateScoreUI();
    renderTxList();
  });

  // Background task to simulate network validating our transactions
  setInterval(() => {
    autoValidateOurTransactions();
    updateScoreUI();
    renderTxList(); // re-render if we are on the page
  }, 5000);

});

// --- UI Helper Functions ---

function updateScoreUI() {
  const score = recalculateScore(); // get latest
  const display = document.getElementById('scoreDisplay');
  const ring = document.getElementById('scoreRing');
  
  // Animate score count up
  let current = parseInt(display.textContent) || 300;
  if(current !== score) {
    const duration = 1000;
    const steps = 20;
    const stepTime = Math.abs(Math.floor(duration / steps));
    const diff = score - current;
    const inc = diff / steps;
    
    let timer = setInterval(() => {
      current += inc;
      if ((inc > 0 && current >= score) || (inc < 0 && current <= score)) {
        current = score;
        clearInterval(timer);
      }
      display.textContent = Math.round(current);
      
      // Calculate percentage for ring (range 300-850)
      const pct = ((Math.round(current) - 300) / 550) * 100;
      ring.style.setProperty('--score-pct', pct);
    }, stepTime);
  } else {
    display.textContent = score;
    const pct = ((score - 300) / 550) * 100;
    ring.style.setProperty('--score-pct', pct);
  }
}

function renderTxList(showAll = false) {
  const txs = getTransactions();
  const listRecent = document.getElementById('recentTxList');
  const listFull = document.getElementById('fullTxList');
  
  let html = '';
  if (txs.length === 0) {
    html = `<p style="text-align:center; color:var(--text-secondary); font-size:14px; padding:20px;">No transactions yet.</p>`;
  } else {
    const toShow = showAll ? txs : txs.slice(0, 3);
    toShow.forEach(tx => {
      const date = new Date(tx.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'});
      const sign = tx.type === 'sale' ? '+' : '-';
      html += `
        <div class="tx-item">
          <div class="tx-info">
            <h4>${tx.type === 'sale' ? 'Cash Sale' : 'Credit Given'}</h4>
            <p title="Merkle Hash: ${tx.hash}">#${tx.hash.substring(0,8)}... • ${date}</p>
          </div>
          <div style="text-align: right;">
            <div class="tx-amount ${tx.type}">${sign}₹${tx.amount}</div>
            <div class="tx-status ${tx.status === 'verified' ? 'verified' : 'pending'}">
              ${tx.status === 'verified' ? '<i class="fa-solid fa-check-double"></i> Verified' : '<i class="fa-solid fa-clock"></i> Pending'}
            </div>
          </div>
        </div>
      `;
    });
  }

  if(listRecent) listRecent.innerHTML = html;
  if(listFull) listFull.innerHTML = html;
}

function renderPeerRequests() {
  const requests = getPendingPeerRequests();
  const container = document.getElementById('peerRequestsList');
  
  if (requests.length === 0) {
    container.innerHTML = `<div class="glass-panel text-center"><p style="color:var(--text-secondary);">No pending requests on network.</p></div>`;
    return;
  }

  let html = '';
  requests.forEach(req => {
    const timeAgo = Math.floor((Date.now() - req.timestamp) / 60000); // mins
    html += `
      <div class="glass-panel" style="padding: 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <div>
            <h4 style="font-size: 16px;">${req.merchantName}</h4>
            <p style="font-size: 12px; color: var(--text-secondary);">${timeAgo} mins ago</p>
          </div>
          <div class="tx-amount ${req.type}" style="font-weight:bold; font-size:16px;">₹${req.amount}</div>
        </div>
        <button class="btn-primary" onclick="window.approvePeer('${req.id}')" style="padding: 10px;">
          <i class="fa-solid fa-check"></i> Validate Transaction
        </button>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Expose global function for the inline onclick handler in HTML strings
window.approvePeer = (reqId) => {
  approvePeerRequest(reqId);
  renderPeerRequests();
  updateScoreUI();
};
