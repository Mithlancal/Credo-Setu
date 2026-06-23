import { getStore } from '../core/store.js';

document.addEventListener('DOMContentLoaded', () => {
  renderMerchantGrid();
});

function renderMerchantGrid() {
  const store = getStore();
  const grid = document.getElementById('merchantGrid');
  
  // We mock a few merchants and append our local merchant if it exists
  const dummyMerchants = [
    { id: 'mer_1', name: 'Anonymized Vendor #849', score: 720, volume: '₹1,45,000', risk: 'Low' },
    { id: 'mer_2', name: 'Anonymized Vendor #102', score: 450, volume: '₹22,000', risk: 'Medium' },
    { id: 'mer_3', name: 'Anonymized Vendor #553', score: 810, volume: '₹3,50,000', risk: 'Low' }
  ];

  if (store.merchant && store.merchant.id) {
    const totalVol = store.transactions
      .filter(t => t.status === 'verified')
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    dummyMerchants.unshift({
      id: store.merchant.id,
      name: `${store.merchant.name} (Local Demo)`,
      score: store.merchant.score,
      volume: `₹${totalVol}`,
      risk: store.merchant.score > 600 ? 'Low' : (store.merchant.score > 400 ? 'Medium' : 'High')
    });
  }

  let html = '';
  dummyMerchants.forEach(m => {
    const riskColor = m.risk === 'Low' ? 'var(--accent-green)' : (m.risk === 'Medium' ? '#fcd34d' : '#f43f5e');
    
    html += `
      <div class="glass-panel" style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h3 style="font-size: 18px; margin-bottom: 4px;">${m.name}</h3>
            <p style="font-size: 12px; color: var(--text-secondary); font-family: monospace;">ID: ${m.id}</p>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 8px; text-align: center; min-width: 60px;">
            <div style="font-size: 20px; font-weight: bold; color: ${riskColor};">${m.score}</div>
            <div style="font-size: 10px; color: var(--text-secondary);">SCORE</div>
          </div>
        </div>
        
        <div style="background: rgba(0,0,0,0.2); border-radius: 8px; padding: 12px; display: flex; justify-content: space-between;">
          <div>
            <div style="font-size: 11px; color: var(--text-secondary);">Verified Volume</div>
            <div style="font-weight: bold;">${m.volume}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; color: var(--text-secondary);">Risk Level</div>
            <div style="font-weight: bold; color: ${riskColor};">${m.risk}</div>
          </div>
        </div>
        
        <button class="btn-secondary" style="width: 100%;">View Decentralized Ledger</button>
      </div>
    `;
  });

  grid.innerHTML = html;
}
