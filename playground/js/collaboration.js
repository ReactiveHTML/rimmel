/**
 * Collaboration Module
 * 
 * Enables real-time collaborative editing and communication including:
 * - Multi-user session management
 * - Real-time stream synchronization  
 * - Voice and text chat integration
 * - Shared workspace state
 * - Participant awareness and presence
 */

class Collaboration {
    constructor(options) {
        this.container = options.container;
        this.onParticipantUpdate = options.onParticipantUpdate || (() => {});
        
        this.sessionId = null;
        this.userId = this.generateUserId();
        this.participants = new Map();
        this.isConnected = false;
        this.websocket = null;
        this.voiceChat = null;
        
        this.init();
    }

    init() {
        this.setupUI();
        this.setupChatSystem();
        this.setupVoiceChat();
        this.setupCollaborativeEditing();
        this.generateSessionId();
        
        console.log('👥 Collaboration module initialized');
    }

    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    }

    generateSessionId() {
        this.sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
        this.updateSessionDisplay();
    }

    setupUI() {
        // Session controls
        const sessionHeader = this.container.querySelector('.collaboration-header');
        if (sessionHeader) {
            const joinBtn = document.createElement('button');
            joinBtn.className = 'action-btn';
            joinBtn.innerHTML = '<span class="icon">🔗</span> Join Session';
            joinBtn.addEventListener('click', () => this.showJoinDialog());
            
            const createBtn = document.createElement('button');
            createBtn.className = 'action-btn';
            createBtn.innerHTML = '<span class="icon">➕</span> New Session';
            createBtn.addEventListener('click', () => this.createNewSession());
            
            sessionHeader.appendChild(joinBtn);
            sessionHeader.appendChild(createBtn);
        }
        
        // Participant list interaction
        this.setupParticipantInteractions();
    }

    setupParticipantInteractions() {
        const participantList = document.querySelector('.participant-list');
        if (participantList) {
            participantList.addEventListener('click', (e) => {
                if (e.target.closest('.participant')) {
                    const participant = e.target.closest('.participant');
                    this.showParticipantMenu(participant);
                }
            });
        }
    }

    setupChatSystem() {
        const chatInput = document.getElementById('chat-input');
        const voiceToggle = document.getElementById('voice-toggle');
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendChatMessage();
                }
            });
        }
        
        if (voiceToggle) {
            voiceToggle.addEventListener('click', () => {
                this.toggleVoiceChat();
            });
        }
        
        // Setup typing indicators
        this.setupTypingIndicators();
    }

    setupTypingIndicators() {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput) return;
        
        let typingTimer;
        
        chatInput.addEventListener('input', () => {
            this.broadcastTyping(true);
            
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => {
                this.broadcastTyping(false);
            }, 1000);
        });
    }

    setupVoiceChat() {
        this.voiceChat = new VoiceChatManager({
            onParticipantVoiceChange: (participantId, isActive) => {
                this.updateParticipantVoiceStatus(participantId, isActive);
            }
        });
    }

    setupCollaborativeEditing() {
        // Setup operational transformation for real-time editing
        this.operationalTransform = new OperationalTransform({
            onRemoteOperation: (operation) => {
                this.applyRemoteOperation(operation);
            }
        });
        
        // Monitor editor changes
        this.setupEditorMonitoring();
        
        // Setup cursor sharing
        this.setupCursorSharing();
    }

    setupEditorMonitoring() {
        const editors = [
            document.getElementById('js-editor'),
            document.getElementById('html-editor'),
            document.getElementById('css-editor')
        ];
        
        editors.forEach((editor, index) => {
            if (editor) {
                editor.addEventListener('input', (e) => {
                    this.handleEditorChange(index, e);
                });
                
                editor.addEventListener('selectionchange', (e) => {
                    this.handleSelectionChange(index, e);
                });
            }
        });
    }

    setupCursorSharing() {
        this.cursors = new Map();
        this.cursorColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
    }

    // Session management
    async createNewSession() {
        try {
            this.sessionId = this.generateSessionId();
            await this.connectToSession();
            this.showSessionCreatedNotification();
        } catch (error) {
            console.error('Failed to create session:', error);
            this.showErrorNotification('Failed to create collaborative session');
        }
    }

    showJoinDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'modal';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Join Collaborative Session</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="session-id-input">Session ID:</label>
                        <input type="text" id="session-id-input" placeholder="Enter session ID..." class="form-input">
                    </div>
                    <div class="form-group">
                        <label for="user-name-input">Your Name:</label>
                        <input type="text" id="user-name-input" placeholder="Enter your name..." class="form-input">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="playground.collaboration.joinSession()">Join</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        document.getElementById('session-id-input').focus();
    }

    async joinSession() {
        const sessionIdInput = document.getElementById('session-id-input');
        const userNameInput = document.getElementById('user-name-input');
        const modal = sessionIdInput.closest('.modal');
        
        const sessionId = sessionIdInput.value.trim();
        const userName = userNameInput.value.trim();
        
        if (!sessionId) {
            this.showErrorNotification('Please enter a session ID');
            return;
        }
        
        try {
            this.sessionId = sessionId;
            this.userName = userName || 'Anonymous';
            await this.connectToSession();
            modal.remove();
            this.showJoinedNotification(sessionId);
        } catch (error) {
            console.error('Failed to join session:', error);
            this.showErrorNotification('Failed to join session. Please check the session ID.');
        }
    }

    async connectToSession() {
        if (this.websocket) {
            this.websocket.close();
        }
        
        // In a real implementation, this would connect to a WebSocket server
        this.websocket = new MockWebSocket(this.sessionId);
        
        this.websocket.onopen = () => {
            this.isConnected = true;
            this.joinSessionAsParticipant();
            console.log(`🔗 Connected to session: ${this.sessionId}`);
        };
        
        this.websocket.onmessage = (event) => {
            this.handleWebSocketMessage(event.data);
        };
        
        this.websocket.onclose = () => {
            this.isConnected = false;
            this.showDisconnectedNotification();
        };
        
        this.websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.showErrorNotification('Connection error occurred');
        };
    }

    joinSessionAsParticipant() {
        const participant = {
            id: this.userId,
            name: this.userName || 'You',
            color: this.getRandomColor(),
            isTyping: false,
            isVoiceActive: false,
            cursor: null,
            lastSeen: Date.now()
        };
        
        this.addParticipant(participant);
        
        // Broadcast join message
        this.broadcast({
            type: 'participant-joined',
            participant: participant
        });
    }

    // Participant management
    addParticipant(participant) {
        this.participants.set(participant.id, participant);
        this.updateParticipantDisplay();
        this.onParticipantUpdate(Array.from(this.participants.values()));
    }

    removeParticipant(participantId) {
        this.participants.delete(participantId);
        this.removeCursor(participantId);
        this.updateParticipantDisplay();
        this.onParticipantUpdate(Array.from(this.participants.values()));
    }

    updateParticipantDisplay() {
        const participantList = document.querySelector('.participant-list');
        if (!participantList) return;
        
        const participants = Array.from(this.participants.values());
        
        participantList.innerHTML = participants.map(participant => `
            <div class="participant" data-participant-id="${participant.id}">
                <div class="avatar" style="background-color: ${participant.color};">
                    ${participant.name.charAt(0).toUpperCase()}
                </div>
                <span class="name">${participant.name}${participant.id === this.userId ? ' (You)' : ''}</span>
                <span class="status ${this.getParticipantStatus(participant)}">
                    ${this.getStatusIcon(participant)}
                </span>
                ${participant.isTyping ? '<span class="typing-indicator">typing...</span>' : ''}
            </div>
        `).join('');
        
        // Update participant count
        const countElement = document.querySelector('.participant-count');
        if (countElement) {
            countElement.textContent = `👥 ${participants.length} participant${participants.length !== 1 ? 's' : ''}`;
        }
    }

    getParticipantStatus(participant) {
        const now = Date.now();
        const timeSinceLastSeen = now - participant.lastSeen;
        
        if (timeSinceLastSeen < 30000) return 'online'; // 30 seconds
        if (timeSinceLastSeen < 300000) return 'away'; // 5 minutes
        return 'offline';
    }

    getStatusIcon(participant) {
        if (participant.isVoiceActive) return '🎤';
        
        const status = this.getParticipantStatus(participant);
        const icons = {
            online: '🟢',
            away: '🟡',
            offline: '🔴'
        };
        
        return icons[status] || '🔴';
    }

    getRandomColor() {
        return this.cursorColors[Math.floor(Math.random() * this.cursorColors.length)];
    }

    // Chat functionality
    sendChatMessage() {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput) return;
        
        const message = chatInput.value.trim();
        if (!message) return;
        
        const chatMessage = {
            type: 'chat-message',
            id: this.generateMessageId(),
            senderId: this.userId,
            senderName: this.userName || 'You',
            text: message,
            timestamp: Date.now()
        };
        
        this.addChatMessage(chatMessage);
        this.broadcast(chatMessage);
        
        chatInput.value = '';
    }

    addChatMessage(message) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `
            <span class="sender">${message.senderName}:</span>
            <span class="text">${this.escapeHtml(message.text)}</span>
            <span class="time">${new Date(message.timestamp).toLocaleTimeString()}</span>
        `;
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Limit message history
        const messages = messagesContainer.querySelectorAll('.message');
        if (messages.length > 100) {
            messages[0].remove();
        }
    }

    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Voice chat functionality
    async toggleVoiceChat() {
        const voiceToggle = document.getElementById('voice-toggle');
        if (!voiceToggle) return;
        
        try {
            if (this.voiceChat.isActive()) {
                await this.voiceChat.stop();
                voiceToggle.textContent = '🎤';
                voiceToggle.classList.remove('active');
            } else {
                await this.voiceChat.start();
                voiceToggle.textContent = '🔇';
                voiceToggle.classList.add('active');
            }
            
            this.broadcast({
                type: 'voice-status-changed',
                participantId: this.userId,
                isActive: this.voiceChat.isActive()
            });
        } catch (error) {
            console.error('Voice chat error:', error);
            this.showErrorNotification('Failed to toggle voice chat');
        }
    }

    updateParticipantVoiceStatus(participantId, isActive) {
        const participant = this.participants.get(participantId);
        if (participant) {
            participant.isVoiceActive = isActive;
            this.updateParticipantDisplay();
        }
    }

    // Collaborative editing
    handleEditorChange(editorIndex, event) {
        if (!this.isConnected) return;
        
        const operation = {
            type: 'editor-change',
            editorIndex,
            change: {
                range: this.getSelectionRange(event.target),
                text: event.target.value,
                timestamp: Date.now()
            },
            authorId: this.userId
        };
        
        this.broadcast(operation);
    }

    handleSelectionChange(editorIndex, event) {
        if (!this.isConnected) return;
        
        const selection = this.getSelectionRange(event.target);
        
        this.broadcast({
            type: 'cursor-moved',
            editorIndex,
            participantId: this.userId,
            selection,
            timestamp: Date.now()
        });
        
        this.updateOwnCursor(editorIndex, selection);
    }

    getSelectionRange(editor) {
        return {
            start: editor.selectionStart,
            end: editor.selectionEnd
        };
    }

    applyRemoteOperation(operation) {
        if (operation.authorId === this.userId) return;
        
        switch (operation.type) {
            case 'editor-change':
                this.applyRemoteEditorChange(operation);
                break;
            case 'cursor-moved':
                this.updateRemoteCursor(operation);
                break;
        }
    }

    applyRemoteEditorChange(operation) {
        const editors = [
            document.getElementById('js-editor'),
            document.getElementById('html-editor'),
            document.getElementById('css-editor')
        ];
        
        const editor = editors[operation.editorIndex];
        if (editor) {
            // Apply operational transformation
            const transformedChange = this.operationalTransform.transform(operation.change);
            
            // Temporarily disable event listeners to prevent infinite loops
            const originalValue = editor.value;
            editor.value = transformedChange.text;
            
            // Restore cursor position if needed
            this.restoreLocalCursor(editor);
        }
    }

    updateRemoteCursor(operation) {
        const cursorId = `${operation.participantId}_${operation.editorIndex}`;
        const participant = this.participants.get(operation.participantId);
        
        if (participant) {
            this.showRemoteCursor(cursorId, operation.selection, participant.color);
        }
    }

    showRemoteCursor(cursorId, selection, color) {
        // Implementation would show cursor overlays on editors
        console.log(`👆 Remote cursor ${cursorId} at position ${selection.start}-${selection.end}`);
    }

    removeCursor(participantId) {
        // Remove all cursors for this participant
        const cursors = document.querySelectorAll(`[data-cursor-id^="${participantId}_"]`);
        cursors.forEach(cursor => cursor.remove());
    }

    // Broadcasting and message handling
    broadcast(message) {
        if (this.websocket && this.isConnected) {
            this.websocket.send(JSON.stringify(message));
        }
    }

    handleWebSocketMessage(data) {
        try {
            const message = JSON.parse(data);
            this.handleCollaborationMessage(message);
        } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
        }
    }

    handleCollaborationMessage(message) {
        switch (message.type) {
            case 'participant-joined':
                this.addParticipant(message.participant);
                this.addChatMessage({
                    type: 'system-message',
                    text: `${message.participant.name} joined the session`,
                    timestamp: Date.now()
                });
                break;
                
            case 'participant-left':
                this.removeParticipant(message.participantId);
                this.addChatMessage({
                    type: 'system-message',
                    text: `${message.participantName} left the session`,
                    timestamp: Date.now()
                });
                break;
                
            case 'chat-message':
                if (message.senderId !== this.userId) {
                    this.addChatMessage(message);
                }
                break;
                
            case 'typing-status':
                this.updateTypingStatus(message.participantId, message.isTyping);
                break;
                
            case 'voice-status-changed':
                this.updateParticipantVoiceStatus(message.participantId, message.isActive);
                break;
                
            case 'editor-change':
            case 'cursor-moved':
                this.applyRemoteOperation(message);
                break;
                
            default:
                console.log('Unknown collaboration message:', message);
        }
    }

    broadcastTyping(isTyping) {
        this.broadcast({
            type: 'typing-status',
            participantId: this.userId,
            isTyping: isTyping
        });
    }

    updateTypingStatus(participantId, isTyping) {
        const participant = this.participants.get(participantId);
        if (participant) {
            participant.isTyping = isTyping;
            this.updateParticipantDisplay();
        }
    }

    // UI helper methods
    updateSessionDisplay() {
        const sessionIdElement = document.querySelector('.session-id');
        if (sessionIdElement) {
            sessionIdElement.textContent = `Session: ${this.sessionId}`;
        }
    }

    showSessionCreatedNotification() {
        this.showNotification(`Session created: ${this.sessionId}`, 'success');
    }

    showJoinedNotification(sessionId) {
        this.showNotification(`Joined session: ${sessionId}`, 'success');
    }

    showDisconnectedNotification() {
        this.showNotification('Disconnected from collaborative session', 'warning');
    }

    showErrorNotification(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Use the main playground notification system
        if (window.playground) {
            window.playground.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // Public API
    handleConnectionChange(online) {
        if (!online && this.websocket) {
            this.websocket.close();
            this.isConnected = false;
        } else if (online && this.sessionId && !this.isConnected) {
            this.connectToSession();
        }
    }

    exportState() {
        return {
            sessionId: this.sessionId,
            userId: this.userId,
            participants: Array.from(this.participants.entries()),
            isConnected: this.isConnected
        };
    }

    destroy() {
        if (this.websocket) {
            this.websocket.close();
        }
        
        if (this.voiceChat) {
            this.voiceChat.destroy();
        }
        
        console.log('👥 Collaboration module destroyed');
    }
}

// Mock WebSocket for demonstration
class MockWebSocket {
    constructor(sessionId) {
        this.sessionId = sessionId;
        this.readyState = WebSocket.CONNECTING;
        
        // Simulate connection
        setTimeout(() => {
            this.readyState = WebSocket.OPEN;
            if (this.onopen) this.onopen();
        }, 1000);
    }
    
    send(data) {
        // In a real implementation, this would send to a server
        console.log('📡 Broadcasting:', JSON.parse(data));
        
        // Simulate receiving the same message back (for demo)
        setTimeout(() => {
            if (this.onmessage) {
                this.onmessage({ data });
            }
        }, 100);
    }
    
    close() {
        this.readyState = WebSocket.CLOSED;
        if (this.onclose) this.onclose();
    }
}

// Voice Chat Manager
class VoiceChatManager {
    constructor(options) {
        this.onParticipantVoiceChange = options.onParticipantVoiceChange || (() => {});
        this.isActive = false;
        this.mediaStream = null;
    }
    
    async start() {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.isActive = true;
            console.log('🎤 Voice chat started');
        } catch (error) {
            console.error('Failed to start voice chat:', error);
            throw new Error('Microphone access denied');
        }
    }
    
    async stop() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        this.isActive = false;
        console.log('🔇 Voice chat stopped');
    }
    
    isActive() {
        return this.isActive;
    }
    
    destroy() {
        this.stop();
    }
}

// Operational Transform for conflict resolution
class OperationalTransform {
    constructor(options) {
        this.onRemoteOperation = options.onRemoteOperation || (() => {});
    }
    
    transform(operation) {
        // Simplified operational transformation
        // In a real implementation, this would handle complex conflict resolution
        return operation;
    }
}

export { Collaboration };