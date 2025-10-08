/**
 * Visual Editor Module
 * 
 * This module provides a drag-and-drop node-based interface for composing
 * RxJS streams visually. It includes:
 * 
 * - Node-based stream composition
 * - Real-time data flow visualization
 * - Interactive connection system
 * - Stream execution and debugging
 * - Performance monitoring
 * - Export/import functionality
 */

import { Subject, BehaviorSubject, interval, fromEvent, merge, combineLatest } from 'rxjs';
import { map, filter, scan, debounceTime, throttleTime, distinctUntilChanged, take, switchMap } from 'rxjs/operators';

class VisualEditor {
    constructor(options) {
        this.canvas = options.canvas;
        this.overlay = options.overlay;
        this.onStateChange = options.onStateChange || (() => {});
        
        this.nodes = new Map();
        this.connections = new Map();
        this.selectedNodes = new Set();
        this.isPlaying = false;
        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        this.nodeIdCounter = 0;
        this.connectionIdCounter = 0;
        
        this.dragState = {
            isDragging: false,
            dragType: null, // 'node', 'connection', 'canvas'
            startX: 0,
            startY: 0,
            target: null
        };
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupNodePalette();
        this.startAnimationLoop();
        
        console.log('🎨 Visual Editor initialized');
    }

    setupCanvas() {
        // Set canvas size
        this.resizeCanvas();
        
        // Get 2D context
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = true;
        
        // Setup SVG for connections
        this.setupConnectionSVG();
    }

    setupConnectionSVG() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '1';
        
        // Add arrowhead marker
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');
        
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', '#6366f1');
        
        marker.appendChild(polygon);
        defs.appendChild(marker);
        svg.appendChild(defs);
        
