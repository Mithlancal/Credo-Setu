import { getStore, saveStore, initDummyDataIfNeeded } from './store.js';
import { recalculateScore } from './scoring.js';

/**
 * Simulates fellow merchants validating transactions.
 */
export function getPendingPeerRequests() {
  initDummyDataIfNeeded();
  return getStore().peerRequests.filter(req => req.status === 'pending');
}

/**
 * Approve a peer's transaction.
 * In a real system, this would sign the transaction and broadcast to the network.
 */
export function approvePeerRequest(requestId) {
  const store = getStore();
  const req = store.peerRequests.find(r => r.id === requestId);
  if (req) {
    req.status = 'approved';
    saveStore(store);
    // Approving a peer request boosts your own score (participation)
    recalculateScore();
  }
}

/**
 * Simulate network automatically validating OUR pending transactions after some time.
 */
export function autoValidateOurTransactions() {
  const store = getStore();
  let changed = false;
  
  store.transactions.forEach(tx => {
    if (tx.status === 'pending_validation') {
      // Simulate that transactions older than 10 seconds get verified
      if (Date.now() - tx.timestamp > 10000) {
        tx.status = 'verified';
        changed = true;
      }
    }
  });

  if (changed) {
    saveStore(store);
    recalculateScore();
  }
}
