import { getStore, saveStore } from '../core/store.js';

document.addEventListener('DOMContentLoaded', () => {
  const store = getStore();
  
  // If already onboarded, redirect to dashboard
  if (store.merchant.id) {
    window.location.href = './src/pages/merchant-dashboard.html';
  }

  const form = document.getElementById('loginForm');
  if(form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const phone = document.getElementById('phone').value;
      const bizName = document.getElementById('bizName').value;
      
      if(phone && bizName) {
        store.merchant = {
          id: `mer_${Date.now()}_${Math.floor(Math.random()*1000)}`,
          name: bizName,
          phone: phone,
          score: 300, // starting score
          onboardedAt: Date.now()
        };
        
        saveStore(store);
        
        // Redirect to dashboard
        window.location.href = './src/pages/merchant-dashboard.html';
      }
    });
  }
});
