// @ts-nocheck

/**
 * Modern Rimmel Demo with TailwindCSS
 * Showcasing reactive programming with streams
 */

import { BehaviorSubject, Subject, Observable, map, scan, startWith, catchError, of, tap, filter } from 'rxjs';
import { rml, Value, InnerHTML, InnerText } from '../../src/index';

// Dark Mode Management
class DarkModeManager {
    private darkModeSubject = new BehaviorSubject<boolean>(
        localStorage.getItem('darkMode') === 'true' || 
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
    
    public darkMode$ = this.darkModeSubject.asObservable();
    
    constructor() {
        // Apply initial dark mode
        this.applyDarkMode(this.darkModeSubject.value);
        
        // Subscribe to changes
        this.darkMode$.subscribe(isDark => {
            this.applyDarkMode(isDark);
            localStorage.setItem('darkMode', isDark.toString());
        });
    }
    
    private applyDarkMode(isDark: boolean) {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
    
    toggle() {
        this.darkModeSubject.next(!this.darkModeSubject.value);
    }
}

// Reactive Counter Component
class ReactiveCounter {
    private countSubject = new BehaviorSubject<number>(0);
    public count$ = this.countSubject.asObservable();
    
    increment() {
        this.countSubject.next(this.countSubject.value + 1);
    }
    
    decrement() {
        this.countSubject.next(this.countSubject.value - 1);
    }
}

// Todo Item Interface
interface TodoItem {
    id: number;
    text: string;
    completed: boolean;
}

// Reactive Todo List Component
class ReactiveTodoList {
    private todosSubject = new BehaviorSubject<TodoItem[]>([
        { id: 1, text: 'Learn Rimmel.js', completed: false },
        { id: 2, text: 'Build reactive apps', completed: false }
    ]);
    
    public todos$ = this.todosSubject.asObservable();
    private nextId = 3;
    
    addTodo(text: string) {
        if (text.trim()) {
            const currentTodos = this.todosSubject.value;
            const newTodo: TodoItem = {
                id: this.nextId++,
                text: text.trim(),
                completed: false
            };
            this.todosSubject.next([...currentTodos, newTodo]);
        }
    }
    
    removeTodo(id: number) {
        const currentTodos = this.todosSubject.value;
        this.todosSubject.next(currentTodos.filter(todo => todo.id !== id));
    }
    
    toggleTodo(id: number) {
        const currentTodos = this.todosSubject.value;
        this.todosSubject.next(
            currentTodos.map(todo => 
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
        );
    }
}

// Live Input Binding Component
class LiveInputBinding {
    private inputSubject = new Subject<string>();
    
    public input$ = this.inputSubject.pipe(
        startWith('Start typing above...'),
        map(text => text || 'Start typing above...')
    );
    
    updateInput(value: string) {
        this.inputSubject.next(value);
    }
}

// Error Handling Component
class ErrorHandlingDemo {
    private errorTriggerSubject = new Subject<void>();
    
    public errorStream$ = this.errorTriggerSubject.pipe(
        map(() => {
            // Simulate an error
            throw new Error('Something went wrong in the reactive stream!');
        }),
        catchError(err => of(`Error caught: ${err.message}`))
    );
    
    triggerError() {
        this.errorTriggerSubject.next();
    }
}

// Initialize all components
const darkModeManager = new DarkModeManager();
const reactiveCounter = new ReactiveCounter();
const todoList = new ReactiveTodoList();
const liveInputBinding = new LiveInputBinding();
const errorDemo = new ErrorHandlingDemo();

// DOM Ready Handler
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Rimmel Modern Demo Loaded!');
    
    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            darkModeManager.toggle();
        });
    }
    
    // Reactive Counter
    const counterDisplay = document.getElementById('counterDisplay');
    const incrementBtn = document.getElementById('incrementBtn');
    const decrementBtn = document.getElementById('decrementBtn');
    
    if (counterDisplay && incrementBtn && decrementBtn) {
        // Bind counter display
        reactiveCounter.count$.subscribe(count => {
            counterDisplay.textContent = count.toString();
            
            // Add animation effect
            counterDisplay.style.transform = 'scale(1.1)';
            setTimeout(() => {
                counterDisplay.style.transform = 'scale(1)';
            }, 150);
        });
        
        // Bind buttons
        incrementBtn.addEventListener('click', () => reactiveCounter.increment());
        decrementBtn.addEventListener('click', () => reactiveCounter.decrement());
    }
    
    // Todo List
    const todoInput = document.getElementById('todoInput') as HTMLInputElement;
    const addTodoBtn = document.getElementById('addTodoBtn');
    const todoListContainer = document.getElementById('todoList');
    
    if (todoInput && addTodoBtn && todoListContainer) {
        // Render todos
        todoList.todos$.subscribe(todos => {
            todoListContainer.innerHTML = todos.map(todo => `
                <div class="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-200">
                    <div class="flex items-center space-x-3">
                        <input type="checkbox" 
                               ${todo.completed ? 'checked' : ''} 
                               onchange="window.todoList.toggleTodo(${todo.id})"
                               class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600">
                        <span class="${todo.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'} transition-colors duration-200">
                            ${todo.text}
                        </span>
                    </div>
                    <button onclick="window.todoList.removeTodo(${todo.id})" 
                            class="text-red-500 hover:text-red-700 transition-colors duration-200">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            `).join('');
        });
        
        // Add todo functionality
        const addTodo = () => {
            todoList.addTodo(todoInput.value);
            todoInput.value = '';
        };
        
        addTodoBtn.addEventListener('click', addTodo);
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTodo();
            }
        });
        
        // Expose todoList methods to global scope for onclick handlers
        (window as any).todoList = todoList;
    }
    
    // Live Input Binding
    const liveInput = document.getElementById('liveInput') as HTMLInputElement;
    const liveOutput = document.getElementById('liveOutput');
    
    if (liveInput && liveOutput) {
        // Bind output
        liveInputBinding.input$.subscribe(text => {
            liveOutput.textContent = text;
            
            // Add typing effect
            liveOutput.style.opacity = '0.7';
            setTimeout(() => {
                liveOutput.style.opacity = '1';
            }, 100);
        });
        
        // Bind input
        liveInput.addEventListener('input', (e) => {
            liveInputBinding.updateInput((e.target as HTMLInputElement).value);
        });
    }
    
    // Error Handling Demo
    const errorTriggerBtn = document.getElementById('errorTriggerBtn');
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    
    if (errorTriggerBtn && errorContainer && errorMessage) {
        errorTriggerBtn.addEventListener('click', () => {
            errorDemo.triggerError();
        });
        
        errorDemo.errorStream$.subscribe(message => {
            errorMessage.textContent = message;
            errorContainer.classList.remove('hidden');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                errorContainer.classList.add('hidden');
            }, 5000);
        });
    }
    
    // Get Started Button
    const getStartedBtn = document.getElementById('getStartedBtn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            // Scroll to features section
            document.querySelector('section:nth-of-type(2)')?.scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
    
    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe cards and sections
    document.querySelectorAll('.bg-gray-50, .bg-white').forEach(el => {
        observer.observe(el);
    });
});

