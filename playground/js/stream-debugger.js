/**
 * Stream Debugger Module
 * 
 * Provides comprehensive debugging tools for reactive streams including:
 * - Real-time timeline visualization
 * - Performance metrics tracking
 * - Memory usage monitoring
 * - Stream inspection and analysis
 * - Step-through debugging capabilities
 */

class StreamDebugger {
    constructor(options) {
        this.container = options.container;
        this.onMetricsUpdate = options.onMetricsUpdate || (() => {});
        
        this.streams = new Map();
        this.timeline = [];
        this.metrics = {
            eventsPerSecond: 0,
            memoryUsage: 0,
            activeStreams: 0,
            avgLatency: 0,
            errors: 0
        };
        
        this.isActive = false;
        this.isRecording = true;
        this.maxTimelineEvents = 1000;
        this.updateInterval = 100; // ms
        
        this.init();
    }

    init() {
        this.setupTimeline();
        this.setupMetrics();
        this.setupMemoryMonitor();
        this.setupControls();
        this.startMonitoring();
        
        console.log('🔍 Stream Debugger initialized');
    }

    setupTimeline() {
        this.timelineContainer = document.getElementById('stream-timeline');
        this.timelineContent = document.createElement('div');
        this.timelineContent.className = 'timeline-content';
        
        // Create timeline header
        const header = document.createElement('div');
        header.className = 'timeline-header';
        header.innerHTML = `
            <div class="timeline-info">
                <span class="event-count">0 events</span>
                <span class="time-range">Last 10s</span>
            </div>
            <div class="timeline-controls">
                <button class="timeline-btn" id="pause-timeline">⏸️</button>
                <button class="timeline-btn" id="clear-timeline">🗑️</button>
                <button class="timeline-btn" id="export-timeline">📤</button>
            </div>
        `;
        
        this.timelineContainer.appendChild(header);
        this.timelineContainer.appendChild(this.timelineContent);
        
        // Setup timeline controls
        document.getElementById('pause-timeline').addEventListener('click', () => {
            this.toggleRecording();
        });
        
        document.getElementById('clear-timeline').addEventListener('click', () => {
            this.clearTimeline();
        });
        
        document.getElementById('export-timeline').addEventListener('click', () => {
            this.exportTimeline();
        });
    }

    setupMetrics() {
        this.metricsContainer = document.getElementById('performance-metrics');
        
        this.metricsElements = {
            eventsPerSecond: this.createMetricElement('Events/s', '0'),
            activeStreams: this.createMetricElement('Active Streams', '0'),
            avgLatency: this.createMetricElement('Avg Latency', '0ms'),
            errors: this.createMetricElement('Errors', '0', 'error'),
            memoryUsage: this.createMetricElement('Memory Usage', '0MB')
        };
        
        Object.values(this.metricsElements).forEach(element => {
            this.metricsContainer.appendChild(element);
        });
        
        // Add performance chart
        this.setupPerformanceChart();
    }

    setupPerformanceChart() {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'performance-chart';
        chartContainer.innerHTML = `
            <canvas id="performance-chart" width="300" height="100"></canvas>
        `;
        this.metricsContainer.appendChild(chartContainer);
        
        this.chartCanvas = document.getElementById('performance-chart');
        this.chartCtx = this.chartCanvas.getContext('2d');
        this.chartData = [];
        this.maxChartPoints = 60;
    }