        this.connectionSVG = svg;
        this.canvas.parentElement.appendChild(svg);
    }

    setupEventListeners() {
        // Canvas mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        this.canvas.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    setupNodePalette() {
        const componentItems = document.querySelectorAll('.component-item');
        
        componentItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.type);
                e.dataTransfer.effectAllowed = 'copy';
            });
        });
        
        // Canvas drop handling
        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });
        
        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const nodeType = e.dataTransfer.getData('text/plain');
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - this.panX) / this.scale;
            const y = (e.clientY - rect.top - this.panY) / this.scale;
            
            this.createNode(nodeType, x, y);
        });
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.panX) / this.scale;
        const y = (e.clientY - rect.top - this.panY) / this.scale;
        
        this.dragState.startX = x;
        this.dragState.startY = y;
        
        // Check for node hit
        const hitNode = this.getNodeAt(x, y);
        if (hitNode) {
            this.dragState.isDragging = true;
            this.dragState.dragType = 'node';
            this.dragState.target = hitNode;
            
            // Select node
            if (!e.shiftKey) {
                this.selectedNodes.clear();
            }
            this.selectedNodes.add(hitNode.id);
            
            // Check for connection point
            const connectionPoint = this.getConnectionPointAt(hitNode, x, y);
            if (connectionPoint) {
                this.dragState.dragType = 'connection';
                this.dragState.connectionPoint = connectionPoint;
                this.startConnectionDrag(hitNode, connectionPoint);
            }
        } else {
            // Canvas drag or selection
            this.dragState.isDragging = true;
            this.dragState.dragType = 'canvas';
            
            if (!e.shiftKey) {
                this.selectedNodes.clear();
            }
        }
        
        this.requestRedraw();
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.panX) / this.scale;
        const y = (e.clientY - rect.top - this.panY) / this.scale;
        
        if (this.dragState.isDragging) {
            const deltaX = x - this.dragState.startX;
            const deltaY = y - this.dragState.startY;
            
            switch (this.dragState.dragType) {
                case 'node':
                    this.moveSelectedNodes(deltaX, deltaY);
                    this.dragState.startX = x;
                    this.dragState.startY = y;
                    break;
                    
                case 'canvas':
                    this.panX += deltaX * this.scale;
                    this.panY += deltaY * this.scale;
                    break;
                    
                case 'connection':
                    this.updateConnectionDrag(x, y);
                    break;
            }
            
            this.requestRedraw();
        } else {
            // Update hover state
            this.updateHoverState(x, y);
        }
    }

    handleMouseUp(e) {
        if (this.dragState.dragType === 'connection') {
            this.finishConnectionDrag(e);
        }
        
        this.dragState = {
            isDragging: false,
            dragType: null,
            startX: 0,
            startY: 0,
            target: null
        };
        
        this.requestRedraw();
    }

    handleWheel(e) {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.1, Math.min(3, this.scale * delta));
        
        // Scale around mouse position
        const scaleRatio = newScale / this.scale;
        this.panX = mouseX - (mouseX - this.panX) * scaleRatio;
        this.panY = mouseY - (mouseY - this.panY) * scaleRatio;
        this.scale = newScale;
        
        this.requestRedraw();
    }

    handleContextMenu(e) {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.panX) / this.scale;
        const y = (e.clientY - rect.top - this.panY) / this.scale;
        
        const hitNode = this.getNodeAt(x, y);
        this.showContextMenu(e.clientX, e.clientY, hitNode);
    }

    handleKeyDown(e) {
        if (e.target.closest('.playground-workspace')) {
            switch (e.key) {
                case 'Delete':
                case 'Backspace':
                    this.deleteSelectedNodes();
                    break;
                case 'Escape':
                    this.selectedNodes.clear();
                    this.requestRedraw();
                    break;
                case 'a':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.selectAll();
                    }
                    break;
            }
        }
    }

    createNode(type, x, y) {
        const id = `node_${this.nodeIdCounter++}`;
        const node = {
            id,
            type,
            x,
            y,
            width: 150,
            height: 100,
            inputs: this.getNodeInputs(type),
            outputs: this.getNodeOutputs(type),
            config: this.getDefaultConfig(type),
            stream: null,
            isRunning: false,
            lastValue: null,
            error: null
        };
        
        this.nodes.set(id, node);
        this.setupNodeStream(node);
        
        console.log(`📦 Created ${type} node:`, id);
        this.onStateChange({ type: 'node-created', node });
        this.requestRedraw();
        
        return node;
    }

    getNodeInputs(type) {
        const inputs = {
            'subject': [],
            'behavior-subject': [],
            'interval': [],
            'from-event': [],
            'map': ['source'],
            'filter': ['source'],
            'merge': ['source1', 'source2'],
            'combine-latest': ['source1', 'source2'],
            'html-sink': ['source'],
            'console-sink': ['source']
        };
        
        return inputs[type] || [];
    }

    getNodeOutputs(type) {
        const outputs = {
            'subject': ['stream'],
            'behavior-subject': ['stream'],
            'interval': ['stream'],
            'from-event': ['stream'],
            'map': ['stream'],
            'filter': ['stream'],
            'merge': ['stream'],
            'combine-latest': ['stream'],
            'html-sink': [],
            'console-sink': []
        };
        
        return outputs[type] || [];
    }

    getDefaultConfig(type) {
        const configs = {
            'subject': {},
            'behavior-subject': { initialValue: '0' },
            'interval': { period: '1000' },
            'from-event': { element: 'document', event: 'click' },
            'map': { transform: 'x => x' },
            'filter': { predicate: 'x => true' },
            'merge': {},
            'combine-latest': {},
            'html-sink': { selector: '#output' },
            'console-sink': {}
        };
        
        return configs[type] || {};
    }

    setupNodeStream(node) {
        try {
            switch (node.type) {
                case 'subject':
                    node.stream = new Subject();
                    break;
                    
                case 'behavior-subject':
                    const initialValue = this.parseValue(node.config.initialValue);
                    node.stream = new BehaviorSubject(initialValue);
                    break;
                    
                case 'interval':
                    const period = parseInt(node.config.period) || 1000;
                    node.stream = interval(period);
                    break;
                    
                case 'from-event':
                    const element = node.config.element === 'document' ? document : 
                                  document.querySelector(node.config.element);
                    if (element) {
                        node.stream = fromEvent(element, node.config.event);
                    }
                    break;
                    
                case 'map':
                    // Will be connected when input is available
                    node.transform = this.createTransformFunction(node.config.transform);
                    break;
                    
                case 'filter':
                    node.predicate = this.createPredicateFunction(node.config.predicate);
                    break;
            }
            
            if (node.stream && node.outputs.length > 0) {
                this.subscribeToNode(node);
            }
        } catch (error) {
            console.error(`Error setting up stream for node ${node.id}:`, error);
            node.error = error.message;
        }
    }

    subscribeToNode(node) {
        if (node.subscription) {
            node.subscription.unsubscribe();
        }
        
        node.subscription = node.stream.subscribe({
            next: (value) => {
                node.lastValue = value;
                node.isRunning = true;
                node.error = null;
                this.emitDataParticle(node, value);
                this.requestRedraw();
            },
            error: (error) => {
                node.error = error.message;
                node.isRunning = false;
                console.error(`Node ${node.id} error:`, error);
                this.requestRedraw();
            },
            complete: () => {
                node.isRunning = false;
                this.requestRedraw();
            }
        });
    }

    createTransformFunction(code) {
        try {
            return new Function('x', `return ${code}`);
        } catch (error) {
            console.error('Invalid transform function:', error);
            return x => x;
        }
    }

    createPredicateFunction(code) {
        try {
            return new Function('x', `return ${code}`);
        } catch (error) {
            console.error('Invalid predicate function:', error);
            return () => true;
        }
    }

    parseValue(valueStr) {
        if (valueStr === 'true') return true;
        if (valueStr === 'false') return false;
        if (valueStr === 'null') return null;
        if (valueStr === 'undefined') return undefined;
        
        const num = Number(valueStr);
        if (!isNaN(num)) return num;
        
        try {
            return JSON.parse(valueStr);
        } catch {
            return valueStr;
        }
    }

    connectNodes(outputNode, outputPort, inputNode, inputPort) {
        const connectionId = `conn_${this.connectionIdCounter++}`;
        const connection = {
            id: connectionId,
            from: { node: outputNode.id, port: outputPort },
            to: { node: inputNode.id, port: inputPort }
        };
        
        this.connections.set(connectionId, connection);
        
        // Update streams
        this.updateNodeConnections(inputNode);
        
        console.log(`🔗 Connected ${outputNode.id}:${outputPort} -> ${inputNode.id}:${inputPort}`);
        this.onStateChange({ type: 'connection-created', connection });
        this.requestRedraw();
    }

    updateNodeConnections(node) {
        // Find all input connections for this node
        const inputConnections = Array.from(this.connections.values())
            .filter(conn => conn.to.node === node.id);
        
        if (inputConnections.length === 0) return;
        
        try {
            switch (node.type) {
                case 'map':
                    const sourceConn = inputConnections.find(c => c.to.port === 'source');
                    if (sourceConn) {
                        const sourceNode = this.nodes.get(sourceConn.from.node);
                        if (sourceNode && sourceNode.stream) {
                            node.stream = sourceNode.stream.pipe(
                                map(node.transform || (x => x))
                            );
                            this.subscribeToNode(node);
                        }
                    }
                    break;
                    
                case 'filter':
                    const filterSourceConn = inputConnections.find(c => c.to.port === 'source');
                    if (filterSourceConn) {
                        const sourceNode = this.nodes.get(filterSourceConn.from.node);
                        if (sourceNode && sourceNode.stream) {
                            node.stream = sourceNode.stream.pipe(
                                filter(node.predicate || (() => true))
                            );
                            this.subscribeToNode(node);
                        }
                    }
                    break;
                    
                case 'merge':
                    const mergeInputs = inputConnections
                        .map(conn => this.nodes.get(conn.from.node))
                        .filter(n => n && n.stream)
                        .map(n => n.stream);
                    
                    if (mergeInputs.length > 0) {
                        node.stream = merge(...mergeInputs);
                        this.subscribeToNode(node);
                    }
                    break;
                    
                case 'combine-latest':
                    const combineInputs = inputConnections
                        .map(conn => this.nodes.get(conn.from.node))
                        .filter(n => n && n.stream)
                        .map(n => n.stream);
                    
                    if (combineInputs.length > 1) {
                        node.stream = combineLatest(combineInputs);
                        this.subscribeToNode(node);
                    }
                    break;
                    
                case 'html-sink':
                case 'console-sink':
                    const sinkSourceConn = inputConnections.find(c => c.to.port === 'source');
                    if (sinkSourceConn) {
                        const sourceNode = this.nodes.get(sinkSourceConn.from.node);
                        if (sourceNode && sourceNode.stream) {
                            this.subscribeSink(node, sourceNode.stream);
                        }
                    }
                    break;
            }
        } catch (error) {
            console.error(`Error updating connections for node ${node.id}:`, error);
            node.error = error.message;
        }
    }

    subscribeSink(sinkNode, sourceStream) {
        if (sinkNode.subscription) {
            sinkNode.subscription.unsubscribe();
        }
        
        sinkNode.subscription = sourceStream.subscribe({
            next: (value) => {
                sinkNode.lastValue = value;
                sinkNode.isRunning = true;
                sinkNode.error = null;
                
                if (sinkNode.type === 'console-sink') {
                    console.log(`Console Sink ${sinkNode.id}:`, value);
                    this.logToConsole(value);
                } else if (sinkNode.type === 'html-sink') {
                    const element = document.querySelector(sinkNode.config.selector);
                    if (element) {
                        element.innerHTML = String(value);
                    }
                }
                
                this.requestRedraw();
            },
            error: (error) => {
                sinkNode.error = error.message;
                sinkNode.isRunning = false;
                this.requestRedraw();
            },
            complete: () => {
                sinkNode.isRunning = false;
                this.requestRedraw();
            }
        });
    }

    logToConsole(value) {
        const consoleLog = document.getElementById('console-log');
        if (consoleLog) {
            const timestamp = new Date().toLocaleTimeString();
            const line = `[${timestamp}] ${JSON.stringify(value)}\n`;
            consoleLog.textContent += line;
            consoleLog.scrollTop = consoleLog.scrollHeight;
        }
    }

    // Drawing methods
    draw() {
        const ctx = this.ctx;
        const { width, height } = this.canvas;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Save transform
        ctx.save();
        
        // Apply pan and zoom
        ctx.translate(this.panX, this.panY);
        ctx.scale(this.scale, this.scale);
        
        // Draw grid
        this.drawGrid(ctx);
        
        // Draw connections
        this.drawConnections(ctx);
        
        // Draw nodes
        this.drawNodes(ctx);
        
        // Restore transform
        ctx.restore();
        
        // Draw UI elements (unscaled)
        this.drawUI(ctx);
    }

    drawGrid(ctx) {
        const gridSize = 20;
        const { width, height } = this.canvas;
        
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        
        const startX = Math.floor(-this.panX / this.scale / gridSize) * gridSize;
        const startY = Math.floor(-this.panY / this.scale / gridSize) * gridSize;
        const endX = startX + (width / this.scale) + gridSize;
        const endY = startY + (height / this.scale) + gridSize;
        
        ctx.beginPath();
        for (let x = startX; x < endX; x += gridSize) {
            ctx.moveTo(x, startY);
            ctx.lineTo(x, endY);
        }
        for (let y = startY; y < endY; y += gridSize) {
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
        }
        ctx.stroke();
        
        ctx.globalAlpha = 1;
    }

    drawNodes(ctx) {
        for (const node of this.nodes.values()) {
            this.drawNode(ctx, node);
        }
    }

    drawNode(ctx, node) {
        const { x, y, width, height, type, isRunning, error } = node;
        const isSelected = this.selectedNodes.has(node.id);
        
        // Node background
        ctx.fillStyle = error ? '#fef2f2' : (isRunning ? '#f0fdf4' : '#ffffff');
        ctx.strokeStyle = error ? '#ef4444' : (isSelected ? '#6366f1' : '#e2e8f0');
        ctx.lineWidth = isSelected ? 3 : 2;
        
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
        
        // Header
        const headerHeight = 30;
        ctx.fillStyle = this.getNodeTypeColor(type);
        ctx.globalAlpha = 0.1;
        ctx.fillRect(x, y, width, headerHeight);
        ctx.globalAlpha = 1;
        
        // Title
        ctx.fillStyle = '#1e293b';
        ctx.font = '14px Inter, sans-serif';
        ctx.fontWeight = '600';
        const title = this.getNodeTitle(type);
        const titleMetrics = ctx.measureText(title);
        ctx.fillText(title, x + 12, y + 20);
        
        // Icon
        const icon = this.getNodeIcon(type);
        ctx.font = '16px Inter, sans-serif';
        ctx.fillText(icon, x + width - 25, y + 20);
        
        // Status indicator
        if (isRunning) {
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(x + width - 8, y + 8, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (error) {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(x + width - 8, y + 8, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Last value
        if (node.lastValue !== null) {
            ctx.fillStyle = '#64748b';
            ctx.font = '12px JetBrains Mono, monospace';
            const valueStr = this.formatValue(node.lastValue);
            ctx.fillText(valueStr, x + 12, y + height - 12);
        }
        
        // Connection points
        this.drawConnectionPoints(ctx, node);
    }

    drawConnectionPoints(ctx, node) {
        const { x, y, width, height, inputs, outputs } = node;
        const pointRadius = 6;
        
        // Input points
        inputs.forEach((input, index) => {
            const pointY = y + 40 + (index * 20);
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.arc(x, pointY, pointRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Label
            ctx.fillStyle = '#64748b';
            ctx.font = '10px Inter, sans-serif';
            ctx.fillText(input, x + 12, pointY + 3);
        });
        
        // Output points
        outputs.forEach((output, index) => {
            const pointY = y + 40 + (index * 20);
            ctx.fillStyle = '#6366f1';
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.arc(x + width, pointY, pointRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Label
            ctx.fillStyle = '#64748b';
            ctx.font = '10px Inter, sans-serif';
            const labelWidth = ctx.measureText(output).width;
            ctx.fillText(output, x + width - labelWidth - 12, pointY + 3);
        });
    }

    drawConnections(ctx) {
        // Clear SVG
        this.connectionSVG.innerHTML = this.connectionSVG.querySelector('defs').outerHTML;
        
        for (const connection of this.connections.values()) {
            this.drawConnection(connection);
        }
    }

    drawConnection(connection) {
        const fromNode = this.nodes.get(connection.from.node);
        const toNode = this.nodes.get(connection.to.node);
        
        if (!fromNode || !toNode) return;
        
        const fromPoint = this.getNodeConnectionPoint(fromNode, connection.from.port, 'output');
        const toPoint = this.getNodeConnectionPoint(toNode, connection.to.port, 'input');
        
        if (!fromPoint || !toPoint) return;
        
        // Create SVG path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        const dx = toPoint.x - fromPoint.x;
        const controlOffset = Math.max(50, Math.abs(dx) * 0.5);
        
        const pathData = `M ${fromPoint.x} ${fromPoint.y} C ${fromPoint.x + controlOffset} ${fromPoint.y}, ${toPoint.x - controlOffset} ${toPoint.y}, ${toPoint.x} ${toPoint.y}`;
        
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', '#6366f1');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('marker-end', 'url(#arrowhead)');
        path.classList.add('connection-line');
        
        if (fromNode.isRunning) {
            path.classList.add('active');
        }
        
        this.connectionSVG.appendChild(path);
    }

    getNodeConnectionPoint(node, port, type) {
        const { x, y, inputs, outputs } = node;
        
        if (type === 'input') {
            const index = inputs.indexOf(port);
            if (index !== -1) {
                return {
                    x: (x) * this.scale + this.panX,
                    y: (y + 40 + index * 20) * this.scale + this.panY
                };
            }
        } else if (type === 'output') {
            const index = outputs.indexOf(port);
            if (index !== -1) {
                return {
                    x: (x + node.width) * this.scale + this.panX,
                    y: (y + 40 + index * 20) * this.scale + this.panY
                };
            }
        }
        
        return null;
    }

    // Utility methods
    getNodeTitle(type) {
        const titles = {
            'subject': 'Subject',
            'behavior-subject': 'BehaviorSubject',
            'interval': 'Interval',
            'from-event': 'FromEvent',
            'map': 'Map',
            'filter': 'Filter',
            'merge': 'Merge',
            'combine-latest': 'CombineLatest',
            'html-sink': 'HTML Sink',
            'console-sink': 'Console'
        };
        
        return titles[type] || type;
    }

    getNodeIcon(type) {
        const icons = {
            'subject': '📡',
            'behavior-subject': '🎯',
            'interval': '⏰',
            'from-event': '🖱️',
            'map': '🔄',
            'filter': '🔍',
            'merge': '🔀',
            'combine-latest': '🤝',
            'html-sink': '📄',
            'console-sink': '📝'
        };
        
        return icons[type] || '⚙️';
    }

    getNodeTypeColor(type) {
        const colors = {
            'subject': '#10b981',
            'behavior-subject': '#10b981',
            'interval': '#10b981',
            'from-event': '#10b981',
            'map': '#6366f1',
            'filter': '#6366f1',
            'merge': '#6366f1',
            'combine-latest': '#6366f1',
            'html-sink': '#f59e0b',
            'console-sink': '#f59e0b'
        };
        
        return colors[type] || '#6366f1';
    }

    formatValue(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'string') return `"${value}"`;
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    }

    getNodeAt(x, y) {
        for (const node of this.nodes.values()) {
            if (x >= node.x && x <= node.x + node.width &&
                y >= node.y && y <= node.y + node.height) {
                return node;
            }
        }
        return null;
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.requestRedraw();
    }

    requestRedraw() {
        if (!this.redrawRequested) {
            this.redrawRequested = true;
            requestAnimationFrame(() => {
                this.draw();
                this.redrawRequested = false;
            });
        }
    }

    startAnimationLoop() {
        const animate = () => {
            this.updateAnimations();
            requestAnimationFrame(animate);
        };
        animate();
    }

    updateAnimations() {
        // Update data particles and other animations
        // This would be expanded with actual particle system
    }

    emitDataParticle(node, value) {
        // Create visual data flow particle
        // This would create animated particles flowing along connections
        console.log(`💫 Data particle from ${node.id}:`, value);
    }

    // Public API methods
    play() {
        this.isPlaying = true;
        console.log('▶️ Visual Editor: Play');
    }

    pause() {
        this.isPlaying = false;
        console.log('⏸️ Visual Editor: Pause');
    }

    step() {
        console.log('⏭️ Visual Editor: Step');
    }

    reset() {
        // Reset all streams
        for (const node of this.nodes.values()) {
            if (node.subscription) {
                node.subscription.unsubscribe();
            }
            node.lastValue = null;
            node.isRunning = false;
            node.error = null;
        }
        
        this.requestRedraw();
        console.log('🔄 Visual Editor: Reset');
    }

    clear() {
        // Clear everything
        for (const node of this.nodes.values()) {
            if (node.subscription) {
                node.subscription.unsubscribe();
            }
        }
        
        this.nodes.clear();
        this.connections.clear();
        this.selectedNodes.clear();
        this.connectionSVG.innerHTML = this.connectionSVG.querySelector('defs').outerHTML;
        
        this.requestRedraw();
        console.log('🗑️ Visual Editor: Clear');
    }

    setActive(active) {
        if (active) {
            this.resizeCanvas();
        }
    }

    handleResize() {
        this.resizeCanvas();
    }

    exportState() {
        return {
            nodes: Array.from(this.nodes.entries()),
            connections: Array.from(this.connections.entries()),
            scale: this.scale,
            panX: this.panX,
            panY: this.panY
        };
    }

    // Placeholder methods for functionality to be implemented
    moveSelectedNodes(deltaX, deltaY) {
        for (const nodeId of this.selectedNodes) {
            const node = this.nodes.get(nodeId);
            if (node) {
                node.x += deltaX;
                node.y += deltaY;
            }
        }
    }

    updateHoverState(x, y) {
        // Update hover effects
    }

    startConnectionDrag(node, connectionPoint) {
        // Start connection dragging
    }

    updateConnectionDrag(x, y) {
        // Update connection drag
    }

    finishConnectionDrag(e) {
        // Finish connection drag
    }

    getConnectionPointAt(node, x, y) {
        // Get connection point at coordinates
        return null;
    }

    showContextMenu(x, y, node) {
        // Show context menu
    }

    deleteSelectedNodes() {
        for (const nodeId of this.selectedNodes) {
            const node = this.nodes.get(nodeId);
            if (node && node.subscription) {
                node.subscription.unsubscribe();
            }
            this.nodes.delete(nodeId);
        }
        this.selectedNodes.clear();
        this.requestRedraw();
    }

    selectAll() {
        this.selectedNodes.clear();
        for (const nodeId of this.nodes.keys()) {
            this.selectedNodes.add(nodeId);
        }
        this.requestRedraw();
    }

    isPlaying() {
        return this.isPlaying;
    }
}

export { VisualEditor };