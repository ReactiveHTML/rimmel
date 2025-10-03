/**
 * Accessibility Module
 * 
 * Provides comprehensive accessibility and internationalization features:
 * - ARIA labels and semantic markup
 * - Keyboard navigation and focus management
 * - Screen reader optimization
 * - High contrast and color blind support
 * - Multi-language support with dynamic switching
 * - Voice navigation and commands
 */

class Accessibility {
    constructor(options) {
        this.container = options.container;
        this.onLanguageChange = options.onLanguageChange || (() => {});
        this.onThemeChange = options.onThemeChange || (() => {});
        
        this.currentLanguage = 'en';
        this.currentTheme = 'default';
        this.isHighContrast = false;
        this.isScreenReaderMode = false;
        this.voiceNavigation = null;
        
        this.translations = new Map();
        this.keyboardShortcuts = new Map();
        this.focusHistory = [];
        this.announcements = [];
        
        this.init();
    }

    init() {
        this.loadTranslations();
        this.setupKeyboardNavigation();
        this.setupAriaLabels();
        this.setupVoiceNavigation();
        this.setupThemeControls();
        this.setupLanguageControls();
        this.detectAccessibilityNeeds();
        
        console.log('♿ Accessibility module initialized');
    }

    loadTranslations() {
        // English (default)
        this.translations.set('en', {
            // Navigation
            'nav.home': 'Home',
            'nav.playground': 'Playground',
            'nav.debugger': 'Debugger',
            'nav.ai': 'AI Assistant',
            'nav.collaboration': 'Collaboration',
            'nav.gamification': 'Gamification',
            'nav.settings': 'Settings',
            
            // Common actions
            'action.save': 'Save',
            'action.load': 'Load',
            'action.export': 'Export',
            'action.import': 'Import',
            'action.run': 'Run',
            'action.stop': 'Stop',
            'action.clear': 'Clear',
            'action.reset': 'Reset',
            'action.close': 'Close',
            'action.cancel': 'Cancel',
            'action.confirm': 'Confirm',
            
            // Playground
            'playground.title': 'ReactiveHTML Playground',
            'playground.description': 'Interactive learning environment for reactive programming',
            'playground.nodepalette': 'Node Palette',
            'playground.canvas': 'Visual Canvas',
            'playground.properties': 'Properties Panel',
            
            // Debugger
            'debugger.title': 'Stream Debugger',
            'debugger.timeline': 'Event Timeline',
            'debugger.metrics': 'Performance Metrics',
            'debugger.memory': 'Memory Usage',
            
            // AI Assistant
            'ai.title': 'AI Assistant',
            'ai.chat': 'Chat with AI',
            'ai.suggestions': 'Code Suggestions',
            'ai.help': 'Get Help',
            
            // Accessibility
            'a11y.highcontrast': 'High Contrast Mode',
            'a11y.screenreader': 'Screen Reader Mode',
            'a11y.keyboard': 'Keyboard Navigation',
            'a11y.voice': 'Voice Commands',
            'a11y.language': 'Language',
            'a11y.theme': 'Theme',
            
            // Announcements
            'announce.loading': 'Loading content',
            'announce.loaded': 'Content loaded',
            'announce.saving': 'Saving changes',
            'announce.saved': 'Changes saved',
            'announce.error': 'An error occurred',
            'announce.success': 'Operation completed successfully',
            'announce.navigated': 'Navigated to {section}',
            'announce.focused': 'Focused on {element}',
            
            // Instructions
            'instruction.keyboard': 'Use Tab to navigate, Enter to activate, Escape to cancel',
            'instruction.voice': 'Say "help" for voice commands',
            'instruction.dragdrop': 'Use Space to pick up, arrow keys to move, Space to drop'
        });
        
        // Spanish
        this.translations.set('es', {
            'nav.home': 'Inicio',
            'nav.playground': 'Área de Juego',
            'nav.debugger': 'Depurador',
            'nav.ai': 'Asistente IA',
            'nav.collaboration': 'Colaboración',
            'nav.gamification': 'Gamificación',
            'nav.settings': 'Configuración',
            
            'action.save': 'Guardar',
            'action.load': 'Cargar',
            'action.export': 'Exportar',
            'action.import': 'Importar',
            'action.run': 'Ejecutar',
            'action.stop': 'Detener',
            'action.clear': 'Limpiar',
            'action.reset': 'Reiniciar',
            'action.close': 'Cerrar',
            'action.cancel': 'Cancelar',
            'action.confirm': 'Confirmar',
            
            'playground.title': 'ReactiveHTML Área de Juego',
            'playground.description': 'Entorno de aprendizaje interactivo para programación reactiva'
        });
        
        // French
        this.translations.set('fr', {
            'nav.home': 'Accueil',
            'nav.playground': 'Terrain de Jeu',
            'nav.debugger': 'Débogueur',
            'nav.ai': 'Assistant IA',
            'nav.collaboration': 'Collaboration',
            'nav.gamification': 'Gamification',
            'nav.settings': 'Paramètres',
            
            'action.save': 'Enregistrer',
            'action.load': 'Charger',
            'action.export': 'Exporter',
            'action.import': 'Importer',
            'action.run': 'Exécuter',
            'action.stop': 'Arrêter',
            'action.clear': 'Effacer',
            'action.reset': 'Réinitialiser',
            'action.close': 'Fermer',
            'action.cancel': 'Annuler',
            'action.confirm': 'Confirmer'
        });
        
        // German
        this.translations.set('de', {
            'nav.home': 'Startseite',
            'nav.playground': 'Spielplatz',
            'nav.debugger': 'Debugger',
            'nav.ai': 'KI-Assistent',
            'nav.collaboration': 'Zusammenarbeit',
            'nav.gamification': 'Gamifikation',
            'nav.settings': 'Einstellungen',
            
            'action.save': 'Speichern',
            'action.load': 'Laden',
            'action.export': 'Exportieren',
            'action.import': 'Importieren',
            'action.run': 'Ausführen',
            'action.stop': 'Stoppen',
            'action.clear': 'Löschen',
            'action.reset': 'Zurücksetzen',
            'action.close': 'Schließen',
            'action.cancel': 'Abbrechen',
            'action.confirm': 'Bestätigen'
        });
    }

