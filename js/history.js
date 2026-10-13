// RoyalQR Local History & Saved Items Manager
const HistoryManager = {
  STORAGE_KEY: "royalqr_history_v1",

  getItems() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn("Error reading history from localStorage:", e);
      return [];
    }
  },

  addItem(item) {
    try {
      const items = this.getItems();
      // Remove duplicate if same data already exists in top 3
      const filtered = items.filter(i => i.id !== item.id && !(i.data === item.data && i.type === item.type));
      filtered.unshift({
        id: item.id || 'qr_' + Date.now(),
        type: item.type || 'url',
        data: item.data || '',
        previewTitle: item.previewTitle || (item.data ? item.data.slice(0, 32) : 'QR Code'),
        timestamp: Date.now(),
        config: item.config,
        thumbUrl: item.thumbUrl || null
      });
      // Cap at 25 items
      if (filtered.length > 25) filtered.length = 25;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      this.renderDrawer();
    } catch (e) {
      console.warn("Error saving history to localStorage:", e);
    }
  },

  deleteItem(id) {
    try {
      const items = this.getItems().filter(i => i.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
      this.renderDrawer();
    } catch (e) {
      console.warn("Error deleting item:", e);
    }
  },

  clearAll() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.renderDrawer();
    } catch (e) {
      console.warn("Error clearing history:", e);
    }
  },

  renderDrawer() {
    const listEl = document.getElementById("history-list");
    const countEl = document.getElementById("history-count");
    if (!listEl) return;

    const items = this.getItems();
    if (countEl) countEl.textContent = items.length;

    if (items.length === 0) {
      listEl.innerHTML = `
        <div class="empty-history-state">
          <div class="empty-icon">📂</div>
          <p class="font-medium text-slate-300">No saved QR codes yet</p>
          <p class="text-xs text-slate-400 mt-1">Codes you generate and download will automatically be saved here.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = items.map(item => {
      const timeStr = new Date(item.timestamp).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      const typeBadge = (item.type || 'URL').toUpperCase();
      const escapedData = (item.data || '').replace(/"/g, '&quot;');
      const escapedTitle = (item.previewTitle || item.data || 'QR Code').replace(/"/g, '&quot;');

      return `
        <div class="history-item-card" data-id="${item.id}">
          <div class="history-thumb-box">
            ${item.thumbUrl ? `<img src="${item.thumbUrl}" alt="QR" class="history-thumb-img"/>` : `<div class="history-thumb-placeholder">QR</div>`}
          </div>
          <div class="history-item-info">
            <div class="flex items-center gap-2">
              <span class="history-badge">${typeBadge}</span>
              <span class="text-[11px] text-slate-400">${timeStr}</span>
            </div>
            <p class="history-item-title" title="${escapedData}">${escapedTitle}</p>
          </div>
          <div class="history-actions">
            <button type="button" class="history-btn-restore" onclick="RoyalApp.restoreHistoryItem('${item.id}')" title="Restore this QR Code">
              ↺ Load
            </button>
            <button type="button" class="history-btn-del" onclick="HistoryManager.deleteItem('${item.id}')" title="Delete">
              ✕
            </button>
          </div>
        </div>
      `;
    }).join("");
  }
};
