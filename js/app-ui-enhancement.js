// UI Enhancement JavaScript

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations and UI enhancements
    initializeUI();
    
    // Add event listeners for UI interactions
    addUIEventListeners();

    // Add the graph refresh functionality
    setupGraphRefresh();

    // Add a particle background effect to the app
    addParticleEffect();
});

// Initialize UI animations and enhancements
function initializeUI() {
    // Add staggered animation to existing task items
    animateTaskItems();
    
    // Initialize tooltips
    initializeTooltips();
    
    // Add responsive behavior
    handleResponsiveLayout();
    
    // Parse and highlight emojis
    parseEmojis();
    
    // Add glass effect to certain elements
    addGlassmorphismEffects();
    
    // Add particle effect to buttons
    addButtonParticles();
}

// Animate task items with staggered delay
function animateTaskItems() {
    const taskItems = document.querySelectorAll('#to-do-box li');
    
    taskItems.forEach((item, index) => {
        // Remove any existing animation classes
        item.classList.remove('animate__animated', 'animate__fadeIn');
        
        // Add staggered animation
        setTimeout(() => {
            item.classList.add('animate__animated', 'animate__fadeIn');
        }, index * 100);
    });
}

// Initialize tooltips on interactive elements
function initializeTooltips() {
    // Tooltip for new task button
    tippy('#new-task-btn', {
        content: 'Create a new task',
        animation: 'scale',
        placement: 'right'
    });
    
    // Tooltip for graph view
    tippy('#graph-view-btn', {
        content: 'View task relationships',
        animation: 'scale',
        placement: 'top'
    });
    
    // Tooltip for add note button
    tippy('#add-note-btn', {
        content: 'Add a new note',
        animation: 'scale',
    });
    
    // Task action tooltips (dynamically added)
    document.querySelectorAll('.delete-btn').forEach(btn => {
        tippy(btn, {
            content: 'Delete task',
            animation: 'scale',
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        tippy(btn, {
            content: 'Edit task',
            animation: 'scale',
        });
    });
}

// Handle responsive layout changes
function handleResponsiveLayout() {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    // Function to handle layout changes
    function handleScreenChange(e) {
        if (e.matches) {
            // Mobile layout adjustments
            document.querySelector('.sidebar').classList.add('mobile-sidebar');
        } else {
            // Desktop layout
            document.querySelector('.sidebar')?.classList.remove('mobile-sidebar');
        }
    }
    
    // Initial check
    handleScreenChange(mediaQuery);
    
    // Add listener for changes
    mediaQuery.addEventListener('change', handleScreenChange);
}

// Parse emoji shortcodes in text
function parseEmojis() {
    document.querySelectorAll('.task-text, .note-text').forEach(element => {
        if (element && typeof joypixels !== 'undefined') {
            element.innerHTML = joypixels.shortnameToImage(element.innerHTML);
        }
    });
}

// Add UI-specific event listeners
function addUIEventListeners() {
    // Task hover animation
    document.addEventListener('mouseover', function(e) {
        if (e.target.closest('#to-do-box li')) {
            e.target.closest('#to-do-box li').classList.add('hover-effect');
        }
    });
    
    document.addEventListener('mouseout', function(e) {
        if (e.target.closest('#to-do-box li')) {
            e.target.closest('#to-do-box li').classList.remove('hover-effect');
        }
    });
    
    // Animate completion
    document.addEventListener('change', function(e) {
        if (e.target.matches('input[type="checkbox"]')) {
            const taskItem = e.target.closest('li');
            if (e.target.checked) {
                taskItem.classList.add('animate__animated', 'animate__pulse', 'completed-task');
            } else {
                taskItem.classList.remove('completed-task');
                taskItem.classList.add('animate__animated', 'animate__fadeIn');
                setTimeout(() => {
                    taskItem.classList.remove('animate__animated', 'animate__fadeIn');
                }, 1000);
            }
        }
    });
    
    // Button hover animations
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.classList.add('hover-effect');
        });
        
        button.addEventListener('mouseleave', function() {
            this.classList.remove('hover-effect');
        });
    });
    
    // Add animation to note saving
    if (document.getElementById('save-note-btn')) {
        document.getElementById('save-note-btn').addEventListener('click', function() {
            const notesContainer = document.getElementById('notes-container');
            if (notesContainer && notesContainer.lastElementChild) {
                notesContainer.lastElementChild.classList.add('animate__animated', 'animate__bounceIn');
                setTimeout(() => {
                    notesContainer.lastElementChild.classList.remove('animate__animated', 'animate__bounceIn');
                }, 1000);
            }
        });
    }
}

