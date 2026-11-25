// Real-Time Cross-Tab and P2P Multiplayer Synchronizer for Sports Auction

class MultiplayerManager {
  constructor() {
    this.roomCode = null;
    this.isHost = false;
    this.userTeamId = null;
    this.userName = '';
    this.channel = null;
    this.peer = null;
    this.connections = []; // For host: list of guest connections
    this.hostConnection = null; // For guest: connection to host
    this.listeners = new Set();
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
          if (event.data) {
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
    }

    // 3. Setup PeerJS for WebRTC remote friend connections (if window.Peer is available)
    this.initPeerJS();
  }

  initPeerJS() {
    if (typeof window === 'undefined' || !window.Peer) return;

    try {
      const peerIdPrefix = `sports-auction-${this.roomCode.toLowerCase()}`;
      
      if (this.isHost) {
        // Host uses a deterministic ID so guests can find it
        // Add random suffix to avoid collision if previous session hung, but try fixed ID first
        this.peer = new window.Peer(peerIdPrefix, {
          debug: 1
        });

        this.peer.on('open', (id) => {
          console.log('[Multiplayer] Host Peer opened with ID:', id);
        });

        this.peer.on('connection', (conn) => {
          console.log('[Multiplayer] Guest connected to host:', conn.peer);
          this.connections.push(conn);

          conn.on('data', (data) => {
            this.notifyListeners(data);
            // Host echoes message to all other guests
            this.broadcastToGuests(data, conn);
          });

          conn.on('close', () => {
            this.connections = this.connections.filter(c => c !== conn);
          });
        });

        this.peer.on('error', (err) => {
          console.warn('[Multiplayer] Host Peer error (likely ID in use):', err);
          // If ID is already taken, try random ID and rely on broadcast
        });
      } else {
        // Guest connects to Host
        this.peer = new window.Peer({
          debug: 1
        });

        this.peer.on('open', () => {
          console.log('[Multiplayer] Guest Peer opened, connecting to host:', peerIdPrefix);
          const conn = this.peer.connect(peerIdPrefix, { reliable: true });
          this.hostConnection = conn;

          conn.on('open', () => {
            console.log('[Multiplayer] Connected to host via WebRTC!');
            // Request room sync
            conn.send({
              type: 'REQUEST_ROOM_SYNC',
              sender: { name: this.userName, teamId: this.userTeamId }
            });
          });

          conn.on('data', (data) => {
            this.notifyListeners(data);
          });

          conn.on('error', (err) => {
            console.warn('[Multiplayer] Connection to host error:', err);
          });
        });

        this.peer.on('error', (err) => {
          console.warn('[Multiplayer] Guest Peer error:', err);
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
        this.notifyListeners(payload);
      } catch (err) {
        console.warn('Storage sync parse error:', err);
      }
    }
  };

  // Broadcast an action to all connected participants
  broadcast(action) {
    const payload = {
      ...action,
      roomCode: this.roomCode,
      senderTeamId: this.userTeamId,
      senderName: this.userName,
      timestamp: Date.now()
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
      } catch (e) {
        // ignore quota errors
      }
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
    } catch (e) {
      // ignore
    }
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
      try {
        this.channel.close();
      } catch (e) {}
      this.channel = null;
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
