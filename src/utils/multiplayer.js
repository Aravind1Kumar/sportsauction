// Real-Time Cross-Tab, Local-Storage and P2P Multiplayer Synchronizer for Sports Auction

class MultiplayerManager {
  constructor() {
    this.roomCode = null;
    this.isHost = false;
    this.userTeamId = null;
    this.userName = '';
    this.channel = null;
    this.peer = null;
    this.connections = [];
    this.hostConnection = null;
    this.listeners = new Set();
    this.pollInterval = null;
    this.lastProcessedSyncTime = 0;
  }

  // Initialize room sync
  init(roomCode, isHost = false, userTeamId = null, userName = '') {
    this.cleanup();
    this.roomCode = roomCode.toUpperCase().trim();
    this.isHost = isHost;
    this.userTeamId = userTeamId;
    this.userName = userName;

    // 1. Setup BroadcastChannel (instant zero-latency cross-tab communication)
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      try {
        this.channel = new BroadcastChannel(`sports_auction_${this.roomCode}`);
        this.channel.onmessage = (event) => {
          if (event.data && event.data.timestamp !== this.lastProcessedSyncTime) {
            this.notifyListeners(event.data);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    // 2. Setup localStorage storage event listener
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageEvent);

      // 3. Fallback Heartbeat Poller (checks localStorage every 1.2s for room state updates)
      this.pollInterval = setInterval(() => {
        try {
          const raw = localStorage.getItem(`sports_auction_room_${this.roomCode}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.claimedTeams) {
              this.notifyListeners({
                type: 'HEARTBEAT_SYNC',
                room: parsed
              });
            }
          }
        } catch (e) {}
      }, 1200);
    }

    // 4. Setup PeerJS for WebRTC remote friend connections
    this.initPeerJS();
  }

  initPeerJS() {
    if (typeof window === 'undefined' || !window.Peer) return;

    try {
      const sanitizedRoom = this.roomCode.toLowerCase().replace(/[^a-z0-9]/g, '');
      const peerId = this.isHost
        ? `sa-${sanitizedRoom}-host`
        : `sa-${sanitizedRoom}-${Math.random().toString(36).substr(2, 6)}`;

      this.peer = new window.Peer(peerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      if (this.isHost) {
        this.peer.on('connection', (conn) => {
          this.connections.push(conn);

          conn.on('data', (data) => {
            this.notifyListeners(data);
            this.broadcastToGuests(data, conn);
          });

          conn.on('close', () => {
            this.connections = this.connections.filter(c => c !== conn);
          });
        });

        this.peer.on('error', (err) => {
          console.warn('[Multiplayer] Host Peer notice:', err?.type);
        });
      } else {
        this.peer.on('open', () => {
          const targetHostId = `sa-${sanitizedRoom}-host`;
          const conn = this.peer.connect(targetHostId, { reliable: true });
          this.hostConnection = conn;

          conn.on('open', () => {
            conn.send({
              type: 'REQUEST_ROOM_SYNC',
              sender: { name: this.userName, teamId: this.userTeamId }
            });
          });

          conn.on('data', (data) => {
            this.notifyListeners(data);
          });

          conn.on('error', (err) => {
            console.warn('[Multiplayer] Connection to host notice:', err?.type);
          });
        });

        this.peer.on('error', (err) => {
          console.warn('[Multiplayer] Guest Peer notice:', err?.type);
        });
      }
    } catch (e) {
      console.warn('[Multiplayer] PeerJS initialization skipped:', e);
    }
  }

  broadcastToGuests(data, excludeConn = null) {
    this.connections.forEach(conn => {
      if (conn !== excludeConn && conn.open) {
        try {
          conn.send(data);
        } catch (e) {
          console.warn('Error sending to guest:', e);
        }
      }
    });
  }

  handleStorageEvent = (e) => {
    if (e.key === `sports_auction_sync_${this.roomCode}` && e.newValue) {
      try {
        const payload = JSON.parse(e.newValue);
        if (payload.timestamp !== this.lastProcessedSyncTime) {
          this.notifyListeners(payload);
        }
      } catch (err) {
        console.warn('Storage sync parse error:', err);
      }
    }
  };

  // Broadcast an action to all connected participants
  broadcast(action) {
    const timestamp = Date.now();
    this.lastProcessedSyncTime = timestamp;

    const payload = {
      ...action,
      roomCode: this.roomCode,
      senderTeamId: this.userTeamId,
      senderName: this.userName,
      timestamp
    };

    // 1. BroadcastChannel (local tabs)
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (e) {
        console.warn('BroadcastChannel send error:', e);
      }
    }

    // 2. LocalStorage trigger
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`sports_auction_sync_${this.roomCode}`, JSON.stringify(payload));
      } catch (e) {}
    }

    // 3. WebRTC P2P
    if (this.isHost) {
      this.broadcastToGuests(payload);
    } else if (this.hostConnection && this.hostConnection.open) {
      try {
        this.hostConnection.send(payload);
      } catch (e) {
        console.warn('WebRTC send to host error:', e);
      }
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

  // Save room snapshot to localStorage so guests in same browser/LAN can read initial info
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
    if (this.channel) {
      try { this.channel.close(); } catch (e) {}
      this.channel = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageEvent);
    }
    if (this.connections.length > 0) {
      this.connections.forEach(c => {
        try { c.close(); } catch (e) {}
      });
      this.connections = [];
    }
    if (this.hostConnection) {
      try { this.hostConnection.close(); } catch (e) {}
      this.hostConnection = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch (e) {}
      this.peer = null;
    }
    this.listeners.clear();
  }
}

export const multiplayer = new MultiplayerManager();
