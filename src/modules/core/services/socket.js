import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    socket = null;

    connect() {
        if (!this.socket) {
            this.socket = io(SOCKET_URL, {
                withCredentials: true,
                transports: ['websocket', 'polling']
            });

            this.socket.on('connect', () => {
                console.log('🟢 Socket connected to backend');
            });

            this.socket.on('disconnect', () => {
                console.log('🔌 Socket disconnected');
            });

            this.socket.on('connect_error', (error) => {
                console.error('❌ Socket connection error:', error);
            });
        }
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event) {
        if (this.socket) {
            this.socket.off(event);
        }
    }

    emit(event, data) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }
}

const socketService = new SocketService();
export default socketService;
