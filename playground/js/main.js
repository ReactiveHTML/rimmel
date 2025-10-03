/**
 * Main Playground Application
 * 
 * This is the central orchestrator for the Rimmel.js Advanced Playground.
 * It manages navigation, tab switching, and coordinates between all modules.
 * 
 * Features:
 * - Tab-based navigation system
 * - State management and persistence
 * - Inter-module communication
 * - Accessibility and keyboard navigation
 * - Responsive layout management
 */

import { VisualEditor } from './visual-editor.js';
import { StreamDebugger } from './stream-debugger.js';
import { AIAssistant } from './ai-assistant.js';
import { Collaboration } from './collaboration.js';
import { Gamification } from './gamification.js';
import { Accessibility } from './accessibility.js';

class PlaygroundApp {
    constructor() {
        this.modules = new Map();
        this.currentTab = 'visual';
        this.state = {
            theme: 'light',
            language: 'en',
            accessibility: {
                highContrast: false,
                reducedMotion: false,
                screenReader: false
            },
            performance: {
                animationQuality: 'high'
            }
        };
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Rimmel.js Advanced Playground...');
        
        // Load saved state
        this.loadState();
        
        // Initialize core modules
        await this.initializeModules();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup accessibility
        this.setupAccessibility();
        
        // Apply initial state
        this.applyState();
        
        console.log('✅ Playground initialized successfully!');
        
        // Show welcome message
        this.showWelcomeMessage();
    }

    async initializeModules() {
        try {
            // Initialize Visual Editor
            this.modules.set('visual-editor', new VisualEditor({
                canvas: document.getElementById('stream-canvas'),
                overlay: document.getElementById('node-overlay'),
                onStateChange: (state) => this.handleModuleStateChange('visual-editor', state)
            }));

            // Initialize Stream Debugger
            this.modules.set('debugger', new StreamDebugger({
                container: document.querySelector('.debugger-container'),
                onMetricsUpdate: (metrics) => this.handleMetricsUpdate(metrics)
            }));

            // Initialize AI Assistant
            this.modules.set('ai-assistant', new AIAssistant({
                container: document.getElementById('ai-assistant'),
                onSuggestion: (suggestion) => this.handleAISuggestion(suggestion)
            }));

            // Initialize Collaboration
            this.modules.set('collaboration', new Collaboration({
                container: document.querySelector('.collaboration-container'),
                onParticipantUpdate: (participants) => this.handleParticipantUpdate(participants)
            }));

            // Initialize Gamification
            this.modules.set('gamification', new Gamification({
                container: document.querySelector('.learning-container'),
                onProgressUpdate: (progress) => this.handleProgressUpdate(progress)
            }));

            // Initialize Accessibility
            this.modules.set('accessibility', new Accessibility({
                onSettingsChange: (settings) => this.handleAccessibilityChange(settings)
            }));

            console.log('📦 All modules initialized');
        } catch (error) {
            console.error('❌ Error initializing modules:', error);
            this.showErrorMessage('Failed to initialize some components. Please refresh the page.');
        }
    }

