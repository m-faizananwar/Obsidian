/**
 * ThemeManager.js
 * Handles UI effects, animations, and the starry background.
 */

export default class ThemeManager {
  constructor() {
    this.starColors = ['#ff9dd2', '#c99bff', '#a6e3e9', '#ffffff'];
  }

  init() {
    this.addStarryBackground();
    this.enhanceUI();
    this.addParticleEffect(); // Added particle effect from enhancement.js
  }

  addStarryBackground(count = 50) {
    const container = document.createElement('div');
    container.id = 'starry-background';
    container.className = 'fixed inset-0 pointer-events-none z-0';

    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = Math.random() * 2 + 1;
      const opacity = Math.random() * 0.7 + 0.3;
      const duration = Math.random() * 3 + 2;

      star.className = 'absolute rounded-full';
      star.style.left = `${x}%`;
      star.style.top = `${y}%`;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.backgroundColor = this.starColors[Math.floor(Math.random() * this.starColors.length)];
      star.style.opacity = opacity;
      star.style.animation = `twinkle ${duration}s ease-in-out infinite`;

      container.appendChild(star);
    }

    document.body.appendChild(container);
  }

  enhanceUI() {
    // Add glassy classes and other enhancements to static elements
    const glassElements = document.querySelectorAll('#task-notes, .bg-pastel-darkBg.bg-opacity-50');
    glassElements.forEach((el) => el.classList.add('glass-effect'));

    const headings = document.querySelectorAll('h1, h2, h3');
    headings.forEach((heading) => heading.classList.add('text-shadow-sm'));
  }

  // Particle background effect from enhancement.js
  addParticleEffect() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.className = 'particle-canvas fixed inset-0 pointer-events-none z-0 opacity-30';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = 50;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = `rgba(201, 155, 155, ${Math.random() * 0.5})`;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.reset();
        }
      }
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      if (!document.getElementById('particle-canvas')) return; // Safety check
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    };
    animate();
  }

  // Button ripple and particle effect logic
  createClickEffect(event) {
    const button = event.target.closest('button');
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Ripple
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect absolute rounded-full bg-white opacity-30 pointer-events-none';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1000);
  }
}