// Call this function when adding new task items to ensure UI enhancements are applied
function refreshUIEnhancements() {
    animateTaskItems();
    initializeTooltips();
    parseEmojis();
}

// When task status changes, animate the change
function animateTaskStatusChange(taskElement, isCompleted) {
    if (isCompleted) {
        taskElement.classList.add('animate__animated', 'animate__pulse', 'completed-task');
    } else {
        taskElement.classList.remove('completed-task');
        taskElement.classList.add('animate__animated', 'animate__fadeIn');
        setTimeout(() => {
            taskElement.classList.remove('animate__animated', 'animate__fadeIn');
        }, 1000);
    }
}

// Add glassmorphism effects to elements
function addGlassmorphismEffects() {
    const glassElements = [
        document.getElementById('task-notes'),
        ...document.querySelectorAll('#graph-tooltip, #notes-container .note')
    ];
    
    glassElements.forEach(el => {
        if (el) el.classList.add('glass-effect');
    });
}

// Setup the graph refresh functionality
function setupGraphRefresh() {
    const refreshBtn = document.getElementById('refresh-graph-btn');
    const graphLoading = document.getElementById('graph-loading');
    
    if (refreshBtn) {
        // Add tooltip
        tippy(refreshBtn, {
            content: 'Refresh Graph View',
            animation: 'scale',
            placement: 'left'
        });
        
        // Add click event
        refreshBtn.addEventListener('click', function() {
            // Show loading animation
            refreshBtn.classList.add('loading');
            if (graphLoading) graphLoading.classList.remove('hidden');
            
            // Simulate refresh (in a real app, this would call the actual graph rendering function)
            setTimeout(() => {
                // This is where you'd call your actual graph refresh function
                // For demo, we'll just show a success animation
                refreshBtn.classList.remove('loading');
                refreshBtn.classList.add('animate__animated', 'animate__rubberBand');
                
                if (graphLoading) graphLoading.classList.add('hidden');
                
                // Reset animation class after animation completes
                setTimeout(() => {
                    refreshBtn.classList.remove('animate__animated', 'animate__rubberBand');
                }, 1000);
                
                // Show a toast notification
                showToast('Graph refreshed successfully!');
            }, 1200);
        });
    }
    
    // Add a node count indicator to the graph
    addNodeCountToGraph();
}

// Add a node count indicator to the graph view
function addNodeCountToGraph() {
    const graphContainer = document.getElementById('graph-container');
    
    if (graphContainer) {
        // Create node count element if it doesn't exist
        let nodeCount = document.querySelector('.node-count');
        if (!nodeCount) {
            nodeCount = document.createElement('div');
            nodeCount.className = 'node-count';
            graphContainer.appendChild(nodeCount);
        }
        
        // Update the count when the graph is visible
        // This would be linked to your actual graph data
        document.getElementById('graph-view-btn').addEventListener('click', function() {
            // Get total tasks for the count (this should be replaced with actual node count)
            const taskCount = document.querySelectorAll('#to-do-box li').length;
            nodeCount.textContent = `Nodes: ${taskCount} • Connections: ${Math.max(0, taskCount - 1)}`;
            
            // Animate the count
            nodeCount.classList.add('animate__animated', 'animate__fadeInUp');
            setTimeout(() => {
                nodeCount.classList.remove('animate__animated', 'animate__fadeInUp');
            }, 1000);
        });
    }
}

