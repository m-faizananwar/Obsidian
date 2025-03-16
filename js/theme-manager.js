/**
 * Theme Manager for Dreamy Notes
 * Handles theme customization and effects
 */

document.addEventListener('DOMContentLoaded', function() {
    initThemeEffects();
});

function initThemeEffects() {
    // Add star particles to the background
    addStarryBackground();
    
    // Add glow effects to important UI elements
    addGlowEffects();
    
    // Add subtle hover animations
    enhanceHoverEffects();
    
    // Add glass effects to cards
    applyGlassmorphism();
}

// Creates a starry background effect
function addStarryBackground() {
    const container = document.createElement('div');
    container.className = 'fixed inset-0 pointer-events-none z-0';
    
    // Create stars
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Random size and opacity
        const size = Math.random() * 2 + 1;
        const opacity = Math.random() * 0.7 + 0.3;
        
        // Random twinkle animation duration
        const duration = Math.random() * 3 + 2;
        
        star.className = 'absolute rounded-full';
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.backgroundColor = 'rgba(255, 255, 255, ' + opacity + ')';
        star.style.animation = `twinkle ${duration}s ease-in-out infinite`;
        
        container.appendChild(star);
    }
    
    // Add keyframe animation for twinkling
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
        }
    `;
    document.head.appendChild(styleSheet);
    
    document.body.appendChild(container);
}

// Add subtle glow effects to important UI elements
function addGlowEffects() {
    // Add glow to accent buttons
    const accentButtons = document.querySelectorAll('.bg-pastel-accent');
    accentButtons.forEach(button => {
        button.classList.add('hover:shadow-glow');
    });
    
    // Add glow to headings
    const headings = document.querySelectorAll('h1, h2, h3');
    headings.forEach(heading => {
        heading.classList.add('text-shadow-sm');
    });
    
    // Add styles for the glow effects
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .hover\:shadow-glow:hover {
            box-shadow: 0 0 15px rgba(201, 155, 255, 0.6);
        }
        
        .text-shadow-sm {
            text-shadow: 0 0 5px rgba(201, 155, 255, 0.5);
        }
    `;
    document.head.appendChild(styleSheet);
}

// Enhance hover effects for interactive elements
function enhanceHoverEffects() {
    // Add subtle scale effect to task items
    const taskItems = document.querySelectorAll('#to-do-box li');
    taskItems.forEach(item => {
        item.classList.add('transition-transform', 'hover:scale-[1.01]', 'hover:shadow-md');
    });
    
    // Add pulse effect to certain icons
    const icons = document.querySelectorAll('.jpa-sparkles, .jpa-star_struck');
    icons.forEach(icon => {
        icon.classList.add('hover:animate-pulse-gentle');
    });
}

// Apply glassmorphism effects to card elements
function applyGlassmorphism() {
    // Add glassy effect to certain containers
    const glassContainers = document.querySelectorAll('#task-notes, .bg-pastel-darkBg.bg-opacity-50');
    
    // Add styles for glassmorphism
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .glass-effect {
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            background-color: rgba(42, 27, 55, 0.7) !important;
            border: 1px solid rgba(201, 155, 255, 0.2);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.3);
        }
    `;
    document.head.appendChild(styleSheet);
    
    glassContainers.forEach(container => {
        container.classList.add('glass-effect');
    });
}

// Export theme switching functionality for future expansion
window.themeManager = {
    // Function to change theme colors (for future implementation)
    changeTheme: function(themeName) {
        console.log(`Theme "${themeName}" would be applied here`);
        // Future implementation for theme switching
    },
    
    // Toggle between light/dark modes
    toggleDarkMode: function() {
        document.body.classList.toggle('light-mode');
    }
};