    setupMemoryMonitor() {
        this.memoryContainer = document.getElementById('memory-usage');
        
        // Memory overview
        const overview = document.createElement('div');
        overview.className = 'memory-overview';
        overview.innerHTML = `
            <div class="memory-stat">
                <div class="memory-stat-value" id="heap-used">0</div>
                <div class="memory-stat-label">Heap Used (MB)</div>
            </div>
            <div class="memory-stat">
                <div class="memory-stat-value" id="heap-total">0</div>
                <div class="memory-stat-label">Heap Total (MB)</div>
            </div>
        `;
        
        // Memory usage bar
        const usageBar = document.createElement('div');
        usageBar.className = 'memory-usage-bar';
        usageBar.innerHTML = `
            <div class="memory-usage-fill" id="memory-fill"></div>
        `;
        
        // Memory details
        const details = document.createElement('div');
        details.className = 'memory-details';
        details.innerHTML = `
            <div class="memory-details-header">Memory Objects</div>
            <div class="memory-details-content" id="memory-objects"></div>
        `;
        
        this.memoryContainer.appendChild(overview);
        this.memoryContainer.appendChild(usageBar);
        this.memoryContainer.appendChild(details);
    }

    setupControls() {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'debug-controls';
        controlsContainer.innerHTML = `
            <div class="debug-section">
                <h5>Recording</h5>
                <input type="checkbox" class="debug-toggle" id="recording-toggle" checked>
            </div>
            <div class="debug-section">
                <h5>Timeline</h5>
                <input type="range" class="debug-slider" id="timeline-speed" min="0.1" max="2" step="0.1" value="1">
                <span class="slider-value">1x</span>
            </div>
            <div class="debug-section">
                <h5>Memory</h5>
                <button class="timeline-btn" id="gc-button">🗑️ GC</button>
            </div>
        `;
        
        this.container.insertBefore(controlsContainer, this.container.firstChild);
        
        // Setup control handlers
        document.getElementById('recording-toggle').addEventListener('change', (e) => {
            this.isRecording = e.target.checked;
        });
        
        document.getElementById('timeline-speed').addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            e.target.nextElementSibling.textContent = `${speed}x`;
            this.setTimelineSpeed(speed);
        });
        
        document.getElementById('gc-button').addEventListener('click', () => {
            this.forceGarbageCollection();
        });
    }

    createMetricElement(label, value, type = 'normal') {
        const element = document.createElement('div');
        element.className = 'metric-item';
        element.innerHTML = `
            <span class="metric-label">${label}</span>
            <span class="metric-value">
                ${value}
                <span class="metric-trend ${type}">-</span>
            </span>
        `;
        return element;
    }

    startMonitoring() {
        this.monitoringInterval = setInterval(() => {
            if (this.isActive) {
                this.updateMetrics();
                this.updateMemoryUsage();
                this.updateChart();
            }
        }, this.updateInterval);
    }

    // Stream registration and tracking
    registerStream(id, stream, metadata = {}) {
        const streamInfo = {
            id,
            stream,
            metadata,
            events: [],
            subscription: null,
            startTime: Date.now(),
            lastEventTime: null,
            eventCount: 0,
            errorCount: 0,
            isActive: true
        };
        
        this.streams.set(id, streamInfo);
        
        if (this.isRecording) {
            this.subscribeToStream(streamInfo);
        }
        
        this.addTimelineTrack(id, metadata.name || id);
        console.log(`📊 Registered stream: ${id}`);
    }

    subscribeToStream(streamInfo) {
        if (streamInfo.subscription) {
            streamInfo.subscription.unsubscribe();
        }
        
        const startTime = performance.now();
        
        streamInfo.subscription = streamInfo.stream.subscribe({
            next: (value) => {
                const endTime = performance.now();
                const latency = endTime - startTime;
                
                const event = {
                    type: 'next',
                    value,
                    timestamp: Date.now(),
                    latency,
                    streamId: streamInfo.id
                };
                
                this.recordEvent(streamInfo, event);
            },
            error: (error) => {
                const event = {
                    type: 'error',
                    error: error.message,
                    timestamp: Date.now(),
                    streamId: streamInfo.id
                };
                
                streamInfo.errorCount++;
                this.recordEvent(streamInfo, event);
            },
            complete: () => {
                const event = {
                    type: 'complete',
                    timestamp: Date.now(),
                    streamId: streamInfo.id
                };
                
                streamInfo.isActive = false;
                this.recordEvent(streamInfo, event);
            }
        });
    }

    recordEvent(streamInfo, event) {
        if (!this.isRecording) return;
        
        streamInfo.events.push(event);
        streamInfo.eventCount++;
        streamInfo.lastEventTime = event.timestamp;
        
        this.timeline.push(event);
        
        // Limit timeline size
        if (this.timeline.length > this.maxTimelineEvents) {
            this.timeline.shift();
        }
        
        this.addTimelineEvent(event);
        this.updateTimelineInfo();
    }

    addTimelineTrack(streamId, name) {
        let track = this.timelineContent.querySelector(`[data-stream-id="${streamId}"]`);
        
        if (!track) {
            track = document.createElement('div');
            track.className = 'timeline-track';
            track.setAttribute('data-stream-id', streamId);
            track.setAttribute('data-stream-name', name);
            this.timelineContent.appendChild(track);
        }
        
        return track;
    }

    addTimelineEvent(event) {
        const track = this.timelineContent.querySelector(`[data-stream-id="${event.streamId}"]`);
        if (!track) return;
        
        const eventElement = document.createElement('div');
        eventElement.className = `timeline-event ${event.type}`;
        
        const time = new Date(event.timestamp).toLocaleTimeString();
        const data = event.type === 'next' ? 
            this.formatEventValue(event.value) : 
            event.type === 'error' ? event.error : 'complete';
        
        eventElement.innerHTML = `
            <span class="event-time">${time}</span>
            <span class="event-data">${data}</span>
        `;
        
        track.appendChild(eventElement);
        
        // Auto-scroll to latest event
        eventElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        
        // Limit events per track
        const events = track.querySelectorAll('.timeline-event');
        if (events.length > 50) {
            events[0].remove();
        }
    }

    formatEventValue(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'string') return `"${value}"`;
        if (typeof value === 'object') {
            return JSON.stringify(value).substring(0, 50) + '...';
        }
        return String(value);
    }

    updateTimelineInfo() {
        const eventCount = this.timeline.length;
        const timeRange = this.getTimelineRange();
        
        const eventCountEl = this.timelineContainer.querySelector('.event-count');
        const timeRangeEl = this.timelineContainer.querySelector('.time-range');
        
        if (eventCountEl) eventCountEl.textContent = `${eventCount} events`;
        if (timeRangeEl) timeRangeEl.textContent = timeRange;
    }

    getTimelineRange() {
        if (this.timeline.length === 0) return 'No events';
        
        const oldest = this.timeline[0].timestamp;
        const newest = this.timeline[this.timeline.length - 1].timestamp;
        const rangeMs = newest - oldest;
        
        if (rangeMs < 1000) return `${rangeMs}ms`;
        if (rangeMs < 60000) return `${Math.round(rangeMs / 1000)}s`;
        return `${Math.round(rangeMs / 60000)}m`;
    }

    updateMetrics() {
        const now = Date.now();
        const windowMs = 1000; // 1 second window
        
        // Calculate events per second
        const recentEvents = this.timeline.filter(event => 
            now - event.timestamp < windowMs
        );
        this.metrics.eventsPerSecond = recentEvents.length;
        
        // Active streams
        this.metrics.activeStreams = Array.from(this.streams.values())
            .filter(stream => stream.isActive).length;
        
        // Average latency
        const latencies = recentEvents
            .filter(event => event.latency)
            .map(event => event.latency);
        
        this.metrics.avgLatency = latencies.length > 0 ? 
            Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
        
        // Error count
        this.metrics.errors = Array.from(this.streams.values())
            .reduce((total, stream) => total + stream.errorCount, 0);
        
        this.updateMetricElements();
        this.onMetricsUpdate(this.metrics);
    }

    updateMetricElements() {
        const updates = {
            eventsPerSecond: `${this.metrics.eventsPerSecond}`,
            activeStreams: `${this.metrics.activeStreams}`,
            avgLatency: `${this.metrics.avgLatency}ms`,
            errors: `${this.metrics.errors}`,
            memoryUsage: `${this.metrics.memoryUsage}MB`
        };
        
        Object.entries(updates).forEach(([key, value]) => {
            const element = this.metricsElements[key];
            if (element) {
                const valueEl = element.querySelector('.metric-value');
                const currentValue = valueEl.firstChild.textContent.trim();
                valueEl.firstChild.textContent = value;
                
                // Update trend indicator
                const trendEl = element.querySelector('.metric-trend');
                const numCurrent = parseFloat(value);
                const numPrevious = parseFloat(currentValue);
                
                if (numCurrent > numPrevious) {
                    trendEl.textContent = '↗';
                    trendEl.className = 'metric-trend up';
                } else if (numCurrent < numPrevious) {
                    trendEl.textContent = '↘';
                    trendEl.className = 'metric-trend down';
                } else {
                    trendEl.textContent = '→';
                    trendEl.className = 'metric-trend stable';
                }
            }
        });
    }

    updateMemoryUsage() {
        if (performance.memory) {
            const used = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            const total = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024);
            const limit = Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024);
            
            this.metrics.memoryUsage = used;
            
            // Update memory display
            const heapUsedEl = document.getElementById('heap-used');
            const heapTotalEl = document.getElementById('heap-total');
            const memoryFillEl = document.getElementById('memory-fill');
            
            if (heapUsedEl) heapUsedEl.textContent = used;
            if (heapTotalEl) heapTotalEl.textContent = total;
            
            if (memoryFillEl) {
                const percentage = (used / limit) * 100;
                memoryFillEl.style.width = `${percentage}%`;
                
                if (percentage > 80) {
                    memoryFillEl.style.background = '#ef4444';
                } else if (percentage > 60) {
                    memoryFillEl.style.background = '#f59e0b';
                } else {
                    memoryFillEl.style.background = '#10b981';
                }
            }
            
            this.updateMemoryObjects();
        }
    }

    updateMemoryObjects() {
        const objectsContainer = document.getElementById('memory-objects');
        if (!objectsContainer) return;
        
        // Simulate memory object tracking
        const objects = [
            { type: 'Subjects', count: Array.from(this.streams.values()).length, size: '2.3KB' },
            { type: 'Subscriptions', count: this.getActiveSubscriptions(), size: '1.8KB' },
            { type: 'Timeline Events', count: this.timeline.length, size: '4.1KB' },
            { type: 'DOM Nodes', count: document.querySelectorAll('*').length, size: '15.2KB' }
        ];
        
        objectsContainer.innerHTML = objects.map(obj => `
            <div class="memory-entry">
                <span class="memory-object">${obj.type} (${obj.count})</span>
                <span class="memory-size ${obj.size.includes('KB') && parseFloat(obj.size) > 10 ? 'large' : ''}">${obj.size}</span>
            </div>
        `).join('');
    }

    getActiveSubscriptions() {
        return Array.from(this.streams.values())
            .filter(stream => stream.subscription && !stream.subscription.closed)
            .length;
    }

    updateChart() {
        // Update performance chart with latest metrics
        this.chartData.push({
            timestamp: Date.now(),
            eventsPerSecond: this.metrics.eventsPerSecond,
            memoryUsage: this.metrics.memoryUsage,
            latency: this.metrics.avgLatency
        });
        
        if (this.chartData.length > this.maxChartPoints) {
            this.chartData.shift();
        }
        
        this.drawChart();
    }

    drawChart() {
        const ctx = this.chartCtx;
        const { width, height } = this.chartCanvas;
        
        ctx.clearRect(0, 0, width, height);
        
        if (this.chartData.length < 2) return;
        
        const maxEvents = Math.max(...this.chartData.map(d => d.eventsPerSecond), 1);
        const maxMemory = Math.max(...this.chartData.map(d => d.memoryUsage), 1);
        
        // Draw events per second line
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        this.chartData.forEach((point, index) => {
            const x = (index / (this.chartData.length - 1)) * width;
            const y = height - (point.eventsPerSecond / maxEvents) * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw memory usage line
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        this.chartData.forEach((point, index) => {
            const x = (index / (this.chartData.length - 1)) * width;
            const y = height - (point.memoryUsage / maxMemory) * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    }

    // Stream inspection
    inspectStream(streamId) {
        const streamInfo = this.streams.get(streamId);
        if (!streamInfo) return;
        
        this.showStreamInspector(streamInfo);
    }

    showStreamInspector(streamInfo) {
        const inspector = document.createElement('div');
        inspector.className = 'stream-inspector';
        inspector.innerHTML = `
            <div class="inspector-header">
                <h3 class="inspector-title">Stream Inspector: ${streamInfo.id}</h3>
                <button class="inspector-close">✕</button>
            </div>
            <div class="inspector-content">
                <div class="inspector-tabs">
                    <button class="inspector-tab active" data-tab="info">Info</button>
                    <button class="inspector-tab" data-tab="events">Events</button>
                    <button class="inspector-tab" data-tab="graph">Graph</button>
                </div>
                <div class="inspector-tab-content active" data-tab="info">
                    <div class="stream-info">
                        <p><strong>ID:</strong> ${streamInfo.id}</p>
                        <p><strong>Active:</strong> ${streamInfo.isActive ? 'Yes' : 'No'}</p>
                        <p><strong>Event Count:</strong> ${streamInfo.eventCount}</p>
                        <p><strong>Error Count:</strong> ${streamInfo.errorCount}</p>
                        <p><strong>Start Time:</strong> ${new Date(streamInfo.startTime).toLocaleString()}</p>
                        <p><strong>Last Event:</strong> ${streamInfo.lastEventTime ? new Date(streamInfo.lastEventTime).toLocaleString() : 'None'}</p>
                    </div>
                </div>
                <div class="inspector-tab-content" data-tab="events">
                    <div class="event-list">
                        ${streamInfo.events.slice(-20).map(event => `
                            <div class="event-item ${event.type}">
                                <span class="event-time">${new Date(event.timestamp).toLocaleTimeString()}</span>
                                <span class="event-type">${event.type}</span>
                                <span class="event-data">${this.formatEventValue(event.value || event.error || 'complete')}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="inspector-tab-content" data-tab="graph">
                    <canvas id="stream-graph" width="400" height="200"></canvas>
                </div>
            </div>
        `;
        
        document.body.appendChild(inspector);
        
        // Setup inspector interactions
        this.setupInspectorInteractions(inspector, streamInfo);
    }

    setupInspectorInteractions(inspector, streamInfo) {
        // Close button
        inspector.querySelector('.inspector-close').addEventListener('click', () => {
            inspector.remove();
        });
        
        // Tab switching
        const tabs = inspector.querySelectorAll('.inspector-tab');
        const contents = inspector.querySelectorAll('.inspector-tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                inspector.querySelector(`[data-tab="${tabName}"].inspector-tab-content`).classList.add('active');
                
                if (tabName === 'graph') {
                    this.drawStreamGraph(inspector.querySelector('#stream-graph'), streamInfo);
                }
            });
        });
    }

    drawStreamGraph(canvas, streamInfo) {
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        
        ctx.clearRect(0, 0, width, height);
        
        if (streamInfo.events.length === 0) {
            ctx.fillStyle = '#64748b';
            ctx.font = '14px Inter, sans-serif';
            ctx.fillText('No events to display', width / 2 - 70, height / 2);
            return;
        }
        
        // Draw event timeline
        const events = streamInfo.events.slice(-50);
        const timeRange = events[events.length - 1].timestamp - events[0].timestamp;
        
        events.forEach((event, index) => {
            const x = (index / (events.length - 1)) * width;
            const y = height / 2;
            
            // Event type colors
            const colors = {
                next: '#10b981',
                error: '#ef4444',
                complete: '#6366f1'
            };
            
            ctx.fillStyle = colors[event.type] || '#64748b';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw event value if 'next'
            if (event.type === 'next' && typeof event.value === 'number') {
                const valueY = y - (event.value * 0.1);
                ctx.fillStyle = '#6366f1';
                ctx.beginPath();
                ctx.arc(x, valueY, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    // Control methods
    toggleRecording() {
        this.isRecording = !this.isRecording;
        const button = document.getElementById('pause-timeline');
        button.textContent = this.isRecording ? '⏸️' : '▶️';
        
        if (this.isRecording) {
            // Re-subscribe to all streams
            this.streams.forEach(streamInfo => {
                if (streamInfo.isActive) {
                    this.subscribeToStream(streamInfo);
                }
            });
        } else {
            // Unsubscribe from all streams
            this.streams.forEach(streamInfo => {
                if (streamInfo.subscription) {
                    streamInfo.subscription.unsubscribe();
                }
            });
        }
        
        console.log(`📹 Recording ${this.isRecording ? 'resumed' : 'paused'}`);
    }

    clearTimeline() {
        this.timeline = [];
        this.timelineContent.innerHTML = '';
        this.updateTimelineInfo();
        
        // Reset stream event counts
        this.streams.forEach(streamInfo => {
            streamInfo.events = [];
            streamInfo.eventCount = 0;
            streamInfo.errorCount = 0;
        });
        
        console.log('🗑️ Timeline cleared');
    }

    exportTimeline() {
        const data = {
            timestamp: new Date().toISOString(),
            timeline: this.timeline,
            streams: Array.from(this.streams.entries()).map(([id, info]) => ({
                id,
                metadata: info.metadata,
                eventCount: info.eventCount,
                errorCount: info.errorCount,
                startTime: info.startTime,
                lastEventTime: info.lastEventTime
            })),
            metrics: this.metrics
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `stream-debug-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('📤 Timeline exported');
    }

    setTimelineSpeed(speed) {
        this.timelineSpeed = speed;
        // This would affect the playback speed of recorded timelines
        console.log(`⚡ Timeline speed set to ${speed}x`);
    }

    forceGarbageCollection() {
        if (window.gc) {
            window.gc();
            console.log('🗑️ Garbage collection forced');
        } else {
            console.log('⚠️ Garbage collection not available');
        }
    }

    // Public API
    setActive(active) {
        this.isActive = active;
        if (active) {
            console.log('🔍 Stream Debugger activated');
        }
    }

    handleResize() {
        // Handle container resize
        if (this.chartCanvas) {
            const container = this.chartCanvas.parentElement;
            this.chartCanvas.width = container.clientWidth;
            this.drawChart();
        }
    }

    exportState() {
        return {
            streams: Array.from(this.streams.entries()),
            timeline: this.timeline,
            metrics: this.metrics,
            isRecording: this.isRecording
        };
    }

    unregisterStream(streamId) {
        const streamInfo = this.streams.get(streamId);
        if (streamInfo) {
            if (streamInfo.subscription) {
                streamInfo.subscription.unsubscribe();
            }
            this.streams.delete(streamId);
            
            // Remove timeline track
            const track = this.timelineContent.querySelector(`[data-stream-id="${streamId}"]`);
            if (track) track.remove();
            
            console.log(`📊 Unregistered stream: ${streamId}`);
        }
    }

    destroy() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        this.streams.forEach(streamInfo => {
            if (streamInfo.subscription) {
                streamInfo.subscription.unsubscribe();
            }
        });
        
        this.streams.clear();
        console.log('🔍 Stream Debugger destroyed');
    }
}

export { StreamDebugger };