// Utility function for creating reactive components with Rimmel
const createRimmelComponent = () => {
    // Example of how to create a component using Rimmel's rml template
    const exampleStream = new BehaviorSubject('Hello Rimmel!');
    
    const component = rml`
        <div class="p-4 bg-blue-100 rounded-lg">
            <h3 class="text-lg font-semibold mb-2">Rimmel Component</h3>
            <p class="text-blue-800">${exampleStream}</p>
            <button onclick="${() => exampleStream.next('Updated with Rimmel!')}" 
                    class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Update Stream
            </button>
        </div>
    `;
    
    return component;
};

// Advanced Example: Real-time Data Stream
const createDataStreamExample = () => {
    const dataStream = new BehaviorSubject(0);
    
    // Simulate real-time data updates
    setInterval(() => {
        dataStream.next(Math.floor(Math.random() * 100));
    }, 2000);
    
    const formattedStream = dataStream.pipe(
        map(value => `Real-time value: ${value}`)
    );
    
    return rml`
        <div class="p-4 bg-green-100 rounded-lg">
            <h3 class="text-lg font-semibold mb-2">Live Data Stream</h3>
            <p class="text-green-800 font-mono">${InnerText(formattedStream)}</p>
        </div>
    `;
};

// Export for potential use
export {
    DarkModeManager,
    ReactiveCounter,
    ReactiveTodoList,
    LiveInputBinding,
    ErrorHandlingDemo,
    createRimmelComponent,
    createDataStreamExample
};