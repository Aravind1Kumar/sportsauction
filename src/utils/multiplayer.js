// Global Cross-Device & Cross-Tab Real-Time Synchronizer for Sports Auction

class MultiplayerManager {
  constructor() {
    this.roomCode = null;
    this.isHost = false;
    this.userTeamId = null;
    this.userName = '';
    this.clientId = 'client_' + Math.random().toString(36).substr(2, 9);
    this.channel = null;
    this.ws = null;
    this.sse = null;
    this.reconnectTimer = null;
    this.listeners = new Set();
    this.lastProcessedMessageId = null;
  }

  // Initialize room sync
  init(roomCode, isHost = false, userTeamId = null, userName = '') {
    this.cleanup();
    this.roomCode = roomCode.toUpperCase().trim();
    this.isHost = isHost;
    this.userTeamId = userTeamId;
    this.userName = userName;

    // 1. Setup local BroadcastChannel (instant zero-latency for same-browser tabs)
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      try {
        this.channel = new BroadcastChannel(`sports_auction_${this.roomCode}`);
        this.channel.onmessage = (event) => {
          if (event.data && event.data.senderId !== this.clientId) {
            this.notifyListeners(event.data);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    // 2. Setup localStorage storage event listener (cross-window fallback)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageEvent);
    }

    // 3. Setup Global Cloud Relay (Phone <-> PC cross-device WebSocket & SSE)
    this.connectCloudRelay();
  }

  connectCloudRelay() {
    if (!this.roomCode || typeof window === 'undefined') return;

    const topic = `sports-auction-${this.roomCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const wsUrl = `wss://ntfy.sh/${topic}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[Multiplayer Relay] Connected for room:', this.roomCode);

        // When a guest joins, immediately request authoritative room state from host
        if (!this.isHost) {
          setTimeout(() => {
            this.broadcast({
              type: 'REQUEST_ROOM_SYNC',
              senderName: this.userName,
              senderTeamId: this.userTeamId
            });
          }, 300);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          if (raw.event === 'message' && raw.message) {
            if (raw.id && raw.id === this.lastProcessedMessageId) return;
            this.lastProcessedMessageId = raw.id;

            const data = JSON.parse(raw.message);
            if (data.senderId !== this.clientId) {
              this.notifyListeners(data);
            }
          }
        } catch (err) {
          // Ignore non-json messages (e.g. keepalives)
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[Multiplayer Relay] WS Notice, trying SSE fallback:', err);
        this.fallbackToSSE(topic);
      };

      this.ws.onclose = () => {
        // Auto-reconnect if closed unexpectedly
        if (this.roomCode) {
          this.reconnectTimer = setTimeout(() => {
            this.connectCloudRelay();
          }, 3000);
        }
      };
    } catch (e) {
      this.fallbackToSSE(topic);
    }
  }

  // Server-Sent Events fallback for mobile browsers where WebSocket might be closed in background
  fallbackToSSE(topic) {
    if (typeof window === 'undefined' || !window.EventSource || this.sse) return;

    try {
      this.sse = new EventSource(`https://ntfy.sh/${topic}/sse`);
      this.sse.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          if (raw.event === 'message' && raw.message) {
            if (raw.id && raw.id === this.lastProcessedMessageId) return;
            this.lastProcessedMessageId = raw.id;

            const data = JSON.parse(raw.message);
            if (data.senderId !== this.clientId) {
              this.notifyListeners(data);
            }
          }
        } catch (e) {}
      };
    } catch (e) {}
  }

  handleStorageEvent = (e) => {
    if (e.key === `sports_auction_sync_${this.roomCode}` && e.newValue) {
      try {
        const payload = JSON.parse(e.newValue);
        if (payload.senderId !== this.clientId) {
          this.notifyListeners(payload);
        }
      } catch (err) {}
    }
  };

  // Broadcast an action to all connected participants (Mobile + PC + Tabs)
  broadcast(action) {
    const payload = {
      ...action,
      roomCode: this.roomCode,
      senderId: this.clientId,
      senderTeamId: this.userTeamId,
      senderName: this.userName,
      timestamp: Date.now()
    };

    // 1. BroadcastChannel (local tabs on same browser)
    if (this.channel) {
      try { this.channel.postMessage(payload); } catch (e) {}
    }

    // 2. LocalStorage trigger
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`sports_auction_sync_${this.roomCode}`, JSON.stringify(payload));
      } catch (e) {}
    }

    // 3. Global Cloud Relay (Phone <-> PC cross-device over internet)
    const topic = `sports-auction-${this.roomCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    try {
      fetch(`https://ntfy.sh/${topic}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch (e) {
      console.warn('Relay publish error:', e);
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(data) {
    this.listeners.forEach(cb => {
      try {
        cb(data);
      } catch (e) {
        console.error('Multiplayer callback error:', e);
      }
    });
  }

  // Save room snapshot to localStorage so local guests can read initial info
  saveRoomSnapshot(roomData) {
    if (!this.roomCode || typeof window === 'undefined') return;
    try {
      localStorage.setItem(`sports_auction_room_${this.roomCode}`, JSON.stringify(roomData));
    } catch (e) {}
  }

  getRoomSnapshot(code) {
    if (!code || typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(`sports_auction_room_${code.toUpperCase().trim()}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  cleanup() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.channel) {
      try { this.channel.close(); } catch (e) {}
      this.channel = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageEvent);
    }
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
      this.ws = null;
    }
    if (this.sse) {
      try { this.sse.close(); } catch (e) {}
      this.sse = null;
    }
    this.listeners.clear();
  }
}

export const multiplayer = new MultiplayerManager();
