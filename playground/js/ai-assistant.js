/**
 * AI Assistant Module
 * 
 * Provides intelligent assistance for reactive programming including:
 * - Natural language query processing
 * - RxJS operator suggestions
 * - Code generation and debugging
 * - Pattern recognition and recommendations
 * - Interactive tutorials and explanations
 */

class AIAssistant {
    constructor(options) {
        this.container = options.container;
        this.onSuggestion = options.onSuggestion || (() => {});
        
        this.isVisible = false;
        this.context = new Map();
        this.conversationHistory = [];
        this.suggestionEngine = new SuggestionEngine();
        this.codeAnalyzer = new CodeAnalyzer();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSuggestionSystem();
        this.initializeKnowledgeBase();
        this.startContextMonitoring();
        
        console.log('🤖 AI Assistant initialized');
    }

    setupEventListeners() {
        // Chat input
        const input = document.getElementById('ai-input');
        const sendBtn = document.getElementById('send-ai-message');
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Suggestion clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.suggestion')) {
                const suggestion = e.target.closest('.suggestion');
                this.applySuggestion(suggestion.dataset.suggestion);
            }
        });
        
        // Message actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('message-action-btn')) {
                const action = e.target.dataset.action;
                const messageElement = e.target.closest('.ai-message');
                this.handleMessageAction(action, messageElement);
            }
        });
    }

    setupSuggestionSystem() {
        this.updateSuggestions();
        
        // Update suggestions periodically based on context
        setInterval(() => {
            if (this.isVisible) {
                this.updateSuggestions();
            }
        }, 5000);
    }

    initializeKnowledgeBase() {
        this.knowledgeBase = {
            operators: {
                'map': {
                    description: 'Transforms each emitted value by applying a function',
                    usage: 'source.pipe(map(x => x * 2))',
                    category: 'transformation',
                    examples: [
                        'Convert numbers to strings: map(x => x.toString())',
                        'Extract properties: map(user => user.name)',
                        'Mathematical operations: map(x => x * 2 + 1)'
                    ]
                },
                'filter': {
                    description: 'Emits only values that pass a predicate function',
                    usage: 'source.pipe(filter(x => x > 0))',
                    category: 'filtering',
                    examples: [
                        'Filter positive numbers: filter(x => x > 0)',
                        'Filter truthy values: filter(Boolean)',
                        'Filter by property: filter(user => user.active)'
                    ]
                },
                'debounceTime': {
                    description: 'Delays emission until a specified time has passed without another emission',
                    usage: 'source.pipe(debounceTime(300))',
                    category: 'utility',
                    examples: [
                        'Search input: debounceTime(300)',
                        'Button click protection: debounceTime(1000)',
                        'Window resize: debounceTime(100)'
                    ]
                },
                'switchMap': {
                    description: 'Maps to an inner observable and cancels previous inner observables',
                    usage: 'source.pipe(switchMap(x => fetch(`/api/${x}`)))',
                    category: 'transformation',
                    examples: [
                        'HTTP requests: switchMap(id => fetch(`/api/${id}`))',
                        'Navigation: switchMap(route => loadComponent(route))',
                        'Search queries: switchMap(term => searchApi(term))'
                    ]
                },
                'combineLatest': {
                    description: 'Combines the latest values from multiple observables',
                    usage: 'combineLatest([obs1, obs2]).pipe(map(([a, b]) => a + b))',
                    category: 'combination',
                    examples: [
                        'Form validation: combineLatest([name$, email$])',
                        'Shopping cart: combineLatest([items$, tax$, shipping$])',
                        'Settings panel: combineLatest([theme$, language$, timezone$])'
                    ]
                }
            },
            patterns: {
                'search': {
                    description: 'Real-time search with debouncing and cancellation',
                    code: `const searchResults$ = searchInput$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => searchAPI(term)),
  catchError(err => of([]))
);`
                },
                'form-validation': {
                    description: 'Reactive form validation with multiple fields',
                    code: `const isValid$ = combineLatest([
  name$.pipe(map(name => name.length > 0)),
  email$.pipe(map(email => /\\S+@\\S+\\.\\S+/.test(email)))
]).pipe(
  map(([nameValid, emailValid]) => nameValid && emailValid)
);`
                },
                'auto-save': {
                    description: 'Auto-save functionality with debouncing',
                    code: `const autoSave$ = formData$.pipe(
  debounceTime(2000),
  distinctUntilChanged(),
  switchMap(data => saveToServer(data)),
  retry(3)
);`
                }
            },
            troubleshooting: {
                'memory-leak': {
                    problem: 'Memory leaks from unsubscribed observables',
                    solution: 'Always unsubscribe in cleanup or use takeUntil pattern',
                    code: `// Bad
this.subscription = observable.subscribe(...);

// Good
observable.pipe(
  takeUntil(this.destroy$)
).subscribe(...);`
                },
                'nested-subscriptions': {
                    problem: 'Nested subscriptions creating callback hell',
                    solution: 'Use flattening operators like switchMap, mergeMap, or concatMap',
                    code: `// Bad
outer$.subscribe(x => {
  inner$.subscribe(y => {
    // nested logic
  });
});

// Good
outer$.pipe(
  switchMap(x => inner$.pipe(map(y => [x, y])))
).subscribe(([x, y]) => {
  // clean logic
});`
                }
            }
        };
    }

    startContextMonitoring() {
        // Monitor playground state for context-aware suggestions
        this.contextMonitor = setInterval(() => {
            this.updateContext();
        }, 1000);
    }

    updateContext() {
        // Gather context from the playground
        const context = {
            currentTab: document.querySelector('.nav-btn.active')?.dataset.tab,
            activeNodes: this.getActiveNodes(),
            recentErrors: this.getRecentErrors(),
            codeContent: this.getCodeContent(),
            performanceIssues: this.detectPerformanceIssues()
        };
        
        this.context.set('current', context);
        
        // Generate contextual suggestions
        if (this.isVisible) {
            this.generateContextualSuggestions(context);
        }
    }

    getActiveNodes() {
        // This would integrate with the visual editor
        return [];
    }

    getRecentErrors() {
        // This would integrate with the debugger
        return [];
    }

    getCodeContent() {
        const jsEditor = document.getElementById('js-editor');
        return jsEditor ? jsEditor.value : '';
    }

    detectPerformanceIssues() {
        // Analyze for common performance issues
        const issues = [];
        const code = this.getCodeContent();
        
        if (code.includes('subscribe') && !code.includes('takeUntil') && !code.includes('unsubscribe')) {
            issues.push({
                type: 'memory-leak',
                severity: 'high',
                message: 'Potential memory leak: Observable subscription without cleanup'
            });
        }
        
        if (code.match(/subscribe\([^)]*subscribe/g)) {
            issues.push({
                type: 'nested-subscriptions',
                severity: 'medium',
                message: 'Nested subscriptions detected - consider using flattening operators'
            });
        }
        
        return issues;
    }

    updateSuggestions() {
        const suggestionsContainer = document.getElementById('ai-suggestions');
        if (!suggestionsContainer) return;
        
        const context = this.context.get('current') || {};
        const suggestions = this.suggestionEngine.generateSuggestions(context);
        
        suggestionsContainer.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion" data-suggestion="${suggestion.id}">
                <span class="suggestion-icon">${suggestion.icon}</span>
                <span class="suggestion-text">${suggestion.text}</span>
            </div>
        `).join('');
    }

    generateContextualSuggestions(context) {
        const suggestions = [];
        
        // Analyze performance issues
        if (context.performanceIssues) {
            context.performanceIssues.forEach(issue => {
                suggestions.push({
                    id: `fix-${issue.type}`,
                    icon: '🔧',
                    text: issue.message,
                    action: () => this.suggestFix(issue)
                });
            });
        }
        
        // Analyze current code
        if (context.codeContent) {
            const codeAnalysis = this.codeAnalyzer.analyze(context.codeContent);
            suggestions.push(...codeAnalysis.suggestions);
        }
        
        // Update suggestions if different from current
        if (JSON.stringify(suggestions) !== JSON.stringify(this.currentSuggestions)) {
            this.currentSuggestions = suggestions;
            this.updateSuggestions();
        }
    }

    async sendMessage() {
        const input = document.getElementById('ai-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Clear input
        input.value = '';
        
        // Add user message to conversation
        this.addMessage('user', message);
        
        // Show thinking indicator
        this.showThinkingIndicator();
        
        try {
            // Process the message
            const response = await this.processMessage(message);
            
            // Add AI response
            this.addMessage('assistant', response.text, response.actions);
            
        } catch (error) {
            this.addMessage('assistant', 'I apologize, but I encountered an error processing your request. Please try again.');
            console.error('AI Assistant error:', error);
        } finally {
            this.hideThinkingIndicator();
        }
    }

    async processMessage(message) {
        // Analyze the message intent
        const intent = this.analyzeIntent(message);
        
        switch (intent.type) {
            case 'operator-question':
                return this.handleOperatorQuestion(intent);
            case 'code-help':
                return this.handleCodeHelp(intent);
            case 'debugging':
                return this.handleDebugging(intent);
            case 'pattern-request':
                return this.handlePatternRequest(intent);
            case 'explanation':
                return this.handleExplanation(intent);
            default:
                return this.handleGeneralQuestion(message);
        }
    }

    analyzeIntent(message) {
        const lowerMessage = message.toLowerCase();
        
        // Operator questions
        if (lowerMessage.includes('operator') || lowerMessage.includes('map') || lowerMessage.includes('filter')) {
            return { type: 'operator-question', query: message };
        }
        
        // Code help
        if (lowerMessage.includes('how to') || lowerMessage.includes('help me')) {
            return { type: 'code-help', query: message };
        }
        
        // Debugging
        if (lowerMessage.includes('error') || lowerMessage.includes('not working') || lowerMessage.includes('debug')) {
            return { type: 'debugging', query: message };
        }
        
        // Pattern requests
        if (lowerMessage.includes('pattern') || lowerMessage.includes('example')) {
            return { type: 'pattern-request', query: message };
        }
        
        // Explanations
        if (lowerMessage.includes('explain') || lowerMessage.includes('what is')) {
            return { type: 'explanation', query: message };
        }
        
        return { type: 'general', query: message };
    }

    handleOperatorQuestion(intent) {
        const message = intent.query.toLowerCase();
        
        // Extract operator name
        const operators = Object.keys(this.knowledgeBase.operators);
        const mentionedOperator = operators.find(op => message.includes(op));
        
        if (mentionedOperator) {
            const operatorInfo = this.knowledgeBase.operators[mentionedOperator];
            return {
                text: `**${mentionedOperator}** is a ${operatorInfo.category} operator that ${operatorInfo.description}.

**Usage:**
\`\`\`javascript
${operatorInfo.usage}
\`\`\`

**Examples:**
${operatorInfo.examples.map(ex => `• ${ex}`).join('\n')}

Would you like me to show you how to use this in your current code?`,
                actions: [
                    { text: 'Apply to Code', action: 'apply-operator', data: mentionedOperator },
                    { text: 'More Examples', action: 'show-examples', data: mentionedOperator }
                ]
            };
        }
        
        return {
            text: `I can help you with RxJS operators! Here are some common ones:

${operators.slice(0, 5).map(op => `**${op}**: ${this.knowledgeBase.operators[op].description}`).join('\n\n')}

Which operator would you like to learn more about?`
        };
    }

    handleCodeHelp(intent) {
        const code = this.getCodeContent();
        const analysis = this.codeAnalyzer.analyze(code);
        
        let response = "I'd be happy to help you with your code! ";
        
        if (analysis.issues.length > 0) {
            response += "I noticed a few things that could be improved:\n\n";
            response += analysis.issues.map(issue => `• **${issue.type}**: ${issue.message}`).join('\n');
            response += "\n\nWould you like me to help fix these issues?";
        } else if (code.trim()) {
            response += "Your code looks good! Here are some suggestions to make it even better:\n\n";
            response += analysis.suggestions.map(s => `• ${s.text}`).join('\n');
        } else {
            response += "I don't see any code in the editor yet. Would you like me to help you get started with a common pattern?";
        }
        
        return {
            text: response,
            actions: [
                { text: 'Fix Issues', action: 'fix-code-issues' },
                { text: 'Show Pattern', action: 'show-pattern' },
                { text: 'Generate Code', action: 'generate-code' }
            ]
        };
    }

    handleDebugging(intent) {
        const context = this.context.get('current') || {};
        
        if (context.recentErrors && context.recentErrors.length > 0) {
            const error = context.recentErrors[0];
            return {
                text: `I see you're having an issue with: **${error.message}**

This is a common problem that usually occurs when ${this.getErrorExplanation(error.type)}.

Here's how to fix it:

\`\`\`javascript
${this.getErrorSolution(error.type)}
\`\`\`

Would you like me to apply this fix to your code?`,
                actions: [
                    { text: 'Apply Fix', action: 'apply-fix', data: error.type },
                    { text: 'Explain More', action: 'explain-error', data: error.type }
                ]
            };
        }
        
        return {
            text: `I'm here to help debug your reactive streams! Common issues include:

• **Memory leaks** - forgetting to unsubscribe
• **Nested subscriptions** - creating callback hell
• **Race conditions** - using the wrong flattening operator
• **Cold vs Hot observables** - understanding emission behavior

What specific problem are you encountering?`
        };
    }

    handlePatternRequest(intent) {
        const patterns = Object.keys(this.knowledgeBase.patterns);
        const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
        const pattern = this.knowledgeBase.patterns[randomPattern];
        
        return {
            text: `Here's a useful reactive pattern: **${randomPattern.replace('-', ' ')}**

${pattern.description}

\`\`\`javascript
${pattern.code}
\`\`\`

This pattern is commonly used for ${this.getPatternUseCase(randomPattern)}.

Would you like to see more patterns or apply this one to your code?`,
            actions: [
                { text: 'Apply Pattern', action: 'apply-pattern', data: randomPattern },
                { text: 'More Patterns', action: 'show-patterns' },
                { text: 'Customize', action: 'customize-pattern', data: randomPattern }
            ]
        };
    }

    handleExplanation(intent) {
        const query = intent.query.toLowerCase();
        
        // Extract key concepts
        if (query.includes('observable')) {
            return {
                text: `**Observables** are the foundation of reactive programming. Think of them as "streams" of data that emit values over time.

Key concepts:
• **Cold Observables**: Start emitting when subscribed to (like HTTP requests)
• **Hot Observables**: Emit regardless of subscribers (like mouse events)
• **Subscription**: Listening to an observable
• **Observer**: The functions that handle next, error, and complete events

\`\`\`javascript
const observable = new Observable(subscriber => {
  subscriber.next('Hello');
  subscriber.next('World');
  subscriber.complete();
});

observable.subscribe({
  next: value => console.log(value),
  complete: () => console.log('Done!')
});
\`\`\`

Would you like me to create an interactive example?`
            };
        }
        
        if (query.includes('subject')) {
            return {
                text: `**Subjects** are special observables that can both emit and receive values. They're like event emitters that multiple observers can subscribe to.

Types of Subjects:
• **Subject**: Basic multicast observable
• **BehaviorSubject**: Stores latest value, emits it to new subscribers
• **ReplaySubject**: Stores multiple values, replays them to new subscribers
• **AsyncSubject**: Only emits the last value when completed

\`\`\`javascript
const subject = new Subject();

// Multiple subscribers
subject.subscribe(x => console.log('A:', x));
subject.subscribe(x => console.log('B:', x));

// Emit to all subscribers
subject.next('Hello');
\`\`\`

Perfect for component communication and state management!`
            };
        }
        
        return {
            text: `I'd be happy to explain reactive programming concepts! Here are some key topics:

• **Observables & Streams** - The foundation of reactive programming
• **Operators** - Functions that transform, filter, and combine streams
• **Subjects** - Multicasting observables for communication
• **Error Handling** - Managing errors in reactive flows
• **Testing** - Unit testing reactive code

What would you like me to explain in detail?`
        };
    }

    handleGeneralQuestion(message) {
        return {
            text: `I'm your reactive programming assistant! I can help you with:

🔧 **RxJS Operators** - Learn how to transform and combine streams
📊 **Stream Patterns** - Common reactive programming patterns
🐛 **Debugging** - Find and fix issues in your reactive code
💡 **Best Practices** - Write better, more maintainable reactive code
🎓 **Learning** - Understand reactive programming concepts

Try asking me things like:
• "How do I debounce user input?"
• "What's the difference between map and switchMap?"
• "Help me fix this memory leak"
• "Show me a search pattern"

What would you like to work on?`,
            actions: [
                { text: 'Show Operators', action: 'list-operators' },
                { text: 'Common Patterns', action: 'show-patterns' },
                { text: 'Debug Code', action: 'debug-code' }
            ]
        };
    }

    addMessage(role, text, actions = []) {
        const messagesContainer = document.getElementById('ai-messages');
        if (!messagesContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `ai-message ${role}`;
        
        const avatar = role === 'assistant' ? '🤖' : '👤';
        const processedText = this.processMessageText(text);
        
        messageElement.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                ${processedText}
                ${actions.length > 0 ? `
                    <div class="message-actions">
                        ${actions.map(action => `
                            <button class="message-action-btn" data-action="${action.action}" data-data="${action.data || ''}">
                                ${action.text}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        messagesContainer.appendChild(messageElement);
        messageElement.scrollIntoView({ behavior: 'smooth' });
        
        // Store in conversation history
        this.conversationHistory.push({ role, text, actions, timestamp: Date.now() });
    }

    processMessageText(text) {
        // Convert markdown-like syntax to HTML
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    showThinkingIndicator() {
        const messagesContainer = document.getElementById('ai-messages');
        if (!messagesContainer) return;
        
        const indicator = document.createElement('div');
        indicator.className = 'ai-loading';
        indicator.id = 'thinking-indicator';
        indicator.textContent = 'Thinking...';
        
        messagesContainer.appendChild(indicator);
        indicator.scrollIntoView({ behavior: 'smooth' });
    }

    hideThinkingIndicator() {
        const indicator = document.getElementById('thinking-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    handleMessageAction(action, messageElement) {
        const data = messageElement.querySelector(`[data-action="${action}"]`)?.dataset.data;
        
        switch (action) {
            case 'apply-operator':
                this.applyOperatorToCode(data);
                break;
            case 'show-examples':
                this.showOperatorExamples(data);
                break;
            case 'apply-fix':
                this.applyCodeFix(data);
                break;
            case 'show-pattern':
                this.showCodePattern();
                break;
            case 'apply-pattern':
                this.applyPattern(data);
                break;
            case 'generate-code':
                this.generateCodeFromDescription();
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    applyOperatorToCode(operatorName) {
        const jsEditor = document.getElementById('js-editor');
        if (!jsEditor || !operatorName) return;
        
        const currentCode = jsEditor.value;
        const operatorInfo = this.knowledgeBase.operators[operatorName];
        
        if (operatorInfo) {
            // Simple code insertion logic
            const suggestion = `\n// ${operatorInfo.description}\n${operatorInfo.usage}\n`;
            jsEditor.value = currentCode + suggestion;
            
            this.addMessage('assistant', `I've added the ${operatorName} operator to your code! The cursor is positioned where you can customize the implementation.`);
        }
    }

    applySuggestion(suggestionId) {
        const suggestion = this.currentSuggestions?.find(s => s.id === suggestionId);
        if (suggestion && suggestion.action) {
            suggestion.action();
        }
        
        this.onSuggestion({ id: suggestionId, suggestion });
    }

    focus() {
        const input = document.getElementById('ai-input');
        if (input) {
            input.focus();
        }
    }

    show() {
        this.isVisible = true;
        this.container.classList.remove('hidden');
        this.focus();
    }

    hide() {
        this.isVisible = false;
        this.container.classList.add('hidden');
    }

    // Helper methods for knowledge base
    getErrorExplanation(errorType) {
        const explanations = {
            'memory-leak': 'observables are subscribed to but never unsubscribed, causing memory to accumulate',
            'nested-subscriptions': 'subscriptions are nested inside other subscriptions, creating hard-to-manage code',
            'race-condition': 'multiple async operations compete and complete in unpredictable order'
        };
        
        return explanations[errorType] || 'an unexpected issue occurred';
    }

    getErrorSolution(errorType) {
        const solutions = this.knowledgeBase.troubleshooting[errorType];
        return solutions ? solutions.code : '// No specific solution available';
    }

    getPatternUseCase(patternName) {
        const useCases = {
            'search': 'implementing real-time search functionality',
            'form-validation': 'validating forms reactively',
            'auto-save': 'automatically saving user input'
        };
        
        return useCases[patternName] || 'common reactive scenarios';
    }
}

// Suggestion Engine for contextual recommendations
class SuggestionEngine {
    generateSuggestions(context) {
        const suggestions = [];
        
        // Performance-based suggestions
        if (context.performanceIssues) {
            context.performanceIssues.forEach(issue => {
                suggestions.push({
                    id: `perf-${issue.type}`,
                    icon: '⚡',
                    text: `Optimize: ${issue.message}`,
                    priority: issue.severity === 'high' ? 1 : 2
                });
            });
        }
        
        // Code-based suggestions
        const code = context.codeContent || '';
        if (code.includes('fromEvent') && !code.includes('debounceTime')) {
            suggestions.push({
                id: 'add-debounce',
                icon: '⏱️',
                text: 'Consider adding debounceTime to reduce rapid events',
                priority: 2
            });
        }
        
        if (code.includes('subscribe') && code.includes('http')) {
            suggestions.push({
                id: 'use-switchmap',
                icon: '🔄',
                text: 'Use switchMap for HTTP requests to handle cancellation',
                priority: 1
            });
        }
        
        // Default suggestions
        if (suggestions.length === 0) {
            suggestions.push(
                {
                    id: 'learn-operators',
                    icon: '📚',
                    text: 'Learn about common RxJS operators',
                    priority: 3
                },
                {
                    id: 'explore-patterns',
                    icon: '🎯',
                    text: 'Explore reactive programming patterns',
                    priority: 3
                }
            );
        }
        
        return suggestions.sort((a, b) => a.priority - b.priority).slice(0, 4);
    }
}

// Code Analyzer for intelligent suggestions
class CodeAnalyzer {
    analyze(code) {
        const issues = [];
        const suggestions = [];
        
        // Check for common anti-patterns
        if (code.includes('.subscribe(') && !code.includes('takeUntil') && !code.includes('unsubscribe')) {
            issues.push({
                type: 'memory-leak',
                severity: 'high',
                message: 'Potential memory leak from unmanaged subscription'
            });
        }
        
        if (code.match(/\.subscribe\([^)]*\.subscribe/)) {
            issues.push({
                type: 'nested-subscriptions',
                severity: 'medium',
                message: 'Nested subscriptions detected - consider flattening operators'
            });
        }
        
        // Generate improvement suggestions
        if (code.includes('fromEvent') && !code.includes('debounceTime')) {
            suggestions.push({
                id: 'add-debounce',
                text: 'Add debounceTime to prevent excessive event handling',
                code: 'pipe(debounceTime(300))'
            });
        }
        
        if (code.includes('map') && code.includes('filter')) {
            suggestions.push({
                id: 'optimize-pipeline',
                text: 'Consider reordering operators for better performance',
                code: 'pipe(filter(...), map(...)) // filter first'
            });
        }
        
        return { issues, suggestions };
    }
}

export { AIAssistant };