document.addEventListener('DOMContentLoaded', async function () {
    await loadComponents();
    initNavigation();
    initScrollReveal();
    initCounterAnimation();
    initPortfolioFilters();
    initCertLightbox();
    initCyberTerminal();
    initCopyUtilities();
});
async function loadComponents() {
    const components = [
        { id: 'header-root', file: 'components/header.html' },
        { id: 'hero-root', file: 'components/hero.html' },
        { id: 'skills-root', file: 'components/skills.html' },
        { id: 'portfolio-root', file: 'components/portfolio.html' },
        { id: 'academic-root', file: 'components/academic.html' },
        { id: 'certifications-root', file: 'components/certifications.html' },
        { id: 'contact-root', file: 'components/contact.html' },
        { id: 'modals-root', file: 'components/modals.html' },
        { id: 'footer-root', file: 'components/footer.html' }
    ];

    for (const comp of components) {
        const rootElem = document.getElementById(comp.id);
        if (rootElem && !rootElem.children.length) {
            try {
                const response = await fetch(comp.file);
                if (response.ok) {
                    const html = await response.text();
                    rootElem.innerHTML = html;
                }
            } catch (err) {
                console.warn(`Could not load component ${comp.file}:`, err);
            }
        }
    }
}

function initNavigation() {
    const navLinks = Array.from(document.querySelectorAll('.navbar .nav-link[href^="#"]'));
    const navbarMenu = document.getElementById('primaryNavbar');
    const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);

    function setActive(link) {
        navLinks.forEach(item => {
            item.classList.remove('active');
            item.removeAttribute('aria-current');
        });
        if (link) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            setActive(link);
            if (window.innerWidth < 992 && window.bootstrap && navbarMenu) {
                bootstrap.Collapse.getOrCreateInstance(navbarMenu, { toggle: false }).hide();
            }
        });
    });

    if ('IntersectionObserver' in window && sections.length) {
        const navObserver = new IntersectionObserver((entries) => {
            const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
            if (visible.length) {
                const activeId = '#' + visible[0].target.id;
                const activeLink = navLinks.find(link => link.getAttribute('href') === activeId);
                setActive(activeLink);
            }
        }, { threshold: 0.35, rootMargin: '-10% 0px -40% 0px' });

        sections.forEach(sec => navObserver.observe(sec));
    }
}

function initScrollReveal() {
    const revealItems = document.querySelectorAll('.reveal');
    if (!revealItems.length) return;

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        revealItems.forEach(item => revealObserver.observe(item));
    } else {
        revealItems.forEach(item => item.classList.add('is-visible'));
    }
}

function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    if (!counters.length) return;

    let animated = false;

    function countUp() {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const prefix = counter.getAttribute('data-prefix') || '';
            const suffix = counter.getAttribute('data-suffix') || '';
            let count = 0;
            const speed = target / 30;

            const updateCount = () => {
                count += speed;
                if (count < target) {
                    counter.innerText = prefix + Math.ceil(count) + suffix;
                    setTimeout(updateCount, 40);
                } else {
                    counter.innerText = prefix + target + suffix;
                }
            };
            updateCount();
        });
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                countUp();
                animated = true;
            }
        });
    }, { threshold: 0.5 });

    const statsStrip = document.querySelector('.stats-strip');
    if (statsStrip) observer.observe(statsStrip);
}

function initPortfolioFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('projectSearchInput');
    const projectItems = document.querySelectorAll('.portfolio-item');

    let currentCategory = 'all';
    let currentSearch = '';

    function filterProjects() {
        projectItems.forEach(item => {
            const category = item.getAttribute('data-category') || '';
            const title = (item.querySelector('h3')?.textContent || '').toLowerCase();
            const desc = (item.querySelector('p')?.textContent || '').toLowerCase();
            const tags = (item.querySelector('.project-meta')?.textContent || '').toLowerCase();

            const matchesCategory = currentCategory === 'all' || category.includes(currentCategory);
            const matchesSearch = !currentSearch || title.includes(currentSearch) || desc.includes(currentSearch) || tags.includes(currentSearch);

            if (matchesCategory && matchesSearch) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 50);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 250);
            }
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-filter') || 'all';
            filterProjects();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value.trim().toLowerCase();
            filterProjects();
        });
    }
}