    setupKeyboardNavigation() {
        // Global keyboard shortcuts
        this.keyboardShortcuts.set('Alt+1', () => this.focusSection('playground'));
        this.keyboardShortcuts.set('Alt+2', () => this.focusSection('debugger'));
        this.keyboardShortcuts.set('Alt+3', () => this.focusSection('ai-assistant'));
        this.keyboardShortcuts.set('Alt+4', () => this.focusSection('collaboration'));
        this.keyboardShortcuts.set('Alt+5', () => this.focusSection('gamification'));
        this.keyboardShortcuts.set('Alt+S', () => this.triggerSave());
        this.keyboardShortcuts.set('Alt+R', () => this.triggerRun());
        this.keyboardShortcuts.set('Alt+H', () => this.showKeyboardHelp());
        this.keyboardShortcuts.set('Escape', () => this.handleEscape());
        
        // Setup keyboard event listener
        document.addEventListener('keydown', (e) => this.handleKeyboardEvent(e));
        
        // Setup focus management
        this.setupFocusManagement();
        
        // Setup skip links
        this.setupSkipLinks();
    }

    setupFocusManagement() {
        // Track focus changes
        document.addEventListener('focusin', (e) => {
            this.focusHistory.push({
                element: e.target,
                timestamp: Date.now(),
                section: this.getCurrentSection(e.target)
            });
            
            // Limit history to last 10 elements
            if (this.focusHistory.length > 10) {
                this.focusHistory.shift();
            }
            
            this.announceElementFocus(e.target);
        });
        
        // Setup focus trap for modals
        this.setupModalFocusTraps();
    }

