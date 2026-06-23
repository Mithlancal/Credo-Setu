import { getStore, saveStore } from './store.js';

/**
 * AI-Driven Credit Scoring Simulation.
 * Real implementation would use machine learning models trained on India Stack data.
 * Here we simulate it based on heuristic rules.
 */
export function recalculateScore() {
  const store = getStore();
  let baseScore = 300; // Minimum score
  
  const txs = store.transactions;
  const verifiedTxs = txs.filter(tx => tx.status === 'verified');
  
  // Rule 1: Volume of verified transactions (+2 points per tx, max +200)
  const volumeBonus = Math.min(verifiedTxs.length * 2, 200);
  
  // Rule 2: Total value of verified transactions (+1 point per ₹500, max +150)
  const totalValue = verifiedTxs.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const valueBonus = Math.min(Math.floor(totalValue / 500), 150);
  
  // Rule 3: Peer Validations Done (Active participation in network) (+5 per validation, max +150)
  // For simulation, we'll assume every verified tx implies active participation.
  const networkBonus = Math.min(verifiedTxs.length * 5, 150);
  
  let newScore = baseScore + volumeBonus + valueBonus + networkBonus;
  
  // Cap at 850
  if (newScore > 850) newScore = 850;
  
  store.merchant.score = newScore;
  saveStore(store);
  
  return newScore;
}

export function getScore() {
  return getStore().merchant.score;
}