function initCertLightbox() {
    const lightbox = document.getElementById('certLightbox');
    const lightboxTitle = document.getElementById('certLightboxTitle');
    const lightboxImage = document.getElementById('certLightboxImage');

    if (!lightbox) return;

    function openLightbox(title, imageSrc) {
        if (lightboxTitle) lightboxTitle.textContent = title;
        if (lightboxImage) lightboxImage.src = imageSrc;
        lightbox.classList.add('is-active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('is-active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.cert-preview').forEach(button => {
        button.addEventListener('click', () => {
            openLightbox(button.dataset.certTitle, button.dataset.certImage);
        });
    });

    document.querySelectorAll('[data-cert-close]').forEach(button => {
        button.addEventListener('click', closeLightbox);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('is-active')) {
            closeLightbox();
        }
    });
}
function initCyberTerminal() {
    const terminalModal = document.getElementById('cyberTerminalModal');
    const terminalOpenBtns = document.querySelectorAll('[data-open-terminal]');
    const terminalCloseBtns = document.querySelectorAll('[data-close-terminal]');
    const terminalInput = document.getElementById('terminalInput');
    const terminalOutput = document.getElementById('terminalOutput');

    if (!terminalModal || !terminalInput || !terminalOutput) return;

    function openTerminal() {
        terminalModal.classList.add('is-active');
        terminalModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        setTimeout(() => terminalInput.focus(), 100);
    }

    function closeTerminal() {
        terminalModal.classList.remove('is-active');
        terminalModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    terminalOpenBtns.forEach(btn => btn.addEventListener('click', openTerminal));
    terminalCloseBtns.forEach(btn => btn.addEventListener('click', closeTerminal));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && terminalModal.classList.contains('is-active')) {
            closeTerminal();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (terminalModal.classList.contains('is-active')) closeTerminal();
            else openTerminal();
        }
    });

    const commands = {
        help: `Available commands:
  <span style="color:var(--primary);">whoami</span>       - Display information about Denmar Redondo
  <span style="color:var(--primary);">skills</span>       - List tech stack & domain expertise
  <span style="color:var(--primary);">projects</span>     - Display featured cybersecurity & web projects
  <span style="color:var(--primary);">certs</span>        - Show certifications and achievements
  <span style="color:var(--primary);">contact</span>      - Get social & email contact info
  <span style="color:var(--primary);">clear</span>        - Clear terminal history
  <span style="color:var(--primary);">exit</span>         - Close terminal modal`,

        whoami: `Denmar Redondo - IT Student & Cyber Enthusiast
Specialization: Network Infrastructure, Cybersecurity, Frontend Web Development.
Goal: Engineering robust, secure, and intuitive digital experiences.`,

        skills: `[Networking]   Cisco IOS, Routing, IP Config, Protocols
[Cybersec]     CTF Competitions, Cryptography, Phishing Defense, Network Security
[Development]  HTML5, CSS3, JavaScript, REST APIs, Bootstrap, Git
[Tools]        VS Code, Docker, DBeaver, Power BI, Postman, Cisco Packet Tracer`,

        projects: `1. CyberShield      - Interactive Cybersecurity Learning Platform
2. Weather Hub      - Live Weather API Integration Platform
3. AXIS             - REST Countries Explorer
4. Huawei Matebook  - UI Product Showcase
5. Amsterdam        - Visual Destination Website
6. Black Clover     - Interactive Media Gallery`,

        certs: `- Power BI for Beginners (Simplilearn / Microsoft)
- Data Analytics Fundamentals (DataSense)
- EduCTF 2026 COMSOC Hacking Competition (6th Place)
- Cisco Networking Basics (Cisco Networking Academy & DICT-ITU)`,

        contact: `Email:    dnmrrdnd@gmail.com
LinkedIn: linkedin.com/in/denmar-redondo
GitHub:   github.com/Denscape`
    };

    document.querySelectorAll('[data-term-cmd]').forEach(chip => {
        chip.addEventListener('click', () => {
            const cmd = chip.getAttribute('data-term-cmd');
            if (cmd) runCommand(cmd);
        });
    });

    function runCommand(inputVal) {
        appendOutput(`<div style="margin-top:0.6rem;"><span style="color:var(--primary); font-weight:700;">visitor@denscape:~$</span> ${escapeHTML(inputVal)}</div>`);

        if (inputVal === 'clear') {
            terminalOutput.innerHTML = '';
            return;
        }

        if (inputVal === 'exit' || inputVal === 'gui') {
            closeTerminal();
            return;
        }

        if (commands[inputVal]) {
            appendOutput(`<div style="color: #cbd5e1; margin-bottom: 0.6rem;">${commands[inputVal]}</div>`);
        } else {
            appendOutput(`<div style="color:#ef4444; margin-bottom:0.6rem;">Command not found: '${escapeHTML(inputVal)}'. Type '<span style="color:var(--primary);">help</span>' for available options.</div>`);
        }

        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const inputVal = terminalInput.value.trim().toLowerCase();
            terminalInput.value = '';
            if (!inputVal) return;
            runCommand(inputVal);
        }
    });

    function appendOutput(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        terminalOutput.appendChild(div);
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[tag] || tag));
    }
}

function initCopyUtilities() {
    const copyBtns = document.querySelectorAll('[data-copy]');

    copyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const textToCopy = btn.getAttribute('data-copy');
            if (!textToCopy) return;

            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast(`Copied "${textToCopy}" to clipboard!`);
            }).catch(() => {
                showToast('Failed to copy text.');
            });
        });
    });

    initBackToTop();
}

function initBackToTop() {
    let btn = document.getElementById('backToTopBtn');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'backToTopBtn';
        btn.className = 'back-to-top';
        btn.setAttribute('aria-label', 'Back to top');
        btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
        document.body.appendChild(btn);
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            btn.classList.add('is-visible');
        } else {
            btn.classList.remove('is-visible');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--primary);"></i> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