// Show a toast notification
function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container fixed bottom-4 right-4 z-50';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast p-3 mb-2 rounded-lg shadow-lg animate__animated animate__fadeInUp flex items-center 
                       ${type === 'success' ? 'bg-pastel-accent bg-opacity-20 text-pastel-accent' : 
                       type === 'error' ? 'bg-red-500 bg-opacity-20 text-red-400' : 
                       'bg-pastel-secondary bg-opacity-20 text-pastel-secondary'}`;
    
    // Add icon based on type
    const icon = document.createElement('span');
    icon.className = 'mr-2';
    icon.innerHTML = type === 'success' ? 
                    '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>' :
                    type === 'error' ?
                    '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>' :
                    '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>';
    
    toast.appendChild(icon);
    
    // Add message
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    toast.appendChild(messageSpan);
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Auto remove after a few seconds
    setTimeout(() => {
        toast.classList.remove('animate__fadeInUp');
        toast.classList.add('animate__fadeOutRight');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Add subtle particle effect to the background
function addParticleEffect() {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;
    
    // Create a canvas for particles
    const canvas = document.createElement('canvas');
    canvas.className = 'particle-canvas fixed inset-0 pointer-events-none z-0 opacity-30';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.color = `rgba(201, 155, 255, ${Math.random() * 0.5})`;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Wrap around edges
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Create particles
    const particles = [];
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }
    
    // Animation loop
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (const particle of particles) {
            particle.update();
            particle.draw();
        }
        
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
}

// Add particle effects to buttons on click
function addButtonParticles() {
    // Add particle effect on button clicks
    document.addEventListener('click', function(e) {
        if (e.target.closest('button')) {
            createButtonClickEffect(e);
        }
    });
}

// Create button click particle effect
function createButtonClickEffect(e) {
    const button = e.target.closest('button');
    const rect = button.getBoundingClientRect();
    
    // Create particles at click position
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('span');
        const size = Math.random() * 6 + 2;
        
        particle.className = 'absolute rounded-full pointer-events-none';
        particle.style.backgroundColor = 'rgba(201, 155, 255, 0.7)';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${e.clientX - rect.left}px`;
        particle.style.top = `${e.clientY - rect.top}px`;
        particle.style.position = 'absolute';
        
        button.appendChild(particle);
        
        // Random direction
        const destinationX = (Math.random() - 0.5) * 100;
        const destinationY = (Math.random() - 0.5) * 100;
        
        // Animate the particle
        const animation = particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${destinationX}px, ${destinationY}px) scale(0)`, opacity: 0 }
        ], {
            duration: Math.random() * 600 + 400,
            easing: 'cubic-bezier(0, .9, .57, 1)'
        });
        
        animation.onfinish = () => particle.remove();
    }
    
    // Add a ripple effect
    const ripple = document.createElement('span');
    ripple.className = 'absolute rounded-full pointer-events-none';
    ripple.style.backgroundColor = 'rgba(201, 155, 255, 0.3)';
    ripple.style.width = '10px';
    ripple.style.height = '10px';
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    ripple.style.position = 'absolute';
    
    button.appendChild(ripple);
    
    // Animate the ripple
    const rippleAnimation = ripple.animate([
        { transform: 'scale(0)', opacity: 1 },
        { transform: 'scale(15)', opacity: 0 }
    ], {
        duration: 600,
        easing: 'cubic-bezier(0, .9, .57, 1)'
    });
    
    rippleAnimation.onfinish = () => ripple.remove();
}

// Highlight active task with a glowing effect
function highlightActiveTask(taskId) {
    // Remove highlight from all tasks
    document.querySelectorAll('#to-do-box li').forEach(li => {
        li.classList.remove('active-task');
    });
    
    // Add highlight to selected task
    const selectedTask = document.querySelector(`#to-do-box li[data-id="${taskId}"]`);
    if (selectedTask) {
        selectedTask.classList.add('active-task', 'task-interaction');
        setTimeout(() => {
            selectedTask.classList.remove('task-interaction');
        }, 300);
    }
}
