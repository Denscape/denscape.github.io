class PortfolioTour {
    constructor() {
        this.currentIndex = 0;
        this.isActive = false;
        this.activeTargetEl = null;

        this.initDOM();
        this.bindEvents();
    }

    buildSteps() {
        const steps = [
            {
                target: '.hero-section',
                title: 'Welcome & Hero Overview',
                badge: '1. Introduction',
                content: "Welcome to Denmar's portfolio! Discover his journey as an IT student continuously building practical projects across frontend web dev, networking, and cybersecurity."
            },
            {
                target: '#about',
                title: 'Technical Stack & Learning Focus',
                badge: '2. Skills & Tools',
                content: 'Explore categorized technologies, frameworks, and tools across Frontend Development, Networking, Cybersecurity, and Modern Developer Tools.'
            },
            {
                target: '#portfolio .section-heading',
                title: 'Featured Activities & Projects',
                badge: '3. Portfolio Overview',
                content: 'Showcasing web applications, cybersecurity learning platforms, and visual UI projects built during study.'
            }
        ];

        const projectItems = document.querySelectorAll('#portfolioGrid .portfolio-item');
        projectItems.forEach((item, idx) => {
            const titleEl = item.querySelector('h3');
            const descEl = item.querySelector('.project-body p');
            const badgeEl = item.querySelector('.project-badge-overlay');

            const projTitle = titleEl ? titleEl.textContent.trim() : `Project ${idx + 1}`;
            const projDesc = descEl ? descEl.textContent.trim() : 'Featured project showcase.';
            const projCategory = badgeEl ? badgeEl.textContent.trim() : 'Featured Work';

            steps.push({
                targetElement: item,
                title: `Featured Project: ${projTitle}`,
                badge: `Project ${idx + 1} of ${projectItems.length}`,
                content: `${projDesc} (${projCategory})`
            });
        });

        if (document.querySelector('#projects')) {
            steps.push({
                target: '#projects',
                title: 'Academic & Coursework Projects',
                badge: 'Academic Journey',
                content: 'Software and system activities developed for core Computer Science & IT subjects including Object-Oriented Programming (OOP) and database systems.'
            });
        }

        if (document.querySelector('#certifications')) {
            steps.push({
                target: '#certifications',
                title: 'Certifications & Competition Badges',
                badge: 'Verified Badges',
                content: 'Verified credentials, CTF competition achievements, and professional certifications with inspectable high-resolution badge previews.'
            });
        }

        if (document.querySelector('#contact')) {
            steps.push({
                target: '#contact .contact-shell',
                title: "Let's Connect & Collaborate",
                badge: 'Get In Touch',
                content: 'Open to student internships, entry-level roles, and project collaborations. Click to copy email address or access social links directly!'
            });
        }

        return steps;
    }

    initDOM() {
        if (!document.querySelector('.tour-backdrop')) {
            this.backdrop = document.createElement('div');
            this.backdrop.className = 'tour-backdrop';
            document.body.appendChild(this.backdrop);
        } else {
            this.backdrop = document.querySelector('.tour-backdrop');
        }

        if (!document.querySelector('.tour-highlight-box')) {
            this.highlightBox = document.createElement('div');
            this.highlightBox.className = 'tour-highlight-box';
            document.body.appendChild(this.highlightBox);
        } else {
            this.highlightBox = document.querySelector('.tour-highlight-box');
        }

        if (!document.querySelector('.tour-tooltip')) {
            this.tooltip = document.createElement('div');
            this.tooltip.className = 'tour-tooltip';
            this.tooltip.setAttribute('role', 'dialog');
            this.tooltip.setAttribute('aria-modal', 'true');
            this.tooltip.setAttribute('aria-label', 'Guided Tour');

            this.tooltip.innerHTML = `
                <div class="tour-progress-bar">
                    <div class="tour-progress-fill" id="tourProgressFill"></div>
                </div>
                <div class="tour-header">
                    <span class="tour-badge" id="tourBadge">Step 1</span>
                    <button class="tour-close-btn" id="tourCloseBtn" aria-label="Exit tour">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <h3 class="tour-title" id="tourTitle">Tour Title</h3>
                <div class="tour-body" id="tourBody">Tour body content...</div>
                <div class="tour-footer">
                    <span class="tour-steps-count" id="tourStepCount">1 of 10</span>
                    <div class="tour-nav-btns">
                        <button class="btn-tour-nav" id="tourPrevBtn">
                            <i class="fa-solid fa-arrow-left"></i> Back
                        </button>
                        <button class="btn-tour-nav btn-tour-primary" id="tourNextBtn">
                            Next <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(this.tooltip);
        } else {
            this.tooltip = document.querySelector('.tour-tooltip');
        }

        this.badgeEl = document.getElementById('tourBadge');
        this.titleEl = document.getElementById('tourTitle');
        this.bodyEl = document.getElementById('tourBody');
        this.stepCountEl = document.getElementById('tourStepCount');
        this.progressFillEl = document.getElementById('tourProgressFill');
        this.closeBtn = document.getElementById('tourCloseBtn');
        this.prevBtn = document.getElementById('tourPrevBtn');
        this.nextBtn = document.getElementById('tourNextBtn');
    }

    bindEvents() {
        this.closeBtn?.addEventListener('click', () => this.exit());
        this.backdrop?.addEventListener('click', () => this.exit());
        this.prevBtn?.addEventListener('click', () => this.prev());
        this.nextBtn?.addEventListener('click', () => this.next());

        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;
            if (e.key === 'Escape') {
                this.exit();
            } else if (e.key === 'ArrowRight') {
                this.next();
            } else if (e.key === 'ArrowLeft') {
                this.prev();
            }
        });

        window.addEventListener('resize', () => {
            if (this.isActive) this.updateHighlightAndTooltipPosition();
        });

        window.addEventListener('scroll', () => {
            if (this.isActive) this.updateHighlightAndTooltipPosition();
        }, { passive: true });
    }

    start() {
        this.steps = this.buildSteps();
        this.currentIndex = 0;
        this.isActive = true;

        document.body.classList.add('tour-active');
        this.backdrop.classList.add('active');
        this.tooltip.classList.add('active');

        this.showStep(this.currentIndex);
    }

    showStep(index) {
        if (!this.steps || index < 0 || index >= this.steps.length) return;

        if (this.activeTargetEl) {
            this.activeTargetEl.classList.remove('tour-target-active');
        }

        this.currentIndex = index;
        const step = this.steps[index];

        const targetEl = step.targetElement || document.querySelector(step.target);
        if (!targetEl) {
            console.warn(`Tour target element not found for step ${index}`);
            return;
        }

        this.activeTargetEl = targetEl;
        this.activeTargetEl.classList.add('tour-target-active');

        const revealParent = targetEl.closest('.reveal') || targetEl;
        if (revealParent) {
            revealParent.classList.add('is-visible');
        }

        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        this.badgeEl.textContent = step.badge;
        this.titleEl.textContent = step.title;
        this.bodyEl.textContent = step.content;
        this.stepCountEl.textContent = `${index + 1} of ${this.steps.length}`;

        const progressPercent = ((index + 1) / this.steps.length) * 100;
        this.progressFillEl.style.width = `${progressPercent}%`;

        if (index === 0) {
            this.prevBtn.setAttribute('disabled', 'true');
        } else {
            this.prevBtn.removeAttribute('disabled');
        }

        if (index === this.steps.length - 1) {
            this.nextBtn.innerHTML = `Finish <i class="fa-solid fa-check"></i>`;
        } else {
            this.nextBtn.innerHTML = `Next <i class="fa-solid fa-arrow-right"></i>`;
        }

        setTimeout(() => {
            this.updateHighlightAndTooltipPosition();
            this.nextBtn.focus();
        }, 150);
    }

    updateHighlightAndTooltipPosition() {
        if (!this.isActive || !this.activeTargetEl) return;

        const rect = this.activeTargetEl.getBoundingClientRect();
        const padding = 12;

        const top = Math.max(0, rect.top - padding);
        const left = Math.max(0, rect.left - padding);
        const width = rect.width + (padding * 2);
        const height = rect.height + (padding * 2);

        this.highlightBox.style.top = `${top}px`;
        this.highlightBox.style.left = `${left}px`;
        this.highlightBox.style.width = `${width}px`;
        this.highlightBox.style.height = `${height}px`;

        const tooltipRect = this.tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let tooltipTop = top + height + 16;
        let tooltipLeft = left + (width / 2) - (tooltipRect.width / 2);

        if (tooltipTop + tooltipRect.height > viewportHeight - 20) {
            if (top - tooltipRect.height - 16 > 20) {
                tooltipTop = top - tooltipRect.height - 16;
            } else {
                tooltipTop = Math.max(20, viewportHeight - tooltipRect.height - 20);
            }
        }
        if (tooltipLeft < 16) {
            tooltipLeft = 16;
        } else if (tooltipLeft + tooltipRect.width > viewportWidth - 16) {
            tooltipLeft = viewportWidth - tooltipRect.width - 16;
        }

        this.tooltip.style.top = `${tooltipTop}px`;
        this.tooltip.style.left = `${tooltipLeft}px`;
    }

    next() {
        if (this.currentIndex < this.steps.length - 1) {
            this.showStep(this.currentIndex + 1);
        } else {
            this.exit();
        }
    }

    prev() {
        if (this.currentIndex > 0) {
            this.showStep(this.currentIndex - 1);
        }
    }

    exit() {
        this.isActive = false;

        if (this.activeTargetEl) {
            this.activeTargetEl.classList.remove('tour-target-active');
            this.activeTargetEl = null;
        }

        document.body.classList.remove('tour-active');
        this.backdrop?.classList.remove('active');
        this.tooltip?.classList.remove('active');

        if (this.highlightBox) {
            this.highlightBox.style.opacity = '0';
        }
    }
}

window.portfolioTour = new PortfolioTour();

function initGuidedTour() {
    const triggerBtns = document.querySelectorAll('.js-start-tour');
    triggerBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.portfolioTour.start();
        });
    });
}
