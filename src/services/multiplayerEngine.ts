import Peer, { DataConnection } from 'peerjs';

export interface NetworkPlayer {
  id: string;
  name: string;
  color: string;
  skinId: string;
  progress: number;
  wpm: number;
  accuracy: number;
  isReady: boolean;
  isHost: boolean;
  finished: boolean;
  placement?: number;
}

export interface NetworkRoomState {
  id: string;
  hostId: string;
  status: 'LOBBY' | 'COUNTDOWN' | 'RACING' | 'FINISHED';
  language: string;
  snippetTitle: string;
  codeSnippet: string;
  mode: string;
  countdownSeconds: number;
  players: NetworkPlayer[];
}

type RoomUpdateCallback = (state: NetworkRoomState | null) => void;
type ChatCallback = (msg: { sender: string; text: string; time: string }) => void;

export function generateRoomCode(): string {
  return 'VEL-' + Math.floor(1000 + Math.random() * 9000);
}

class MultiplayerEngine {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private hostConnection: DataConnection | null = null;
  private isHost: boolean = false;
  private myId: string = '';
  private myPlayer: NetworkPlayer | null = null;
  private roomState: NetworkRoomState | null = null;
  private onStateChange: RoomUpdateCallback | null = null;
  private onChat: ChatCallback | null = null;
  private countdownTimer: any = null;

  public init(
    myPlayer: NetworkPlayer,
    onState: RoomUpdateCallback,
    onChat?: ChatCallback,
    desiredPeerId?: string
  ): Promise<string> {
    this.myPlayer = myPlayer;
    this.onStateChange = onState;
    if (onChat) this.onChat = onChat;

    // If an existing open peer matches desiredPeerId or desiredPeerId is not requested, reuse it
    if (this.peer && !this.peer.destroyed && this.peer.open) {
      if (!desiredPeerId || this.peer.id.toUpperCase() === desiredPeerId.toUpperCase()) {
        this.myId = this.peer.id;
        return Promise.resolve(this.peer.id);
      }
      this.peer.destroy();
      this.peer = null;
    }

    return new Promise((resolve) => {
      const peerId = (
        desiredPeerId ||
        `GST-${Math.floor(10000 + Math.random() * 90000)}`
      ).toUpperCase();

      this.peer = new Peer(peerId, {
        debug: 1,
      });

      this.peer.on('open', (id) => {
        this.myId = id.toUpperCase();
        resolve(this.myId);
      });

      this.peer.on('connection', (conn) => {
        this.handleIncomingConnection(conn);
      });

      this.peer.on('error', (err: any) => {
        console.warn('[P2P Network Warning]', err?.message || err);
        // Fallback if desired peerId is taken
        if (err?.type === 'unavailable-id' && desiredPeerId) {
          const fallback = `VEL-${Math.floor(1000 + Math.random() * 9000)}`;
          this.init(myPlayer, onState, onChat, fallback).then(resolve);
        }
      });
    });
  }

  // Host creates a room
  public createRoom(
    roomCode: string,
    snippet: { language: string; title: string; code: string; mode?: string }
  ): string {
    this.isHost = true;
    const cleanCode = roomCode.toUpperCase().trim();

    if (!this.myPlayer) return cleanCode;

    this.roomState = {
      id: cleanCode,
      hostId: this.myId,
      status: 'LOBBY',
      language: snippet.language,
      snippetTitle: snippet.title,
      codeSnippet: snippet.code,
      mode: snippet.mode || 'sprint',
      countdownSeconds: 3,
      players: [
        {
          ...this.myPlayer,
          id: this.myId,
          isHost: true,
          isReady: true,
          progress: 0,
          wpm: 0,
          accuracy: 100,
          finished: false,
        },
      ],
    };

    if (this.onStateChange) this.onStateChange(this.roomState);
    return cleanCode;
  }

  // Guest joins a room using host's peer ID or room code
  public joinRoom(targetPeerOrCode: string, myPlayer: NetworkPlayer) {
    this.isHost = false;
    this.myPlayer = myPlayer;

    if (!this.peer) return;

    const target = targetPeerOrCode.toUpperCase().trim();
    const conn = this.peer.connect(target, { reliable: true });
    this.hostConnection = conn;

    const sendJoin = () => {
      conn.send({
        type: 'PLAYER_JOIN',
        player: {
          ...myPlayer,
          id: this.myId,
          isHost: false,
          isReady: false,
          progress: 0,
          wpm: 0,
          accuracy: 100,
          finished: false,
        },
      });
    };

    if (conn.open) {
      sendJoin();
    } else {
      conn.on('open', sendJoin);
    }

    conn.on('data', (data: any) => {
      this.handleClientMessage(data);
    });

    conn.on('close', () => {
      console.log('[P2P] Disconnected from host lobby');
    });

    conn.on('error', (err) => {
      console.warn('[P2P Connection Error]', err);
    });
  }

