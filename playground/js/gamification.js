/**
 * Gamification Module
 * 
 * Provides interactive learning experiences including:
 * - Progressive skill challenges and tutorials
 * - Achievement system with unlockable content
 * - Leaderboards and community competitions
 * - Skill tracking and learning path recommendations
 * - Interactive coding exercises with instant feedback
 */

class Gamification {
    constructor(options) {
        this.container = options.container;
        this.onProgressUpdate = options.onProgressUpdate || (() => {});
        this.onAchievementUnlocked = options.onAchievementUnlocked || (() => {});
        
        this.currentLevel = 1;
        this.experience = 0;
        this.achievements = new Set();
        this.completedChallenges = new Set();
        this.streak = 0;
        this.lastActiveDate = null;
        
        this.challenges = new Map();
        this.tutorialProgress = new Map();
        this.skillPoints = new Map();
        
        this.init();
    }

    init() {
        this.loadUserProgress();
        this.setupChallenges();
        this.setupAchievements();
        this.setupUI();
        this.startDailyChallenge();
        
        console.log('🎮 Gamification module initialized');
    }

    loadUserProgress() {
        const saved = localStorage.getItem('rimmel_gamification');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.currentLevel = data.level || 1;
                this.experience = data.experience || 0;
                this.achievements = new Set(data.achievements || []);
                this.completedChallenges = new Set(data.completedChallenges || []);
                this.streak = data.streak || 0;
                this.lastActiveDate = data.lastActiveDate;
                this.skillPoints = new Map(data.skillPoints || []);
            } catch (error) {
                console.error('Failed to load gamification progress:', error);
            }
        }
        
        this.updateDailyStreak();
    }

    saveUserProgress() {
        const data = {
            level: this.currentLevel,
            experience: this.experience,
            achievements: Array.from(this.achievements),
            completedChallenges: Array.from(this.completedChallenges),
            streak: this.streak,
            lastActiveDate: new Date().toDateString(),
            skillPoints: Array.from(this.skillPoints.entries())
        };
        
        localStorage.setItem('rimmel_gamification', JSON.stringify(data));
    }

    updateDailyStreak() {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (this.lastActiveDate === yesterday) {
            this.streak++;
        } else if (this.lastActiveDate !== today) {
            this.streak = 1;
        }
        
        this.lastActiveDate = today;
    }

    setupChallenges() {
        // Beginner challenges
        this.challenges.set('first-stream', {
            id: 'first-stream',
            title: 'First Stream',
            description: 'Create your first reactive stream',
            difficulty: 'beginner',
            points: 10,
            requirements: ['Create a stream using fromEvent or interval'],
            hints: ['Try using rml`...` syntax', 'Look for DOM events or timer functions'],
            validator: (code) => this.validateFirstStream(code)
        });
        
        this.challenges.set('operator-master', {
            id: 'operator-master',
            title: 'Operator Master',
            description: 'Use 5 different RxJS operators in one stream',
            difficulty: 'intermediate',
            points: 25,
            requirements: ['Use map, filter, debounceTime, distinctUntilChanged, and one more'],
            hints: ['Chain operators with pipe()', 'Each operator transforms the stream'],
            validator: (code) => this.validateOperatorMaster(code)
        });
        
        this.challenges.set('error-handler', {
            id: 'error-handler',
            title: 'Error Handler',
            description: 'Implement proper error handling in streams',
            difficulty: 'intermediate',
            points: 20,
            requirements: ['Use catchError or retry operators'],
            hints: ['Handle errors gracefully', 'Provide fallback values'],
            validator: (code) => this.validateErrorHandler(code)
        });
        
        this.challenges.set('performance-optimizer', {
            id: 'performance-optimizer',
            title: 'Performance Optimizer',
            description: 'Optimize a stream for better performance',
            difficulty: 'advanced',
            points: 35,
            requirements: ['Use shareReplay, memoization, or unsubscribe properly'],
            hints: ['Avoid memory leaks', 'Share hot observables', 'Use proper lifecycle management'],
            validator: (code) => this.validatePerformanceOptimizer(code)
        });
        
        this.challenges.set('ui-reactive', {
            id: 'ui-reactive',
            title: 'Reactive UI Master',
            description: 'Build a fully reactive user interface',
            difficulty: 'advanced',
            points: 40,
            requirements: ['Combine multiple streams', 'Update UI reactively', 'Handle user interactions'],
            hints: ['Use combineLatest or merge', 'Separate data and presentation layers'],
            validator: (code) => this.validateReactiveUI(code)
        });
    }

    setupAchievements() {
        this.achievementDefinitions = [
            {
                id: 'first-steps',
                title: 'First Steps',
                description: 'Complete your first challenge',
                icon: '👶',
                condition: () => this.completedChallenges.size >= 1
            },
            {
                id: 'quick-learner',
                title: 'Quick Learner',
                description: 'Complete 5 challenges',
                icon: '🧠',
                condition: () => this.completedChallenges.size >= 5
            },
            {
                id: 'stream-master',
                title: 'Stream Master',
                description: 'Complete all beginner challenges',
                icon: '🌊',
                condition: () => this.countCompletedByDifficulty('beginner') >= 3
            },
            {
                id: 'operator-guru',
                title: 'Operator Guru',
                description: 'Master 10 different RxJS operators',
                icon: '⚡',
                condition: () => (this.skillPoints.get('operators') || 0) >= 10
            },
            {
                id: 'streak-warrior',
                title: 'Streak Warrior',
                description: 'Maintain a 7-day coding streak',
                icon: '🔥',
                condition: () => this.streak >= 7
            },
            {
                id: 'community-helper',
                title: 'Community Helper',
                description: 'Help others in collaborative sessions',
                icon: '🤝',
                condition: () => (this.skillPoints.get('collaboration') || 0) >= 5
            },
            {
                id: 'debugger-detective',
                title: 'Debugger Detective',
                description: 'Use debugging tools effectively',
                icon: '🔍',
                condition: () => (this.skillPoints.get('debugging') || 0) >= 10
            },
            {
                id: 'performance-expert',
                title: 'Performance Expert',
                description: 'Optimize stream performance',
                icon: '🚀',
                condition: () => (this.skillPoints.get('optimization') || 0) >= 15
            }
        ];
    }

    setupUI() {
        this.setupProgressDisplay();
        this.setupChallengeList();
        this.setupAchievementGallery();
        this.setupLeaderboard();
        this.updateAllDisplays();
    }

    setupProgressDisplay() {
        const progressSection = this.container.querySelector('.progress-section');
        if (progressSection) {
            progressSection.innerHTML = `
                <div class="level-display">
                    <div class="level-badge">
                        <span class="level-number">${this.currentLevel}</span>
                        <span class="level-label">Level</span>
                    </div>
                    <div class="experience-bar">
                        <div class="experience-fill" style="width: ${this.getExperienceProgress()}%"></div>
                        <span class="experience-text">${this.experience} / ${this.getExperienceForNextLevel()} XP</span>
                    </div>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-icon">🏆</span>
                        <span class="stat-value">${this.achievements.size}</span>
                        <span class="stat-label">Achievements</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">✅</span>
                        <span class="stat-value">${this.completedChallenges.size}</span>
                        <span class="stat-label">Challenges</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">🔥</span>
                        <span class="stat-value">${this.streak}</span>
                        <span class="stat-label">Day Streak</span>
                    </div>
                </div>
            `;
        }
    }

    setupChallengeList() {
        const challengeList = this.container.querySelector('.challenge-list');
        if (challengeList) {
            const challenges = Array.from(this.challenges.values());
            
            challengeList.innerHTML = challenges.map(challenge => {
                const isCompleted = this.completedChallenges.has(challenge.id);
                const isUnlocked = this.isChallengeUnlocked(challenge);
                
                return `
                    <div class="challenge-card ${isCompleted ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''}"
                         data-challenge-id="${challenge.id}">
                        <div class="challenge-header">
                            <h4>${challenge.title}</h4>
                            <div class="challenge-badges">
                                <span class="difficulty-badge ${challenge.difficulty}">${challenge.difficulty}</span>
                                <span class="points-badge">${challenge.points} XP</span>
                            </div>
                        </div>
                        <p class="challenge-description">${challenge.description}</p>
                        ${isCompleted ? '<div class="completed-icon">✅</div>' : ''}
                        ${!isUnlocked ? '<div class="locked-icon">🔒</div>' : ''}
                        <button class="challenge-btn ${isCompleted ? 'completed' : isUnlocked ? 'start' : 'locked'}"
                                ${!isUnlocked ? 'disabled' : ''}>
                            ${isCompleted ? 'Completed' : isUnlocked ? 'Start Challenge' : 'Locked'}
                        </button>
                    </div>
                `;
            }).join('');
            
            // Add click handlers
            challengeList.addEventListener('click', (e) => {
                if (e.target.classList.contains('challenge-btn') && !e.target.disabled) {
                    const challengeCard = e.target.closest('.challenge-card');
                    const challengeId = challengeCard.dataset.challengeId;
                    this.startChallenge(challengeId);
                }
            });
        }
    }

    setupAchievementGallery() {
        const achievementGallery = this.container.querySelector('.achievement-gallery');
        if (achievementGallery) {
            achievementGallery.innerHTML = this.achievementDefinitions.map(achievement => {
                const isUnlocked = this.achievements.has(achievement.id);
                
                return `
                    <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                        <div class="achievement-icon">${isUnlocked ? achievement.icon : '🔒'}</div>
                        <h5>${achievement.title}</h5>
                        <p>${achievement.description}</p>
                        ${isUnlocked ? '<div class="unlocked-indicator">Unlocked!</div>' : ''}
                    </div>
                `;
            }).join('');
        }
    }

    setupLeaderboard() {
        const leaderboard = this.container.querySelector('.leaderboard');
        if (leaderboard) {
            // Mock leaderboard data
            const leaderboardData = [
                { name: 'You', level: this.currentLevel, experience: this.experience, achievements: this.achievements.size },
                { name: 'ReactiveNinja', level: 8, experience: 2400, achievements: 12 },
                { name: 'StreamMaster', level: 7, experience: 1950, achievements: 10 },
                { name: 'ObservableWiz', level: 6, experience: 1600, achievements: 8 },
                { name: 'RxJSPro', level: 5, experience: 1200, achievements: 7 }
            ].sort((a, b) => b.experience - a.experience);
            
            leaderboard.innerHTML = `
                <h4>🏆 Leaderboard</h4>
                <div class="leaderboard-list">
                    ${leaderboardData.map((player, index) => `
                        <div class="leaderboard-item ${player.name === 'You' ? 'current-user' : ''}">
                            <span class="rank">#${index + 1}</span>
                            <span class="name">${player.name}</span>
                            <span class="level">Lv.${player.level}</span>
                            <span class="experience">${player.experience} XP</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    // Challenge management
    isChallengeUnlocked(challenge) {
        // Unlock logic based on level and previous challenges
        const difficultyRequirements = {
            'beginner': 1,
            'intermediate': 3,
            'advanced': 6
        };
        
        return this.currentLevel >= difficultyRequirements[challenge.difficulty];
    }

    startChallenge(challengeId) {
        const challenge = this.challenges.get(challengeId);
        if (!challenge) return;
        
        this.showChallengeDialog(challenge);
    }

    showChallengeDialog(challenge) {
        const dialog = document.createElement('div');
        dialog.className = 'modal challenge-modal';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${challenge.title}</h3>
                    <div class="challenge-meta">
                        <span class="difficulty-badge ${challenge.difficulty}">${challenge.difficulty}</span>
                        <span class="points-badge">${challenge.points} XP</span>
                    </div>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <p class="challenge-description">${challenge.description}</p>
                    
                    <div class="requirements-section">
                        <h4>Requirements:</h4>
                        <ul>
                            ${challenge.requirements.map(req => `<li>${req}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="hints-section">
                        <h4>💡 Hints:</h4>
                        <ul>
                            ${challenge.hints.map(hint => `<li>${hint}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="challenge-workspace">
                        <textarea class="challenge-editor" placeholder="Write your code here..."
                                  data-challenge-id="${challenge.id}"></textarea>
                        <div class="challenge-output"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="playground.gamification.validateChallenge('${challenge.id}')">Submit Solution</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Focus on the editor
        const editor = dialog.querySelector('.challenge-editor');
        editor.focus();
        
        // Setup real-time validation
        editor.addEventListener('input', () => {
            this.provideLiveHints(challenge.id, editor.value);
        });
    }

    provideLiveHints(challengeId, code) {
        const challenge = this.challenges.get(challengeId);
        const output = document.querySelector('.challenge-output');
        if (!challenge || !output) return;
        
        // Basic syntax checking and hints
        const hints = [];
        
        if (challengeId === 'first-stream') {
            if (!code.includes('rml`')) hints.push('💡 Try using the rml`` template syntax');
            if (!code.includes('fromEvent') && !code.includes('interval')) {
                hints.push('💡 Use fromEvent() for DOM events or interval() for timed streams');
            }
        }
        
        if (challengeId === 'operator-master') {
            const operators = ['map', 'filter', 'debounceTime', 'distinctUntilChanged'];
            const missing = operators.filter(op => !code.includes(op));
            if (missing.length > 0) {
                hints.push(`💡 Still need: ${missing.join(', ')}`);
            }
        }
        
        output.innerHTML = hints.length > 0 ? hints.join('<br>') : '✅ Looking good!';
    }

    validateChallenge(challengeId) {
        const challenge = this.challenges.get(challengeId);
        const editor = document.querySelector(`[data-challenge-id="${challengeId}"]`);
        const modal = editor.closest('.modal');
        
        if (!challenge || !editor) return;
        
        const code = editor.value.trim();
        const isValid = challenge.validator(code);
        
        if (isValid) {
            this.completeChallenge(challengeId);
            modal.remove();
            this.showSuccessDialog(challenge);
        } else {
            this.showValidationError(challenge);
        }
    }

    completeChallenge(challengeId) {
        if (this.completedChallenges.has(challengeId)) return;
        
        const challenge = this.challenges.get(challengeId);
        this.completedChallenges.add(challengeId);
        
        // Award experience points
        this.addExperience(challenge.points);
        
        // Update skill points
        this.updateSkillPoints(challengeId);
        
        // Check for achievements
        this.checkAchievements();
        
        // Save progress
        this.saveUserProgress();
        
        // Update UI
        this.updateAllDisplays();
        
        console.log(`🎉 Challenge completed: ${challenge.title} (+${challenge.points} XP)`);
    }

    // Challenge validators
    validateFirstStream(code) {
        return (code.includes('rml`') || code.includes('fromEvent') || code.includes('interval')) &&
               code.length > 20;
    }

    validateOperatorMaster(code) {
        const operators = ['map', 'filter', 'debounceTime', 'distinctUntilChanged'];
        const foundOperators = operators.filter(op => code.includes(op));
        return foundOperators.length >= 4 && code.includes('pipe');
    }

    validateErrorHandler(code) {
        return (code.includes('catchError') || code.includes('retry')) &&
               code.includes('pipe');
    }

    validatePerformanceOptimizer(code) {
        return code.includes('shareReplay') || 
               code.includes('unsubscribe') || 
               code.includes('takeUntil') ||
               code.includes('memoize');
    }

    validateReactiveUI(code) {
        return (code.includes('combineLatest') || code.includes('merge')) &&
               code.includes('rml`') &&
               code.includes('subscribe');
    }

    // Experience and leveling
    addExperience(points) {
        this.experience += points;
        
        const newLevel = this.calculateLevel(this.experience);
        if (newLevel > this.currentLevel) {
            this.levelUp(newLevel);
        }
        
        this.onProgressUpdate({
            level: this.currentLevel,
            experience: this.experience,
            pointsGained: points
        });
    }

    calculateLevel(experience) {
        // Level formula: sqrt(experience / 100) + 1
        return Math.floor(Math.sqrt(experience / 100)) + 1;
    }

    getExperienceForNextLevel() {
        const nextLevel = this.currentLevel + 1;
        return Math.pow(nextLevel - 1, 2) * 100;
    }

    getExperienceProgress() {
        const currentLevelExp = Math.pow(this.currentLevel - 1, 2) * 100;
        const nextLevelExp = this.getExperienceForNextLevel();
        const progress = (this.experience - currentLevelExp) / (nextLevelExp - currentLevelExp);
        return Math.min(progress * 100, 100);
    }

    levelUp(newLevel) {
        const oldLevel = this.currentLevel;
        this.currentLevel = newLevel;
        
        this.showLevelUpDialog(oldLevel, newLevel);
        this.unlockNewContent(newLevel);
        
        console.log(`🆙 Level up! ${oldLevel} → ${newLevel}`);
    }

    showLevelUpDialog(oldLevel, newLevel) {
        const dialog = document.createElement('div');
        dialog.className = 'modal level-up-modal';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="level-up-animation">
                    <div class="level-up-icon">🎉</div>
                    <h2>Level Up!</h2>
                    <div class="level-change">
                        <span class="old-level">${oldLevel}</span>
                        <span class="arrow">→</span>
                        <span class="new-level">${newLevel}</span>
                    </div>
                    <p>Congratulations! You've reached level ${newLevel}!</p>
                    <div class="rewards">
                        <h4>New unlocks:</h4>
                        <ul>
                            ${this.getUnlocksForLevel(newLevel).map(unlock => `<li>${unlock}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Awesome!</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (dialog.parentNode) dialog.remove();
        }, 5000);
    }

    getUnlocksForLevel(level) {
        const unlocks = [];
        
        if (level >= 3) unlocks.push('Intermediate challenges');
        if (level >= 5) unlocks.push('Advanced debugging tools');
        if (level >= 6) unlocks.push('Advanced challenges');
        if (level >= 8) unlocks.push('Expert tutorials');
        if (level >= 10) unlocks.push('Master challenges');
        
        return unlocks.length > 0 ? unlocks : ['Keep up the great work!'];
    }

    unlockNewContent(level) {
        // Update UI to show newly unlocked challenges
        this.setupChallengeList();
    }

    // Skill tracking
    updateSkillPoints(challengeId) {
        const skillMappings = {
            'first-stream': ['basics'],
            'operator-master': ['operators'],
            'error-handler': ['error-handling', 'operators'],
            'performance-optimizer': ['optimization', 'performance'],
            'ui-reactive': ['ui-design', 'operators']
        };
        
        const skills = skillMappings[challengeId] || [];
        skills.forEach(skill => {
            const current = this.skillPoints.get(skill) || 0;
            this.skillPoints.set(skill, current + 1);
        });
    }

    // Achievement system
    checkAchievements() {
        this.achievementDefinitions.forEach(achievement => {
            if (!this.achievements.has(achievement.id) && achievement.condition()) {
                this.unlockAchievement(achievement);
            }
        });
    }

    unlockAchievement(achievement) {
        this.achievements.add(achievement.id);
        this.showAchievementUnlocked(achievement);
        this.onAchievementUnlocked(achievement);
        
        console.log(`🏆 Achievement unlocked: ${achievement.title}`);
    }

    showAchievementUnlocked(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-text">
                    <h4>Achievement Unlocked!</h4>
                    <p>${achievement.title}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    countCompletedByDifficulty(difficulty) {
        let count = 0;
        this.challenges.forEach(challenge => {
            if (challenge.difficulty === difficulty && this.completedChallenges.has(challenge.id)) {
                count++;
            }
        });
        return count;
    }

    // Daily challenges
    startDailyChallenge() {
        const today = new Date().toDateString();
        const lastDaily = localStorage.getItem('rimmel_last_daily');
        
        if (lastDaily !== today) {
            this.generateDailyChallenge();
            localStorage.setItem('rimmel_last_daily', today);
        }
    }

    generateDailyChallenge() {
        // Generate a random challenge based on user level
        const difficulties = ['beginner', 'intermediate', 'advanced'];
        const maxDifficulty = Math.min(Math.floor(this.currentLevel / 3), 2);
        const difficulty = difficulties[Math.floor(Math.random() * (maxDifficulty + 1))];
        
        const dailyChallenge = {
            id: 'daily-' + Date.now(),
            title: 'Daily Challenge',
            description: this.generateDailyChallengeDescription(difficulty),
            difficulty: difficulty,
            points: 15 + (maxDifficulty * 10),
            isDaily: true,
            validator: (code) => this.validateDailyChallenge(code, difficulty)
        };
        
        this.challenges.set(dailyChallenge.id, dailyChallenge);
        this.showDailyChallenge(dailyChallenge);
    }

    generateDailyChallengeDescription(difficulty) {
        const challenges = {
            beginner: [
                'Create a stream that emits numbers from 1 to 10',
                'Build a counter that updates every second',
                'Filter even numbers from a stream'
            ],
            intermediate: [
                'Implement a search with debouncing',
                'Create a stream that combines user input and API responses',
                'Build a real-time form validator'
            ],
            advanced: [
                'Implement infinite scrolling with streams',
                'Create a drag-and-drop interface using streams',
                'Build a real-time collaborative editor feature'
            ]
        };
        
        const options = challenges[difficulty];
        return options[Math.floor(Math.random() * options.length)];
    }

    validateDailyChallenge(code, difficulty) {
        // Simple validation based on difficulty
        if (difficulty === 'beginner') {
            return code.includes('rml`') && code.length > 30;
        } else if (difficulty === 'intermediate') {
            return code.includes('pipe') && code.includes('debounceTime');
        } else {
            return code.includes('merge') || code.includes('combineLatest');
        }
    }

    showDailyChallenge(challenge) {
        // Show daily challenge notification
        const notification = document.createElement('div');
        notification.className = 'daily-challenge-notification';
        notification.innerHTML = `
            <div class="daily-content">
                <h4>🌟 Daily Challenge Available!</h4>
                <p>${challenge.description}</p>
                <button class="btn btn-primary" onclick="playground.gamification.startChallenge('${challenge.id}'); this.closest('.daily-challenge-notification').remove();">
                    Start Challenge (+${challenge.points} XP)
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, 10000);
    }

    // UI updates
    updateAllDisplays() {
        this.setupProgressDisplay();
        this.setupChallengeList();
        this.setupAchievementGallery();
        this.setupLeaderboard();
    }

    showSuccessDialog(challenge) {
        const dialog = document.createElement('div');
        dialog.className = 'modal success-modal';
        dialog.innerHTML = `
            <div class="modal-content">
                <div class="success-animation">
                    <div class="success-icon">🎉</div>
                    <h2>Challenge Completed!</h2>
                    <p>Great job completing "${challenge.title}"!</p>
                    <div class="rewards">
                        <div class="reward-item">
                            <span class="reward-icon">⭐</span>
                            <span>+${challenge.points} Experience Points</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Continue Learning!</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
    }

    showValidationError(challenge) {
        const output = document.querySelector('.challenge-output');
        if (output) {
            output.innerHTML = `
                <div class="error-message">
                    ❌ Solution doesn't meet all requirements. Check the hints and try again!
                </div>
            `;
        }
    }

    // Public API
    addCustomChallenge(challenge) {
        this.challenges.set(challenge.id, challenge);
        this.setupChallengeList();
    }

    getUserStats() {
        return {
            level: this.currentLevel,
            experience: this.experience,
            achievements: Array.from(this.achievements),
            completedChallenges: Array.from(this.completedChallenges),
            skillPoints: Array.from(this.skillPoints.entries()),
            streak: this.streak
        };
    }

    exportProgress() {
        return {
            ...this.getUserStats(),
            challenges: Array.from(this.challenges.entries()),
            tutorialProgress: Array.from(this.tutorialProgress.entries())
        };
    }

    destroy() {
        this.saveUserProgress();
        console.log('🎮 Gamification module destroyed');
    }
}

export { Gamification };