    setupSkipLinks() {
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">${this.t('nav.skip-to-main')}</a>
            <a href="#navigation" class="skip-link">${this.t('nav.skip-to-nav')}</a>
            <a href="#playground" class="skip-link">${this.t('nav.skip-to-playground')}</a>
        `;
        
        document.body.insertBefore(skipLinks, document.body.firstChild);
    }

    setupModalFocusTraps() {
        // Monitor for modal creation
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('modal')) {
                        this.trapFocusInModal(node);
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true });
    }

    trapFocusInModal(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // Focus the first element
        firstElement.focus();
        
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }

    setupAriaLabels() {
        // Add ARIA labels to all interactive elements
        this.labelInteractiveElements();
        
        // Setup live regions for announcements
        this.setupLiveRegions();
        
        // Add landmark roles
        this.setupLandmarks();
        
        // Setup ARIA descriptions
        this.setupAriaDescriptions();
    }

    labelInteractiveElements() {
        // Buttons without text content
        document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').forEach(button => {
            if (!button.textContent.trim()) {
                const icon = button.querySelector('.icon');
                if (icon) {
                    button.setAttribute('aria-label', this.getIconLabel(icon.textContent));
                }
            }
        });
        
        // Form inputs without labels
        document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').forEach(input => {
            const placeholder = input.getAttribute('placeholder');
            if (placeholder) {
                input.setAttribute('aria-label', placeholder);
            }
        });
        
        // Canvas elements
        document.querySelectorAll('canvas').forEach(canvas => {
            if (!canvas.getAttribute('aria-label')) {
                canvas.setAttribute('aria-label', this.t('playground.canvas'));
                canvas.setAttribute('role', 'img');
            }
        });
    }

    setupLiveRegions() {
        // Create announcement region
        const announcer = document.createElement('div');
        announcer.id = 'announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        document.body.appendChild(announcer);
        
        // Create status region
        const status = document.createElement('div');
        status.id = 'status';
        status.setAttribute('aria-live', 'assertive');
        status.setAttribute('aria-atomic', 'true');
        status.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        document.body.appendChild(status);
    }

    setupLandmarks() {
        // Main content area
        const mainContent = document.getElementById('main-content');
        if (mainContent && !mainContent.getAttribute('role')) {
            mainContent.setAttribute('role', 'main');
        }
        
        // Navigation areas
        document.querySelectorAll('.tab-nav, .navigation').forEach(nav => {
            if (!nav.getAttribute('role')) {
                nav.setAttribute('role', 'navigation');
                nav.setAttribute('aria-label', this.t('nav.main-navigation'));
            }
        });
        
        // Complementary content
        document.querySelectorAll('.sidebar, .properties-panel').forEach(aside => {
            if (!aside.getAttribute('role')) {
                aside.setAttribute('role', 'complementary');
            }
        });
    }

    setupAriaDescriptions() {
        // Add descriptions to complex elements
        const playground = document.getElementById('playground');
        if (playground) {
            const description = document.createElement('div');
            description.id = 'playground-description';
            description.className = 'sr-only';
            description.textContent = this.t('playground.description');
            playground.parentNode.insertBefore(description, playground);
            playground.setAttribute('aria-describedby', 'playground-description');
        }
    }

    setupVoiceNavigation() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.voiceNavigation = new VoiceNavigationManager({
                onCommand: (command) => this.handleVoiceCommand(command),
                language: this.currentLanguage
            });
        }
    }

    setupThemeControls() {
        const themeControls = document.createElement('div');
        themeControls.className = 'accessibility-controls theme-controls';
        themeControls.innerHTML = `
            <fieldset>
                <legend>${this.t('a11y.theme')}</legend>
                <label>
                    <input type="radio" name="theme" value="default" ${this.currentTheme === 'default' ? 'checked' : ''}>
                    ${this.t('theme.default')}
                </label>
                <label>
                    <input type="radio" name="theme" value="dark" ${this.currentTheme === 'dark' ? 'checked' : ''}>
                    ${this.t('theme.dark')}
                </label>
                <label>
                    <input type="radio" name="theme" value="high-contrast" ${this.currentTheme === 'high-contrast' ? 'checked' : ''}>
                    ${this.t('theme.high-contrast')}
                </label>
            </fieldset>
            
            <div class="accessibility-toggles">
                <label>
                    <input type="checkbox" id="screen-reader-mode" ${this.isScreenReaderMode ? 'checked' : ''}>
                    ${this.t('a11y.screenreader')}
                </label>
                <label>
                    <input type="checkbox" id="voice-navigation" ${this.voiceNavigation?.isActive() ? 'checked' : ''}>
                    ${this.t('a11y.voice')}
                </label>
            </div>
        `;
        
        // Add event listeners
        themeControls.addEventListener('change', (e) => this.handleAccessibilityChange(e));
        
        // Add to settings panel or create floating controls
        const settingsPanel = document.querySelector('.settings-panel');
        if (settingsPanel) {
            settingsPanel.appendChild(themeControls);
        } else {
            this.createFloatingAccessibilityControls(themeControls);
        }
    }

    setupLanguageControls() {
        const languageControls = document.createElement('div');
        languageControls.className = 'language-controls';
        languageControls.innerHTML = `
            <label for="language-select">${this.t('a11y.language')}:</label>
            <select id="language-select" aria-label="${this.t('a11y.language')}">
                <option value="en" ${this.currentLanguage === 'en' ? 'selected' : ''}>English</option>
                <option value="es" ${this.currentLanguage === 'es' ? 'selected' : ''}>Español</option>
                <option value="fr" ${this.currentLanguage === 'fr' ? 'selected' : ''}>Français</option>
                <option value="de" ${this.currentLanguage === 'de' ? 'selected' : ''}>Deutsch</option>
            </select>
        `;
        
        languageControls.addEventListener('change', (e) => {
            if (e.target.id === 'language-select') {
                this.changeLanguage(e.target.value);
            }
        });
        
        const settingsPanel = document.querySelector('.settings-panel');
        if (settingsPanel) {
            settingsPanel.appendChild(languageControls);
        }
    }

    createFloatingAccessibilityControls(themeControls) {
        const floatingControls = document.createElement('div');
        floatingControls.className = 'floating-accessibility-controls';
        floatingControls.setAttribute('role', 'toolbar');
        floatingControls.setAttribute('aria-label', this.t('a11y.controls'));
        
        const toggleButton = document.createElement('button');
        toggleButton.className = 'accessibility-toggle-btn';
        toggleButton.innerHTML = '♿';
        toggleButton.setAttribute('aria-label', this.t('a11y.open-controls'));
        toggleButton.addEventListener('click', () => {
            floatingControls.classList.toggle('expanded');
        });
        
        floatingControls.appendChild(toggleButton);
        floatingControls.appendChild(themeControls);
        document.body.appendChild(floatingControls);
    }

    detectAccessibilityNeeds() {
        // Detect if user prefers reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }
        
        // Detect if user prefers high contrast
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            this.enableHighContrast();
        }
        
        // Detect if user prefers dark theme
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.setTheme('dark');
        }
        
        // Check for screen reader usage
        if (this.isScreenReaderLikely()) {
            this.enableScreenReaderMode();
        }
    }

    isScreenReaderLikely() {
        // Heuristics to detect screen reader usage
        return window.navigator.userAgent.includes('NVDA') || 
               window.navigator.userAgent.includes('JAWS') || 
               window.speechSynthesis.getVoices().length > 0;
    }

    // Translation system
    t(key, params = {}) {
        const languageMap = this.translations.get(this.currentLanguage) || this.translations.get('en');
        let translation = languageMap[key];
        
        if (!translation) {
            console.warn(`Missing translation for key: ${key}`);
            translation = key;
        }
        
        // Replace parameters
        Object.keys(params).forEach(param => {
            translation = translation.replace(`{${param}}`, params[param]);
        });
        
        return translation;
    }

    changeLanguage(language) {
        if (!this.translations.has(language)) {
            console.warn(`Language not supported: ${language}`);
            return;
        }
        
        this.currentLanguage = language;
        this.updateAllText();
        
        if (this.voiceNavigation) {
            this.voiceNavigation.setLanguage(language);
        }
        
        this.onLanguageChange(language);
        this.announce(this.t('announce.language-changed', { language }));
        
        console.log(`🌐 Language changed to: ${language}`);
    }

    updateAllText() {
        // Update all translatable text elements
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });
        
        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.setAttribute('placeholder', this.t(key));
        });
        
        // Update ARIA labels
        document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria-label');
            element.setAttribute('aria-label', this.t(key));
        });
    }

    // Theme management
    setTheme(theme) {
        document.body.classList.remove('theme-default', 'theme-dark', 'theme-high-contrast');
        document.body.classList.add(`theme-${theme}`);
        
        this.currentTheme = theme;
        this.isHighContrast = theme === 'high-contrast';
        
        this.onThemeChange(theme);
        this.announce(this.t('announce.theme-changed', { theme }));
        
        console.log(`🎨 Theme changed to: ${theme}`);
    }

    enableHighContrast() {
        this.setTheme('high-contrast');
        this.isHighContrast = true;
        
        // Additional high contrast adjustments
        this.enhanceVisualElements();
    }

    enableScreenReaderMode() {
        this.isScreenReaderMode = true;
        document.body.classList.add('screen-reader-mode');
        
        // Add more descriptive text
        this.addScreenReaderDescriptions();
        
        // Simplify complex visual elements
        this.simplifyForScreenReader();
        
        console.log('👁️ Screen reader mode enabled');
    }

    enhanceVisualElements() {
        // Increase border widths
        document.body.classList.add('enhanced-borders');
        
        // Add focus indicators
        document.body.classList.add('enhanced-focus');
        
        // Improve color contrasts
        this.adjustColorContrasts();
    }

    addScreenReaderDescriptions() {
        // Add more detailed descriptions for complex elements
        document.querySelectorAll('.stream-node').forEach((node, index) => {
            if (!node.getAttribute('aria-label')) {
                node.setAttribute('aria-label', `Stream node ${index + 1}: ${node.textContent}`);
            }
        });
        
        document.querySelectorAll('.connection').forEach((connection, index) => {
            connection.setAttribute('aria-label', `Stream connection ${index + 1}`);
        });
    }

    simplifyForScreenReader() {
        // Hide decorative elements
        document.querySelectorAll('.decorative, .visual-only').forEach(element => {
            element.setAttribute('aria-hidden', 'true');
        });
        
        // Add text alternatives for visual information
        this.addTextAlternatives();
    }

    addTextAlternatives() {
        // Add text descriptions for charts and graphs
        document.querySelectorAll('canvas[role="img"]').forEach(canvas => {
            const description = this.generateCanvasDescription(canvas);
            const descId = `desc-${Date.now()}`;
            
            const descElement = document.createElement('div');
            descElement.id = descId;
            descElement.className = 'sr-only';
            descElement.textContent = description;
            
            canvas.parentNode.insertBefore(descElement, canvas.nextSibling);
            canvas.setAttribute('aria-describedby', descId);
        });
    }

    generateCanvasDescription(canvas) {
        // Generate meaningful description based on canvas content
        if (canvas.id === 'playground-canvas') {
            return this.t('description.playground-canvas');
        } else if (canvas.id === 'debugger-timeline') {
            return this.t('description.debugger-timeline');
        }
        return this.t('description.interactive-canvas');
    }

    // Keyboard navigation
    handleKeyboardEvent(e) {
        const shortcut = this.getKeyboardShortcut(e);
        const handler = this.keyboardShortcuts.get(shortcut);
        
        if (handler) {
            e.preventDefault();
            handler();
            return;
        }
        
        // Handle custom navigation
        this.handleCustomNavigation(e);
    }

    getKeyboardShortcut(e) {
        const parts = [];
        if (e.ctrlKey) parts.push('Ctrl');
        if (e.altKey) parts.push('Alt');
        if (e.shiftKey) parts.push('Shift');
        if (e.metaKey) parts.push('Meta');
        
        if (e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Shift' && e.key !== 'Meta') {
            parts.push(e.key);
        }
        
        return parts.join('+');
    }

    handleCustomNavigation(e) {
        // Handle arrow key navigation in canvas
        if (document.activeElement && document.activeElement.classList.contains('stream-node')) {
            this.handleNodeNavigation(e);
        }
        
        // Handle tab list navigation
        if (document.activeElement && document.activeElement.closest('.tab-nav')) {
            this.handleTabNavigation(e);
        }
    }

    handleNodeNavigation(e) {
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.key)) return;
        
        e.preventDefault();
        const currentNode = document.activeElement;
        
        if (e.key === 'Space') {
            // Toggle node selection/dragging
            this.toggleNodeSelection(currentNode);
        } else {
            // Navigate to adjacent nodes
            const nextNode = this.findAdjacentNode(currentNode, e.key);
            if (nextNode) {
                nextNode.focus();
                this.announceElementFocus(nextNode);
            }
        }
    }

    handleTabNavigation(e) {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        
        e.preventDefault();
        const tabs = document.querySelectorAll('.tab-nav [role="tab"]');
        const currentIndex = Array.from(tabs).indexOf(document.activeElement);
        
        let newIndex;
        switch (e.key) {
            case 'ArrowLeft':
                newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                break;
            case 'ArrowRight':
                newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'Home':
                newIndex = 0;
                break;
            case 'End':
                newIndex = tabs.length - 1;
                break;
        }
        
        if (newIndex !== undefined) {
            tabs[newIndex].focus();
            tabs[newIndex].click();
        }
    }

    // Voice navigation
    handleVoiceCommand(command) {
        const lowerCommand = command.toLowerCase();
        
        if (lowerCommand.includes('navigate') || lowerCommand.includes('go to')) {
            this.handleVoiceNavigation(lowerCommand);
        } else if (lowerCommand.includes('run') || lowerCommand.includes('execute')) {
            this.triggerRun();
        } else if (lowerCommand.includes('save')) {
            this.triggerSave();
        } else if (lowerCommand.includes('help')) {
            this.showVoiceHelp();
        } else if (lowerCommand.includes('read')) {
            this.readCurrentContent();
        }
    }

    handleVoiceNavigation(command) {
        if (command.includes('playground')) {
            this.focusSection('playground');
        } else if (command.includes('debugger')) {
            this.focusSection('debugger');
        } else if (command.includes('assistant')) {
            this.focusSection('ai-assistant');
        }
    }

    // Focus management
    focusSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const focusable = section.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable) {
                focusable.focus();
                this.announce(this.t('announce.navigated', { section: this.t(`nav.${sectionId}`) }));
            }
        }
    }

    announceElementFocus(element) {
        const label = this.getElementLabel(element);
        if (label && this.isScreenReaderMode) {
            this.announce(this.t('announce.focused', { element: label }));
        }
    }

    getElementLabel(element) {
        return element.getAttribute('aria-label') || 
               element.getAttribute('title') || 
               element.textContent.trim() || 
               element.getAttribute('placeholder');
    }

    getCurrentSection(element) {
        const section = element.closest('[id]');
        return section ? section.id : 'unknown';
    }

    // Announcements
    announce(message, priority = 'polite') {
        const announcer = document.getElementById(priority === 'assertive' ? 'status' : 'announcer');
        if (announcer) {
            announcer.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                announcer.textContent = '';
            }, 1000);
        }
        
        // Also log for debugging
        console.log(`📢 Announced: ${message}`);
    }

    // Utility methods
    getIconLabel(iconText) {
        const iconLabels = {
            '🎯': this.t('icon.target'),
            '🔍': this.t('icon.search'),
            '⚙️': this.t('icon.settings'),
            '💾': this.t('icon.save'),
            '▶️': this.t('icon.play'),
            '⏸️': this.t('icon.pause'),
            '🔇': this.t('icon.mute'),
            '🎤': this.t('icon.microphone')
        };
        
        return iconLabels[iconText] || iconText;
    }

    adjustColorContrasts() {
        // Programmatically adjust colors for better contrast
        const style = document.createElement('style');
        style.textContent = `
            .theme-high-contrast {
                --primary-color: #ffffff;
                --secondary-color: #000000;
                --accent-color: #ffff00;
                --background-color: #000000;
                --text-color: #ffffff;
            }
        `;
        document.head.appendChild(style);
    }

    // Event handlers
    handleAccessibilityChange(e) {
        if (e.target.name === 'theme') {
            this.setTheme(e.target.value);
        } else if (e.target.id === 'screen-reader-mode') {
            if (e.target.checked) {
                this.enableScreenReaderMode();
            } else {
                this.disableScreenReaderMode();
            }
        } else if (e.target.id === 'voice-navigation') {
            if (e.target.checked) {
                this.voiceNavigation?.start();
            } else {
                this.voiceNavigation?.stop();
            }
        }
    }

    disableScreenReaderMode() {
        this.isScreenReaderMode = false;
        document.body.classList.remove('screen-reader-mode');
    }

    // Help systems
    showKeyboardHelp() {
        const helpDialog = document.createElement('div');
        helpDialog.className = 'modal accessibility-help-modal';
        helpDialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${this.t('help.keyboard-shortcuts')}</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="shortcut-group">
                        <h4>${this.t('help.navigation')}</h4>
                        <dl>
                            <dt>Alt + 1</dt><dd>${this.t('nav.playground')}</dd>
                            <dt>Alt + 2</dt><dd>${this.t('nav.debugger')}</dd>
                            <dt>Alt + 3</dt><dd>${this.t('nav.ai')}</dd>
                            <dt>Tab</dt><dd>${this.t('help.next-element')}</dd>
                            <dt>Shift + Tab</dt><dd>${this.t('help.previous-element')}</dd>
                        </dl>
                    </div>
                    <div class="shortcut-group">
                        <h4>${this.t('help.actions')}</h4>
                        <dl>
                            <dt>Alt + S</dt><dd>${this.t('action.save')}</dd>
                            <dt>Alt + R</dt><dd>${this.t('action.run')}</dd>
                            <dt>Escape</dt><dd>${this.t('action.cancel')}</dd>
                            <dt>Enter</dt><dd>${this.t('help.activate')}</dd>
                        </dl>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(helpDialog);
    }

    showVoiceHelp() {
        this.announce(this.t('help.voice-commands'));
        
        const commands = [
            'Navigate to playground',
            'Go to debugger',
            'Run code',
            'Save project',
            'Show help',
            'Read content'
        ];
        
        setTimeout(() => {
            this.announce(this.t('help.available-commands') + ': ' + commands.join(', '));
        }, 1000);
    }

    // Action handlers
    triggerSave() {
        const saveBtn = document.querySelector('[data-action="save"]');
        if (saveBtn) {
            saveBtn.click();
            this.announce(this.t('announce.saving'));
        }
    }

    triggerRun() {
        const runBtn = document.querySelector('[data-action="run"]');
        if (runBtn) {
            runBtn.click();
            this.announce(this.t('announce.running'));
        }
    }

    handleEscape() {
        // Close topmost modal or cancel current action
        const modal = document.querySelector('.modal:last-of-type');
        if (modal) {
            modal.remove();
        } else {
            // Cancel any ongoing operations
            this.announce(this.t('announce.cancelled'));
        }
    }

    // Public API
    setLanguage(language) {
        this.changeLanguage(language);
    }

    announceStatus(message, priority = 'polite') {
        this.announce(message, priority);
    }

    exportSettings() {
        return {
            language: this.currentLanguage,
            theme: this.currentTheme,
            isHighContrast: this.isHighContrast,
            isScreenReaderMode: this.isScreenReaderMode,
            voiceNavigationEnabled: this.voiceNavigation?.isActive()
        };
    }

    importSettings(settings) {
        if (settings.language) this.changeLanguage(settings.language);
        if (settings.theme) this.setTheme(settings.theme);
        if (settings.isScreenReaderMode) this.enableScreenReaderMode();
        if (settings.voiceNavigationEnabled && this.voiceNavigation) {
            this.voiceNavigation.start();
        }
    }

    destroy() {
        if (this.voiceNavigation) {
            this.voiceNavigation.destroy();
        }
        
        document.removeEventListener('keydown', this.handleKeyboardEvent);
        
        console.log('♿ Accessibility module destroyed');
    }
}

// Voice Navigation Manager
class VoiceNavigationManager {
    constructor(options) {
        this.onCommand = options.onCommand || (() => {});
        this.language = options.language || 'en';
        this.isActive = false;
        this.recognition = null;
        
        this.init();
    }
    
    init() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
        }
        
        if (this.recognition) {
            this.recognition.continuous = true;
            this.recognition.interimResults = false;
            this.recognition.lang = this.getLanguageCode(this.language);
            
            this.recognition.onresult = (event) => {
                const command = event.results[event.results.length - 1][0].transcript;
                this.onCommand(command);
            };
        }
    }
    
    start() {
        if (this.recognition && !this.isActive) {
            this.recognition.start();
            this.isActive = true;
        }
    }
    
    stop() {
        if (this.recognition && this.isActive) {
            this.recognition.stop();
            this.isActive = false;
        }
    }
    
    setLanguage(language) {
        this.language = language;
        if (this.recognition) {
            this.recognition.lang = this.getLanguageCode(language);
        }
    }
    
    getLanguageCode(language) {
        const codes = {
            'en': 'en-US',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE'
        };
        return codes[language] || 'en-US';
    }
    
    isActive() {
        return this.isActive;
    }
    
    destroy() {
        this.stop();
    }
}

export { Accessibility };