  private handleIncomingConnection(conn: DataConnection) {
    this.connections.set(conn.peer.toUpperCase(), conn);

    conn.on('data', (data: any) => {
      if (this.isHost) {
        this.handleHostMessage(conn.peer.toUpperCase(), data);
      } else {
        this.handleClientMessage(data);
      }
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer.toUpperCase());
      if (this.isHost && this.roomState) {
        this.roomState.players = this.roomState.players.filter(
          (p) => p.id !== conn.peer.toUpperCase()
        );
        this.broadcastState();
      }
    });
  }

  // Host processes actions from guests
  private handleHostMessage(senderPeerId: string, data: any) {
    if (!this.roomState) return;

    switch (data.type) {
      case 'PLAYER_JOIN': {
        const existing = this.roomState.players.find((p) => p.id === senderPeerId);
        if (!existing) {
          this.roomState.players.push({
            ...data.player,
            id: senderPeerId,
          });
        }
        this.broadcastState();
        break;
      }

      case 'TOGGLE_READY': {
        const player = this.roomState.players.find((p) => p.id === senderPeerId);
        if (player) {
          player.isReady = !player.isReady;
          this.broadcastState();
        }
        break;
      }

      case 'TELEMETRY_UPDATE': {
        const player = this.roomState.players.find((p) => p.id === senderPeerId);
        if (player) {
          player.progress = data.progress;
          player.wpm = data.wpm;
          player.accuracy = data.accuracy;

          if (data.progress >= 100 && !player.finished) {
            player.finished = true;
            const finishOrder = this.roomState.players.filter((p) => p.finished).length;
            player.placement = finishOrder;
          }
          this.broadcastState();
        }
        break;
      }

      case 'CHAT': {
        this.broadcast({ type: 'CHAT', message: data.message });
        if (this.onChat) this.onChat(data.message);
        break;
      }
    }
  }

  // Client receives room state from host
  private handleClientMessage(data: any) {
    if (data.type === 'SYNC_STATE') {
      this.roomState = data.state;
      if (this.onStateChange && this.roomState) {
        this.onStateChange(this.roomState);
      }
    } else if (data.type === 'CHAT') {
      if (this.onChat) this.onChat(data.message);
    }
  }

  // Broadcast state to all connected peers
  private broadcastState() {
    if (!this.roomState) return;
    this.broadcast({ type: 'SYNC_STATE', state: this.roomState });
    if (this.onStateChange) this.onStateChange(this.roomState);
  }

  private broadcast(payload: any) {
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(payload);
      }
    });
  }

  // Host starts the countdown
  public startCountdown() {
    if (!this.isHost || !this.roomState) return;
    this.roomState.status = 'COUNTDOWN';
    this.roomState.countdownSeconds = 3;
    this.broadcastState();

    if (this.countdownTimer) clearInterval(this.countdownTimer);

    this.countdownTimer = setInterval(() => {
      if (!this.roomState) return;
      this.roomState.countdownSeconds -= 1;

      if (this.roomState.countdownSeconds <= 0) {
        clearInterval(this.countdownTimer);
        this.roomState.status = 'RACING';
        this.broadcastState();
      } else {
        this.broadcastState();
      }
    }, 1000);
  }

  // Update typing telemetry (Host & Client)
  public sendTelemetry(progress: number, wpm: number, accuracy: number) {
    if (!this.roomState) return;

    if (this.isHost) {
      const hostPlayer = this.roomState.players.find((p) => p.id === this.myId);
      if (hostPlayer) {
        hostPlayer.progress = progress;
        hostPlayer.wpm = wpm;
        hostPlayer.accuracy = accuracy;
        if (progress >= 100 && !hostPlayer.finished) {
          hostPlayer.finished = true;
          const finishOrder = this.roomState.players.filter((p) => p.finished).length;
          hostPlayer.placement = finishOrder;
        }
        this.broadcastState();
      }
    } else if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send({
        type: 'TELEMETRY_UPDATE',
        progress,
        wpm,
        accuracy,
      });
    }
  }

  // Toggle ready status
  public toggleReady() {
    if (!this.roomState) return;

    if (this.isHost) {
      const hostPlayer = this.roomState.players.find((p) => p.id === this.myId);
      if (hostPlayer) {
        hostPlayer.isReady = !hostPlayer.isReady;
        this.broadcastState();
      }
    } else if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send({ type: 'TOGGLE_READY' });
    }
  }

  public getMyId(): string {
    return this.myId;
  }

  public isRoomHost(): boolean {
    return this.isHost;
  }

  public leaveRoom() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    if (this.hostConnection) {
      this.hostConnection.close();
      this.hostConnection = null;
    }
    this.connections.forEach((c) => c.close());
    this.connections.clear();
    this.roomState = null;
    this.isHost = false;
    if (this.onStateChange) this.onStateChange(null);
  }
}

export const p2pEngine = new MultiplayerEngine();