    setupEventListeners() {
        // Navigation
        this.setupNavigation();
        
        // Header actions
        this.setupHeaderActions();
        
        // Canvas controls
        this.setupCanvasControls();
        
        // Code editor
        this.setupCodeEditor();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Window events
        this.setupWindowEvents();
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });
    }

    setupHeaderActions() {
        // AI Assistant toggle
        const aiToggle = document.getElementById('ai-toggle');
        aiToggle.addEventListener('click', () => {
            this.toggleAIAssistant();
        });

        // Share button
        const shareBtn = document.getElementById('share-btn');
        shareBtn.addEventListener('click', () => {
            this.shareSession();
        });

        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        settingsBtn.addEventListener('click', () => {
            this.openSettings();
        });
    }

    setupCanvasControls() {
        const controls = {
            play: document.getElementById('play-btn'),
            pause: document.getElementById('pause-btn'),
            step: document.getElementById('step-btn'),
            reset: document.getElementById('reset-btn'),
            clear: document.getElementById('clear-btn')
        };

        controls.play.addEventListener('click', () => {
            this.modules.get('visual-editor')?.play();
            this.updateControlStates('playing');
        });

        controls.pause.addEventListener('click', () => {
            this.modules.get('visual-editor')?.pause();
            this.updateControlStates('paused');
        });

        controls.step.addEventListener('click', () => {
            this.modules.get('visual-editor')?.step();
        });

        controls.reset.addEventListener('click', () => {
            this.modules.get('visual-editor')?.reset();
            this.updateControlStates('stopped');
        });

        controls.clear.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
                this.modules.get('visual-editor')?.clear();
                this.updateControlStates('stopped');
            }
        });
    }

    setupCodeEditor() {
        const templateSelector = document.getElementById('template-selector');
        const formatBtn = document.getElementById('format-code');
        const runBtn = document.getElementById('run-code');

        templateSelector.addEventListener('change', (e) => {
            this.loadTemplate(e.target.value);
        });

        formatBtn.addEventListener('click', () => {
            this.formatCode();
        });

        runBtn.addEventListener('click', () => {
            this.runCode();
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Check for modifier keys
            const isCtrl = e.ctrlKey || e.metaKey;
            
            if (isCtrl) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveSession();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.runCode();
                        break;
                    case '/':
                        e.preventDefault();
                        this.toggleAIAssistant();
                        break;
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                        e.preventDefault();
                        const tabIndex = parseInt(e.key) - 1;
                        const tabs = ['visual', 'code', 'debugger', 'learn', 'collaborate'];
                        if (tabs[tabIndex]) {
                            this.switchTab(tabs[tabIndex]);
                        }
                        break;
                }
            }

            // Escape key
            if (e.key === 'Escape') {
                this.closeModals();
            }

            // Space bar for play/pause (when not in input)
            if (e.key === ' ' && !this.isInputFocused()) {
                e.preventDefault();
                this.togglePlayback();
            }
        });
    }

    setupWindowEvents() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle beforeunload
        window.addEventListener('beforeunload', (e) => {
            this.saveState();
            
            // Warn about unsaved changes
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        });

        // Handle online/offline
        window.addEventListener('online', () => {
            this.handleConnectionChange(true);
        });

        window.addEventListener('offline', () => {
            this.handleConnectionChange(false);
        });
    }

    switchTab(tabName) {
        if (tabName === this.currentTab) return;

        console.log(`🔄 Switching to tab: ${tabName}`);

        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.tab === tabName);
        });

        // Notify modules
        this.modules.get('visual-editor')?.setActive(tabName === 'visual');
        this.modules.get('debugger')?.setActive(tabName === 'debugger');

        this.currentTab = tabName;
        this.saveState();

        // Announce to screen readers
        this.announceToScreenReader(`Switched to ${tabName} tab`);
    }

    toggleAIAssistant() {
        const assistant = document.getElementById('ai-assistant');
        const isVisible = !assistant.classList.contains('hidden');
        
        if (isVisible) {
            assistant.classList.add('hidden');
            this.announceToScreenReader('AI Assistant closed');
        } else {
            assistant.classList.remove('hidden');
            this.modules.get('ai-assistant')?.focus();
            this.announceToScreenReader('AI Assistant opened');
        }
    }

    async shareSession() {
        try {
            const sessionData = this.exportSession();
            const url = await this.uploadSession(sessionData);
            
            if (navigator.share) {
                await navigator.share({
                    title: 'Rimmel.js Playground Session',
                    text: 'Check out my reactive stream composition!',
                    url: url
                });
            } else {
                await navigator.clipboard.writeText(url);
                this.showNotification('Session URL copied to clipboard!', 'success');
            }
        } catch (error) {
            console.error('Error sharing session:', error);
            this.showNotification('Failed to share session', 'error');
        }
    }

    openSettings() {
        const modal = document.getElementById('settings-modal');
        modal.classList.remove('hidden');
        
        // Focus first interactive element
        const firstInput = modal.querySelector('input, select, button');
        if (firstInput) firstInput.focus();

        // Setup close handlers
        const closeBtn = document.getElementById('close-settings');
        const handleClose = () => {
            modal.classList.add('hidden');
            closeBtn.removeEventListener('click', handleClose);
            modal.removeEventListener('click', handleClickOutside);
        };

        const handleClickOutside = (e) => {
            if (e.target === modal) handleClose();
        };

        closeBtn.addEventListener('click', handleClose);
        modal.addEventListener('click', handleClickOutside);
    }

    updateControlStates(state) {
        const controls = {
            play: document.getElementById('play-btn'),
            pause: document.getElementById('pause-btn'),
            step: document.getElementById('step-btn'),
            reset: document.getElementById('reset-btn')
        };

        switch (state) {
            case 'playing':
                controls.play.disabled = true;
                controls.pause.disabled = false;
                controls.step.disabled = true;
                break;
            case 'paused':
                controls.play.disabled = false;
                controls.pause.disabled = true;
                controls.step.disabled = false;
                break;
            case 'stopped':
                controls.play.disabled = false;
                controls.pause.disabled = true;
                controls.step.disabled = true;
                break;
        }
    }

    loadTemplate(templateName) {
        const templates = {
            'counter': {
                js: `import { rml } from 'rimmel';
import { Subject } from 'rxjs';
import { scan, startWith } from 'rxjs/operators';

const Counter = () => {
  const clicks = new Subject();
  const count = clicks.pipe(
    scan(acc => acc + 1, 0),
    startWith(0)
  );

  return rml\`
    <div class="counter">
      <button onclick="\${clicks}">Click me!</button>
      <p>Count: <span>\${count}</span></p>
    </div>
  \`;
};

document.body.innerHTML = Counter();`,
                html: `<div id="root"></div>`,
                css: `.counter {
  text-align: center;
  padding: 2rem;
  font-family: system-ui, sans-serif;
}

button {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #5b21b6;
}

p {
  font-size: 1.5rem;
  margin-top: 1rem;
}`
            },
            'color-picker': {
                js: `import { rml } from 'rimmel';
import { Subject, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

const ColorPicker = (initial = [255, 128, 64]) => {
  const toHex = n => n.toString(16).padStart(2, '0');
  const toRGBString = rgbArr => \`#\${rgbArr.map(toHex).join('')}\`;
  
  const toNumericStream = x => new Subject().pipe(
    map(e => parseInt(e.target.value, 10)),
    startWith(x),
  );

  const [R, G, B] = initial.map(toNumericStream);
  const RGB = combineLatest([R, G, B]).pipe(
    map(toRGBString),
  );

  return rml\`
    <div class="color-picker">
      <div class="sliders">
        R: <input type="range" max="255" value="\${initial[0]}" oninput="\${R}">
        G: <input type="range" max="255" value="\${initial[1]}" oninput="\${G}">
        B: <input type="range" max="255" value="\${initial[2]}" oninput="\${B}">
      </div>
      
      <div class="preview">
        Current: <span>\${RGB}</span>
        <div class="color-box" style="background-color: \${RGB}"></div>
      </div>
    </div>
  \`;
};

document.body.innerHTML = ColorPicker();`,
                html: `<div id="root"></div>`,
                css: `.color-picker {
  padding: 2rem;
  font-family: system-ui, sans-serif;
}

.sliders {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.sliders input {
  width: 300px;
  margin-left: 1rem;
}

.preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.2rem;
}

.color-box {
  width: 100px;
  height: 100px;
  border: 2px solid #ddd;
  border-radius: 8px;
}`
            }
        };

        const template = templates[templateName];
        if (template) {
            document.getElementById('js-editor').value = template.js;
            document.getElementById('html-editor').value = template.html;
            document.getElementById('css-editor').value = template.css;
            
            this.showNotification(`Template "${templateName}" loaded`, 'success');
        }
    }

    formatCode() {
        // Basic code formatting (in a real implementation, you'd use a proper formatter)
        const jsEditor = document.getElementById('js-editor');
        const htmlEditor = document.getElementById('html-editor');
        const cssEditor = document.getElementById('css-editor');

        // Simple formatting for demo purposes
        [jsEditor, htmlEditor, cssEditor].forEach(editor => {
            if (editor.value.trim()) {
                // Basic indentation fix
                const lines = editor.value.split('\n');
                let indentLevel = 0;
                const formatted = lines.map(line => {
                    const trimmed = line.trim();
                    if (trimmed.includes('}') || trimmed.includes('</')) {
                        indentLevel = Math.max(0, indentLevel - 1);
                    }
                    const result = '  '.repeat(indentLevel) + trimmed;
                    if (trimmed.includes('{') || trimmed.includes('<') && !trimmed.includes('</')) {
                        indentLevel++;
                    }
                    return result;
                }).join('\n');
                
                editor.value = formatted;
            }
        });

        this.showNotification('Code formatted', 'success');
    }

    runCode() {
        const jsCode = document.getElementById('js-editor').value;
        const htmlCode = document.getElementById('html-editor').value;
        const cssCode = document.getElementById('css-editor').value;

        const previewFrame = document.getElementById('preview-frame');
        const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;

        const fullHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${cssCode}</style>
    <script src="https://unpkg.com/rxjs@7/dist/bundles/rxjs.umd.min.js"></script>
    <script type="module" src="../dist/esm/index.js"></script>
</head>
<body>
    ${htmlCode}
    <script type="module">
        try {
            ${jsCode}
        } catch (error) {
            console.error('Runtime error:', error);
            document.body.innerHTML = '<div style="color: red; padding: 1rem;">Error: ' + error.message + '</div>';
        }
    </script>
</body>
</html>`;

        doc.open();
        doc.write(fullHTML);
        doc.close();

        this.showNotification('Code executed', 'success');
    }

    // State management
    loadState() {
        try {
            const saved = localStorage.getItem('rimmel-playground-state');
            if (saved) {
                this.state = { ...this.state, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load saved state:', error);
        }
    }

    saveState() {
        try {
            localStorage.setItem('rimmel-playground-state', JSON.stringify(this.state));
        } catch (error) {
            console.warn('Failed to save state:', error);
        }
    }

    applyState() {
        // Apply theme
        document.documentElement.setAttribute('data-theme', this.state.theme);
        
        // Apply accessibility settings
        if (this.state.accessibility.highContrast) {
            document.documentElement.setAttribute('data-accessibility', 'high-contrast');
        }
        
        if (this.state.accessibility.reducedMotion) {
            document.documentElement.setAttribute('data-accessibility', 'reduced-motion');
        }
    }

    setupAccessibility() {
        // ARIA live regions for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-announcements';
        document.body.appendChild(liveRegion);

        // Skip link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'sr-only';
        skipLink.addEventListener('focus', () => {
            skipLink.classList.remove('sr-only');
        });
        skipLink.addEventListener('blur', () => {
            skipLink.classList.add('sr-only');
        });
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // Helper methods
    announceToScreenReader(message) {
        const liveRegion = document.getElementById('live-announcements');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '10000',
            animation: 'slideInRight 0.3s ease-out',
            maxWidth: '300px'
        });

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#6366f1'
        };

        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    showErrorMessage(message) {
        this.showNotification(message, 'error');
    }

    showWelcomeMessage() {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 2rem;
                border-radius: 12px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                text-align: center;
                z-index: 10000;
                max-width: 400px;
            ">
                <h2 style="margin: 0 0 1rem 0; color: #6366f1;">Welcome to Rimmel.js Playground! 🎉</h2>
                <p style="margin: 0 0 1.5rem 0; color: #64748b;">
                    Explore reactive stream programming with visual tools, AI assistance, and real-time collaboration.
                </p>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: #6366f1;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                ">Get Started</button>
            </div>
        `;
        
        document.body.appendChild(welcomeDiv);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (welcomeDiv.parentElement) {
                welcomeDiv.remove();
            }
        }, 5000);
    }

    isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true'
        );
    }

    togglePlayback() {
        const visualEditor = this.modules.get('visual-editor');
        if (visualEditor) {
            if (visualEditor.isPlaying()) {
                visualEditor.pause();
                this.updateControlStates('paused');
            } else {
                visualEditor.play();
                this.updateControlStates('playing');
            }
        }
    }

    closeModals() {
        // Close AI assistant
        document.getElementById('ai-assistant').classList.add('hidden');
        
        // Close settings modal
        document.getElementById('settings-modal').classList.add('hidden');
        
        // Close any other modals
        document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    handleResize() {
        // Notify modules of resize
        this.modules.get('visual-editor')?.handleResize();
        this.modules.get('debugger')?.handleResize();
    }

    handleConnectionChange(online) {
        const status = online ? 'online' : 'offline';
        this.showNotification(`Connection ${status}`, online ? 'success' : 'warning');
        
        // Notify collaboration module
        this.modules.get('collaboration')?.handleConnectionChange(online);
    }

    hasUnsavedChanges() {
        // Check if there are unsaved changes in any module
        return Array.from(this.modules.values()).some(module => 
            module.hasUnsavedChanges && module.hasUnsavedChanges()
        );
    }

    exportSession() {
        return {
            version: '1.0.0',
            timestamp: Date.now(),
            state: this.state,
            modules: Object.fromEntries(
                Array.from(this.modules.entries()).map(([key, module]) => [
                    key,
                    module.exportState ? module.exportState() : {}
                ])
            )
        };
    }

    async uploadSession(sessionData) {
        // In a real implementation, this would upload to a server
        // For now, we'll create a data URL
        const dataStr = JSON.stringify(sessionData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        return URL.createObjectURL(dataBlob);
    }

    saveSession() {
        const sessionData = this.exportSession();
        const dataStr = JSON.stringify(sessionData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `rimmel-session-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Session saved', 'success');
    }

    // Module event handlers
    handleModuleStateChange(moduleName, state) {
        console.log(`📡 Module ${moduleName} state changed:`, state);
    }

    handleMetricsUpdate(metrics) {
        // Update performance display
        console.log('📊 Metrics update:', metrics);
    }

    handleAISuggestion(suggestion) {
        console.log('🤖 AI Suggestion:', suggestion);
        this.showNotification('New AI suggestion available', 'info');
    }

    handleParticipantUpdate(participants) {
        console.log('👥 Participants update:', participants);
    }

    handleProgressUpdate(progress) {
        console.log('🏆 Progress update:', progress);
    }

    handleAccessibilityChange(settings) {
        this.state.accessibility = { ...this.state.accessibility, ...settings };
        this.applyState();
        this.saveState();
    }
}

// Initialize the playground when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.playground = new PlaygroundApp();
    });
} else {
    window.playground = new PlaygroundApp();
}

export { PlaygroundApp };