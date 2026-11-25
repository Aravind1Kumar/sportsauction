// Global Two-Way State Sync & Real-Time Cloud Relay for Sports Auction

class MultiplayerManager {
  constructor() {
    this.roomCode = null;
    this.isHost = false;
    this.userTeamId = null;
    this.userName = '';
    this.clientId = 'client_' + Math.random().toString(36).substr(2, 9);
    this.channel = null;
    this.ws = null;
    this.pollTimer = null;
    this.heartbeatTimer = null;
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

    // 1. Setup local BroadcastChannel (for same-computer tabs)
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

    // 3. Connect to Global Cloud Relay (Phone <-> PC cross-device)
    this.connectCloudRelay();
  }

  connectCloudRelay() {
    if (!this.roomCode || typeof window === 'undefined') return;

    const topic = `sports-auction-${this.roomCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const wsUrl = `wss://ntfy.sh/${topic}/ws`;

    // Connect WebSocket
    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[Multiplayer Relay] Connected for room:', this.roomCode);

        // Guest immediately signals presence to host upon connection
        if (!this.isHost) {
          this.broadcast({
            type: 'GUEST_HEARTBEAT',
            teamId: this.userTeamId,
            ownerName: this.userName
          });
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
        } catch (err) {}
      };

      this.ws.onclose = () => {
        if (this.roomCode) {
          this.reconnectTimer = setTimeout(() => this.connectCloudRelay(), 3000);
        }
      };

      this.ws.onerror = () => {};
    } catch (e) {}

    // 4. Background HTTP Polling (every 1.5s) to guarantee zero message loss on mobile browsers
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = setInterval(async () => {
      if (!this.roomCode) return;
      try {
        const res = await fetch(`https://ntfy.sh/${topic}/json?poll=1`);
        if (res.ok) {
          const text = await res.text();
          const lines = text.trim().split('\n').filter(Boolean);
          for (const line of lines) {
            try {
              const raw = JSON.parse(line);
              if (raw.event === 'message' && raw.message) {
                if (raw.id && raw.id === this.lastProcessedMessageId) continue;
                this.lastProcessedMessageId = raw.id;

                const data = JSON.parse(raw.message);
                if (data.senderId !== this.clientId) {
                  this.notifyListeners(data);
                }
              }
            } catch (e) {}
          }
        }
      } catch (e) {}
    }, 1500);
  }

  // Start two-way continuous heartbeat to ensure mobile & PC always see each other
  startHeartbeat(getStateCallback) {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);

    this.heartbeatTimer = setInterval(() => {
      if (!this.roomCode) return;
      try {
        const state = getStateCallback ? getStateCallback() : null;
        if (this.isHost && state) {
          this.broadcast({
            type: 'HOST_HEARTBEAT',
            room: state.room,
            screen: state.screen,
            roundState: state.roundState,
            currentPrice: state.currentPrice,
            highestBidder: state.highestBidder
          });
        } else if (!this.isHost) {
          this.broadcast({
            type: 'GUEST_HEARTBEAT',
            teamId: this.userTeamId,
            ownerName: this.userName
          });
        }
      } catch (e) {}
    }, 2000);
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

    // 1. BroadcastChannel (local tabs on same computer)
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
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
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
    this.listeners.clear();
  }
}

export const multiplayer = new MultiplayerManager();
