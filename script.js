/**
 * ARSENIO - Siswa SMK RPL Personal Portfolio
 * Vanilla JavaScript (Interactive features, animations, form validation)
 */
import {
  db,
  doc,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch
} from './src/firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. PRELOADER
  // ==========================================
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('fade-out');
      }, 400);
    });
    // Fallback if window already loaded
    setTimeout(() => {
      preloader.classList.add('fade-out');
    }, 1200);
  }

  // ==========================================
  // 2. THEME TOGGLE (DARK / LIGHT MODE)
  // ==========================================
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const htmlRoot = document.documentElement;

  // Retrieve saved preference or default to dark mode
  const savedTheme = localStorage.getItem('arsenio_theme') || 'dark';
  setTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isDark = htmlRoot.classList.contains('dark');
      const newTheme = isDark ? 'light' : 'dark';
      setTheme(newTheme);
      localStorage.setItem('arsenio_theme', newTheme);
    });
  }

  function setTheme(theme) {
    if (theme === 'light') {
      htmlRoot.classList.remove('dark');
      htmlRoot.classList.add('light');
      if (themeIcon) {
        themeIcon.className = 'fa-solid fa-sun';
      }
    } else {
      htmlRoot.classList.remove('light');
      htmlRoot.classList.add('dark');
      if (themeIcon) {
        themeIcon.className = 'fa-solid fa-moon';
      }
    }
  }

  // ==========================================
  // 3. SCROLL PROGRESS BAR & HEADER SCROLLED
  // ==========================================
  const progressBar = document.getElementById('scroll-progress');
  const header = document.getElementById('header');
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${scrollPercent}%`;
    }

    if (header) {
      if (scrollTop > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    if (backToTopBtn) {
      if (scrollTop > 350) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ==========================================
  // 4. MOBILE NAVIGATION (HAMBURGER)
  // ==========================================
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ==========================================
  // 5. ACTIVE NAV MENU ON SCROLL (SCROLL SPY)
  // ==========================================
  const sections = document.querySelectorAll('section[id]');

  function updateActiveNav() {
    const scrollY = window.pageYOffset + 120;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop;
      const sectionId = current.getAttribute('id');
      const targetNavLink = document.querySelector(`.nav-menu a[href*='${sectionId}']`);

      if (targetNavLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          targetNavLink.classList.add('active');
        } else {
          targetNavLink.classList.remove('active');
        }
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav);

  // ==========================================
  // 6. TYPING EFFECT IN HERO SECTION
  // ==========================================
  const typingElement = document.getElementById('typing-text');
  let typeTimeoutId = null;

  function restartTypingEffect() {
    if (typeTimeoutId) {
      clearTimeout(typeTimeoutId);
      typeTimeoutId = null;
    }
    if (!typingElement) return;

    const profile = getProfile();
    const words = (Array.isArray(profile.typingRoles) && profile.typingRoles.length > 0)
      ? profile.typingRoles
      : ['Web Developer', 'RPL Student', 'Tech Enthusiast'];

    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 110;

    function typeLoop() {
      if (!typingElement) return;
      const currentWord = words[wordIndex] || 'Web Developer';

      if (isDeleting) {
        typingElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
      } else {
        typingElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 120;
      }

      if (!isDeleting && charIndex === currentWord.length) {
        // Pause at end of word
        isDeleting = true;
        typingSpeed = 1600;
      } else if (isDeleting && charIndex === 0) {
        // Switch to next word
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typingSpeed = 400;
      }

      typeTimeoutId = setTimeout(typeLoop, typingSpeed);
    }

    typeLoop();
  }

  // Start typing after initial load
  setTimeout(restartTypingEffect, 800);

  // ==========================================
  // 7. SCROLL REVEAL ANIMATION (IntersectionObserver)
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // ==========================================
  // 8. BUTTON RIPPLE EFFECT
  // ==========================================
  const rippleButtons = document.querySelectorAll('.ripple-btn');

  rippleButtons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const circle = document.createElement('span');
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.classList.add('ripple');

      const existingRipple = this.querySelector('.ripple');
      if (existingRipple) {
        existingRipple.remove();
      }

      this.appendChild(circle);
    });
  });

  // ==========================================
  // 9. CUSTOM CURSOR (DESKTOP)
  // ==========================================
  const cursorDot = document.getElementById('cursor-dot');
  const cursorOutline = document.getElementById('cursor-outline');

  if (cursorDot && cursorOutline && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let outlineX = mouseX;
    let outlineY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    function animateOutline() {
      outlineX += (mouseX - outlineX) * 0.15;
      outlineY += (mouseY - outlineY) * 0.15;

      cursorOutline.style.left = `${outlineX}px`;
      cursorOutline.style.top = `${outlineY}px`;

      requestAnimationFrame(animateOutline);
    }
    animateOutline();

    // Hover scale effects on interactive elements
    const hoverables = document.querySelectorAll('a, button, .project-card, .skill-card, .service-card, input, textarea');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.6)';
        cursorOutline.style.borderColor = 'rgba(6, 182, 212, 0.8)';
      });
      el.addEventListener('mouseleave', () => {
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorOutline.style.borderColor = 'rgba(6, 182, 212, 0.45)';
      });
    });
  }

  // ==========================================
  // 10. DYNAMIC DATA STORES & STORAGE INITIALIZATION
  // ==========================================
  const DEFAULT_PROFILE = {
    name: "Arsenio",
    school: "SMK Krian 1 Sidoarjo",
    major: "Rekayasa Perangkat Lunak (RPL)",
    grade: "XI RPL",
    tagText: "HELLO, I'M",
    statusAvail: "Open for Projects & PKL",
    headlinePrefix: "RPL Student & ",
    typingRoles: ["Web Developer", "UI/UX Enthusiast", "IoT Explorer", "Gamer & Swimmer"],
    heroDesc: "Saya seorang siswa Rekayasa Perangkat Lunak yang tertarik pada web development, programming, dan teknologi. Saya terus belajar dan membuat berbagai project untuk mengembangkan kemampuan saya.",
    avatar: "assets/profile.jpg",
    focus: "Web Development & UI/UX",
    hobbies: "Gaming & Swimming",
    location: "Sidoarjo, Jawa Timur, Indonesia",
    storyTitle: "Halo! Saya Arsenio, Siswa RPL yang Menyukai Dunia Web & Kreativitas Digital.",
    quote: "Belajar, membuat, mencoba, dan terus berkembang.",
    story1: "Saya saat ini menempuh pendidikan di SMK Krian 1 Sidoarjo pada jurusan Rekayasa Perangkat Lunak (RPL), duduk di bangku kelas XI RPL. Ketertarikan saya pada dunia komputer berawal dari rasa ingin tahu bagaimana sebuah website dan sistem interaktif dibuat dari baris-baris kode.",
    story2: "Melalui kurikulum kejuruan dan eksplorasi mandiri, saya mulai memahami logika pemrograman, pembuatan layout web yang rapi, hingga integrasi database dan mikrokontroler IoT seperti ESP32. Di luar rutinitas belajar dan coding, saya menikmati waktu luang dengan bermain game untuk melatih strategi serta berenang untuk menjaga kebugaran tubuh.",
    email: "arsenio.rpl@gmail.com",
    github: "https://github.com/arsenio-rpl",
    instagram: "https://instagram.com/arsenio.rpl",
    instagramHandle: "@arsenio.rpl"
  };

  const DEFAULT_PROJECTS = [
    {
      id: '1',
      title: 'Smart Trash Bin (IoT ESP32)',
      category: 'IoT & Hardware',
      img: 'assets/project1.jpg',
      desc: 'Project IoT berbasis ESP32 dengan sensor untuk mendeteksi jenis sampah dan mengontrol sistem tempat sampah secara otomatis. Dilengkapi servo otomatis untuk membuka tutup tempat sampah ketika ada objek mendekat dan modul pemilah sampah sederhana.',
      tags: ['ESP32', 'Sensor Ultrasonik', 'Servo SG90', 'Website Dashboard'],
      role: 'Hardware wiring, sketch programming C++, and Web Status Dashboard',
      duration: 'Tugas Praktek RPL 2026',
      github: 'https://github.com/arsenio-rpl/smart-trash-bin-esp32'
    },
    {
      id: '2',
      title: 'Smart Door Lock (RFID & ESP32)',
      category: 'IoT Security',
      img: 'assets/project2.jpg',
      desc: 'Prototype sistem kunci pintu pintar menggunakan kartu RFID RC522 dan mikrokontroler ESP32. Sistem terhubung ke web dashboard sekolah untuk memantau log pembukaan pintu, status akses siswa/guru, dan otentikasi darurat.',
      tags: ['ESP32/Arduino', 'RFID RC522', 'Web API', 'MySQL Log'],
      role: 'Integrasi hardware RFID, pembacaan UID, dan backend web logger',
      duration: 'Project Kolaborasi Siswa RPL 2025',
      github: 'https://github.com/arsenio-rpl/smart-door-lock-rfid'
    },
    {
      id: '3',
      title: 'Website Top Up Game Online',
      category: 'Web Application',
      img: 'assets/project3.jpg',
      desc: 'Website toko top up voucher game dengan tampilan modern bergaya dark mode futuristic. Mengimplementasikan katalog game populer, kalkulasi otomatis nominal top up, validasi ID player, dan simulasi proses pembayaran.',
      tags: ['HTML5', 'CSS3', 'JavaScript', 'PHP Native', 'MySQL'],
      role: 'Frontend UI/UX design & backend script CRUD order',
      duration: 'Project Tugas Pemrograman Web 2025',
      github: 'https://github.com/arsenio-rpl/game-topup-store'
    },
    {
      id: '4',
      title: 'SchoolHub - Portal Informasi Sekolah',
      category: 'School System',
      img: 'assets/project4.jpg',
      desc: 'Konsep website informasi sekolah lengkap dengan dashboard admin untuk mempublikasikan artikel berita sekolah, agenda kegiatan, pengumuman ujian, serta database sederhana profil guru dan siswa.',
      tags: ['HTML', 'CSS Grid', 'JavaScript', 'PHP', 'Database MySQL'],
      role: 'Perancangan template dashboard, database schema, and CRUD',
      duration: 'Project Akhir Semester RPL 2026',
      github: 'https://github.com/arsenio-rpl/schoolhub-smk-portal'
    }
  ];

  const DEFAULT_SKILLS = [
    {
      id: 'skill-1',
      name: 'HTML',
      iconClass: 'fa-brands fa-html5',
      iconColorClass: 'html-icon',
      level: 'Intermediate',
      percent: 85,
      desc: 'Mampu menyusun struktur semantik dokumen web standar yang ramah SEO dan mudah diakses.'
    },
    {
      id: 'skill-2',
      name: 'CSS',
      iconClass: 'fa-brands fa-css3-alt',
      iconColorClass: 'css-icon',
      level: 'Intermediate',
      percent: 80,
      desc: 'Membuat styling modern, layout Flexbox & CSS Grid, animasi halus, serta adaptasi tema gelap.'
    },
    {
      id: 'skill-3',
      name: 'JavaScript',
      iconClass: 'fa-brands fa-js',
      iconColorClass: 'js-icon',
      level: 'Intermediate',
      percent: 75,
      desc: 'Manipulasi DOM interaktif, event listeners, logika dasar algoritma, serta komunikasi data asynchronous.'
    },
    {
      id: 'skill-4',
      name: 'PHP',
      iconClass: 'fa-brands fa-php',
      iconColorClass: 'php-icon',
      level: 'Intermediate',
      percent: 70,
      desc: 'Pembuatan backend sederhana, pengolahan form input, penanganan session, dan sistem logika CRUD.'
    },
    {
      id: 'skill-5',
      name: 'MySQL',
      iconClass: 'fa-solid fa-database',
      iconColorClass: 'mysql-icon',
      level: 'Intermediate',
      percent: 75,
      desc: 'Perancangan tabel relasional, penulisan query dasar SELECT, INSERT, UPDATE, DELETE, dan relasi tabel.'
    },
    {
      id: 'skill-6',
      name: 'Git',
      iconClass: 'fa-brands fa-git-alt',
      iconColorClass: 'git-icon',
      level: 'Beginner',
      percent: 65,
      desc: 'Version control dasar untuk menyimpan history perubahan kode, commit, push, dan manajemen repository GitHub.'
    },
    {
      id: 'skill-7',
      name: 'UI/UX',
      iconClass: 'fa-solid fa-palette',
      iconColorClass: 'uiux-icon',
      level: 'Intermediate',
      percent: 75,
      desc: 'Pemahaman hirarki visual, konsistensi warna, tipografi, dan perancangan antarmuka pengguna yang nyaman.'
    },
    {
      id: 'skill-8',
      name: 'Responsive Web Design',
      iconClass: 'fa-solid fa-mobile-screen-button',
      iconColorClass: 'rwd-icon',
      level: 'Intermediate',
      percent: 85,
      desc: 'Memastikan tampilan website optimal dan proporsional di berbagai ukuran layar: HP, tablet, laptop, dan desktop.'
    }
  ];

  // ==========================================
  // 10B. FIREBASE FIRESTORE CLOUD DATABASE INTEGRATION
  // ==========================================
  let isFirestoreConnected = false;

  function handleFirestoreError(error, operationType, entityType) {
    const errorInfo = {
      code: error?.code || 'unknown',
      message: error?.message || 'Unknown error occurred',
      operation: operationType,
      entity: entityType,
      timestamp: new Date().toISOString()
    };
    console.error(`[Firebase Firestore Error] ${operationType} on ${entityType}:`, errorInfo);
    return errorInfo;
  }

  function initFirebaseDatabase() {
    try {
      if (db) {
        isFirestoreConnected = true;
        updateFirebaseStatusIndicator('online');
        setupFirestoreRealtimeListeners();
        console.log('Firebase Firestore modular client successfully active.');
      } else {
        updateFirebaseStatusIndicator('offline');
      }
    } catch (err) {
      console.warn('Firebase initialization error, fallback to local cache:', err);
      updateFirebaseStatusIndicator('offline');
    }
  }

  function updateFirebaseStatusIndicator(status) {
    const badge = document.getElementById('firebase-status-badge');
    if (badge) {
      if (status === 'online') {
        badge.style.background = 'rgba(16, 185, 129, 0.15)';
        badge.style.color = '#10b981';
        badge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        badge.innerHTML = '<i class="fa-solid fa-cloud"></i> <span>Firestore Cloud Connected</span>';
      } else if (status === 'syncing') {
        badge.style.background = 'rgba(59, 130, 246, 0.15)';
        badge.style.color = '#3b82f6';
        badge.style.borderColor = 'rgba(59, 130, 246, 0.3)';
        badge.innerHTML = '<i class="fa-solid fa-rotate fa-spin"></i> <span>Syncing Cloud...</span>';
      } else {
        badge.style.background = 'rgba(245, 158, 11, 0.15)';
        badge.style.color = '#f59e0b';
        badge.style.borderColor = 'rgba(245, 158, 11, 0.3)';
        badge.innerHTML = '<i class="fa-solid fa-hard-drive"></i> <span>Local DB Mode</span>';
      }
    }
  }

  // Storage access helpers
  function getProfile() {
    try {
      const stored = localStorage.getItem('arsenio_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_PROFILE, ...parsed };
        }
      }
    } catch (e) {
      console.error('Error reading profile from localStorage:', e);
    }
    return { ...DEFAULT_PROFILE };
  }

  function saveProfile(profileData, skipCloud = false) {
    try {
      localStorage.setItem('arsenio_profile', JSON.stringify(profileData));
    } catch (e) {
      console.error('Error saving profile to localStorage:', e);
    }

    if (!skipCloud && db) {
      updateFirebaseStatusIndicator('syncing');
      setDoc(doc(db, 'settings', 'profile'), {
        ...profileData,
        updatedAt: new Date().toISOString()
      }, { merge: true })
        .then(() => {
          updateFirebaseStatusIndicator('online');
        })
        .catch(err => {
          handleFirestoreError(err, 'WRITE/SET', 'settings/profile');
          updateFirebaseStatusIndicator('online');
        });
    }
  }

  function getProjects() {
    try {
      const stored = localStorage.getItem('arsenio_projects');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error reading projects from localStorage:', e);
    }
    return DEFAULT_PROJECTS;
  }

  function saveProjects(projects, skipCloud = false) {
    try {
      localStorage.setItem('arsenio_projects', JSON.stringify(projects));
    } catch (e) {
      console.error('Error saving projects to localStorage:', e);
    }

    if (!skipCloud && db) {
      updateFirebaseStatusIndicator('syncing');
      const batch = writeBatch(db);
      projects.forEach((proj, idx) => {
        const docRef = doc(db, 'projects', String(proj.id));
        batch.set(docRef, {
          title: proj.title || '',
          category: proj.category || '',
          duration: proj.duration || '',
          img: proj.img || '',
          desc: proj.desc || '',
          tags: Array.isArray(proj.tags) ? proj.tags.join(', ') : (proj.tags || ''),
          role: proj.role || '',
          github: proj.github || '',
          order: idx,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      });

      batch.commit()
        .then(() => updateFirebaseStatusIndicator('online'))
        .catch(err => {
          handleFirestoreError(err, 'BATCH_WRITE', 'projects');
          updateFirebaseStatusIndicator('online');
        });
    }
  }

  function getSkills() {
    try {
      const stored = localStorage.getItem('arsenio_skills');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error reading skills from localStorage:', e);
    }
    return DEFAULT_SKILLS;
  }

  function saveSkills(skills, skipCloud = false) {
    try {
      localStorage.setItem('arsenio_skills', JSON.stringify(skills));
    } catch (e) {
      console.error('Error saving skills to localStorage:', e);
    }

    if (!skipCloud && db) {
      updateFirebaseStatusIndicator('syncing');
      const batch = writeBatch(db);
      skills.forEach((sk, idx) => {
        const docRef = doc(db, 'skills', String(sk.id));
        batch.set(docRef, {
          name: sk.name || '',
          level: sk.level || 'Intermediate',
          percent: Number(sk.percent) || 75,
          iconClass: sk.iconClass || 'fa-solid fa-code',
          iconColorClass: sk.iconColorClass || 'code-icon',
          desc: sk.desc || '',
          order: idx,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      });

      batch.commit()
        .then(() => updateFirebaseStatusIndicator('online'))
        .catch(err => {
          handleFirestoreError(err, 'BATCH_WRITE', 'skills');
          updateFirebaseStatusIndicator('online');
        });
    }
  }

  function getInbox() {
    try {
      const stored = localStorage.getItem('arsenio_inbox');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function saveInbox(messages) {
    try {
      localStorage.setItem('arsenio_inbox', JSON.stringify(messages));
    } catch (e) {
      console.error('Error saving inbox messages:', e);
    }
  }

  function deleteCloudProject(projectId) {
    if (!db || !projectId) return;
    deleteDoc(doc(db, 'projects', String(projectId)))
      .catch(err => handleFirestoreError(err, 'DELETE', `projects/${projectId}`));
  }

  function deleteCloudSkill(skillId) {
    if (!db || !skillId) return;
    deleteDoc(doc(db, 'skills', String(skillId)))
      .catch(err => handleFirestoreError(err, 'DELETE', `skills/${skillId}`));
  }

  function saveCloudMessage(messageData) {
    if (!db) return;
    const msgId = String(messageData.id || Date.now());
    setDoc(doc(db, 'messages', msgId), {
      name: messageData.name || '',
      email: messageData.email || '',
      message: messageData.message || '',
      createdAt: new Date().toISOString()
    }).catch(err => handleFirestoreError(err, 'WRITE/CREATE', `messages/${msgId}`));
  }

  function deleteCloudMessage(msgId) {
    if (!db || !msgId) return;
    deleteDoc(doc(db, 'messages', String(msgId)))
      .catch(err => handleFirestoreError(err, 'DELETE', `messages/${msgId}`));
  }

  // Real-time Firestore Listeners
  function setupFirestoreRealtimeListeners() {
    if (!db) return;

    // 1. Profile document listener
    onSnapshot(doc(db, 'settings', 'profile'), (snapshot) => {
      if (snapshot.exists()) {
        const cloudProfile = snapshot.data();
        if (cloudProfile && cloudProfile.name) {
          localStorage.setItem('arsenio_profile', JSON.stringify({ ...DEFAULT_PROFILE, ...cloudProfile }));
          renderProfile();
          if (document.getElementById('admin-panel-modal')?.classList.contains('active')) {
            populateProfileForm();
          }
        }
      } else {
        // First-time seed profile to Firestore
        const currentLocal = getProfile();
        setDoc(doc(db, 'settings', 'profile'), {
          ...currentLocal,
          updatedAt: new Date().toISOString()
        }).catch(err => handleFirestoreError(err, 'SEED_PROFILE', 'settings/profile'));
      }
    }, err => handleFirestoreError(err, 'LISTEN', 'settings/profile'));

    // 2. Projects collection listener
    onSnapshot(collection(db, 'projects'), (snapshot) => {
      if (!snapshot.empty) {
        const cloudProjects = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          cloudProjects.push({
            id: docSnap.id,
            title: d.title || '',
            category: d.category || 'Portfolio',
            duration: d.duration || '',
            img: d.img || 'assets/project1.jpg',
            desc: d.desc || '',
            tags: Array.isArray(d.tags) ? d.tags : (d.tags ? d.tags.split(',').map(t => t.trim()) : []),
            role: d.role || '',
            github: d.github || '',
            order: typeof d.order === 'number' ? d.order : 99
          });
        });

        cloudProjects.sort((a, b) => (a.order || 0) - (b.order || 0));
        localStorage.setItem('arsenio_projects', JSON.stringify(cloudProjects));
        renderProjects();
        if (document.getElementById('admin-panel-modal')?.classList.contains('active')) {
          renderAdminPanelData();
        }
      } else {
        // Seed projects to Firestore
        const curProj = getProjects();
        saveProjects(curProj);
      }
    }, err => handleFirestoreError(err, 'LISTEN', 'projects'));

    // 3. Skills collection listener
    onSnapshot(collection(db, 'skills'), (snapshot) => {
      if (!snapshot.empty) {
        const cloudSkills = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          cloudSkills.push({
            id: docSnap.id,
            name: d.name || '',
            level: d.level || 'Intermediate',
            percent: Number(d.percent) || 75,
            iconClass: d.iconClass || 'fa-solid fa-code',
            iconColorClass: d.iconColorClass || 'code-icon',
            desc: d.desc || '',
            order: typeof d.order === 'number' ? d.order : 99
          });
        });

        cloudSkills.sort((a, b) => (a.order || 0) - (b.order || 0));
        localStorage.setItem('arsenio_skills', JSON.stringify(cloudSkills));
        renderSkills();
        if (document.getElementById('admin-panel-modal')?.classList.contains('active')) {
          renderAdminPanelData();
        }
      } else {
        // Seed skills to Firestore
        const curSkills = getSkills();
        saveSkills(curSkills);
      }
    }, err => handleFirestoreError(err, 'LISTEN', 'skills'));

    // 4. Messages listener
    onSnapshot(collection(db, 'messages'), (snapshot) => {
      if (!snapshot.empty) {
        const cloudMsgs = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          const createdAt = d.createdAt ? new Date(d.createdAt) : new Date();
          const dateStr = createdAt.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          cloudMsgs.push({
            id: docSnap.id,
            name: d.name || '',
            email: d.email || '',
            message: d.message || '',
            date: dateStr
          });
        });

        localStorage.setItem('arsenio_inbox', JSON.stringify(cloudMsgs));
        const inboxCountEl = document.getElementById('tab-messages-count');
        if (inboxCountEl) inboxCountEl.textContent = cloudMsgs.length;
        if (document.getElementById('admin-panel-modal')?.classList.contains('active')) {
          renderAdminPanelData();
        }
      }
    }, err => handleFirestoreError(err, 'LISTEN', 'messages'));
  }

  function getAdminCreds() {
    try {
      const stored = localStorage.getItem('arsenio_admin_creds');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return { username: 'arsenio', password: 'arsenio123' };
  }

  function saveAdminCreds(creds) {
    localStorage.setItem('arsenio_admin_creds', JSON.stringify(creds));
  }

  function isAdminAuth() {
    return localStorage.getItem('arsenio_admin_auth') === 'true';
  }

  function setAdminAuth(isAuth) {
    localStorage.setItem('arsenio_admin_auth', isAuth ? 'true' : 'false');
    updateAdminUI();
  }

  // ==========================================
  // 11. MODALS UTILITIES & ESCAPE HANDLERS
  // ==========================================
  const projectModal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalImg = document.getElementById('modal-project-img');
  const modalTags = document.getElementById('modal-project-tags');
  const modalTitle = document.getElementById('modal-project-title');
  const modalDesc = document.getElementById('modal-project-desc');
  const modalMeta = document.getElementById('modal-project-meta');
  const modalDemoBtn = document.getElementById('modal-demo-btn');
  const modalCodeBtn = document.getElementById('modal-code-btn');

  const adminLoginModal = document.getElementById('admin-login-modal');
  const adminPanelModal = document.getElementById('admin-panel-modal');
  const projectFormModal = document.getElementById('project-form-modal');
  const skillFormModal = document.getElementById('skill-form-modal');

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    // Check if any other modal is still active
    const anyActive = document.querySelector('.modal-backdrop.active');
    if (!anyActive) {
      document.body.style.overflow = '';
    }
  }

  // Bind close buttons and backdrop clicks
  [
    { modal: projectModal, closeBtn: modalCloseBtn },
    { modal: adminLoginModal, closeBtn: document.getElementById('admin-login-close-btn') },
    { modal: adminLoginModal, closeBtn: document.getElementById('admin-login-cancel-btn') },
    { modal: adminPanelModal, closeBtn: document.getElementById('admin-panel-close-btn') },
    { modal: projectFormModal, closeBtn: document.getElementById('project-form-close-btn') },
    { modal: projectFormModal, closeBtn: document.getElementById('project-form-cancel-btn') },
    { modal: skillFormModal, closeBtn: document.getElementById('skill-form-close-btn') },
    { modal: skillFormModal, closeBtn: document.getElementById('skill-form-cancel-btn') }
  ].forEach(pair => {
    if (pair.closeBtn && pair.modal) {
      pair.closeBtn.addEventListener('click', () => closeModal(pair.modal));
    }
  });

  // Click outside to close
  [projectModal, adminLoginModal, adminPanelModal, projectFormModal, skillFormModal].forEach(m => {
    if (m) {
      m.addEventListener('click', (e) => {
        if (e.target === m) closeModal(m);
      });
    }
  });

  // Global ESC key to close active modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-backdrop.active');
      if (activeModal) closeModal(activeModal);
    }
  });

  // ==========================================
  // 12. DYNAMIC RENDERING: PROJECTS & SKILLS
  // ==========================================
  const projectsGrid = document.getElementById('projects-grid');
  const skillsGrid = document.getElementById('skills-grid');
  const skillsAdminActions = document.getElementById('skills-admin-actions');
  const projectsAdminActions = document.getElementById('projects-admin-actions');
  const adminNavContainer = document.getElementById('admin-nav-container');
  const adminFloatingBtn = document.getElementById('admin-floating-btn');

  function renderProjects() {
    if (!projectsGrid) return;
    const projects = getProjects();
    const isAdmin = isAdminAuth();

    projectsGrid.innerHTML = projects.map(proj => {
      const tagsHtml = (proj.tags || []).map(t => `<span class="tech-badge">${escapeHtml(t)}</span>`).join('');
      const adminActionsHtml = isAdmin ? `
        <div class="card-admin-bar">
          <span class="card-admin-tag"><i class="fa-solid fa-screwdriver-wrench"></i> Admin</span>
          <div class="card-admin-btns">
            <button type="button" class="btn-icon-admin edit btn-edit-proj" data-id="${proj.id}" title="Edit Project">
              <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>
            <button type="button" class="btn-icon-admin delete btn-del-proj" data-id="${proj.id}" title="Hapus Project">
              <i class="fa-solid fa-trash"></i> Hapus
            </button>
          </div>
        </div>
      ` : '';

      return `
        <article class="project-card reveal-on-scroll revealed" id="project-card-${proj.id}">
          <div class="project-image-container">
            <img src="${escapeHtml(proj.img)}" alt="${escapeHtml(proj.title)}" class="project-img" loading="lazy" onerror="this.src='assets/project1.jpg'" />
            <div class="project-badge-type">${escapeHtml(proj.category || 'Project')}</div>
          </div>
          <div class="project-content">
            <h3 class="project-title">${escapeHtml(proj.title)}</h3>
            <p class="project-desc">${escapeHtml(proj.desc)}</p>
            <div class="project-tech-stack">
              ${tagsHtml}
            </div>
            <div class="project-actions">
              <button type="button" class="btn btn-sm btn-primary project-modal-trigger" data-project="${proj.id}" aria-label="Lihat detail project ${escapeHtml(proj.title)}">
                <i class="fa-regular fa-eye"></i>
                <span>View Project</span>
              </button>
              <button type="button" class="btn btn-sm btn-outline source-code-btn" data-project="${proj.id}" aria-label="Lihat source code ${escapeHtml(proj.title)}">
                <i class="fa-brands fa-github"></i>
                <span>Source Code</span>
              </button>
            </div>
            ${adminActionsHtml}
          </div>
        </article>
      `;
    }).join('');

    // Bind Project Modal Details triggers
    projectsGrid.querySelectorAll('.project-modal-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-project');
        openProjectDetailModal(id);
      });
    });

    // Bind Source code triggers
    projectsGrid.querySelectorAll('.source-code-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-project');
        const proj = getProjects().find(p => p.id === id);
        if (proj) {
          showSourceCodeAlert(proj.title, proj.github || 'https://github.com/arsenio-rpl');
        }
      });
    });

    // Bind In-Card Admin Edit & Delete
    if (isAdmin) {
      projectsGrid.querySelectorAll('.btn-edit-proj').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          openProjectFormModal(id);
        });
      });

      projectsGrid.querySelectorAll('.btn-del-proj').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          confirmDeleteProject(id);
        });
      });
    }
  }

  function renderSkills() {
    if (!skillsGrid) return;
    const skills = getSkills();
    const isAdmin = isAdminAuth();

    skillsGrid.innerHTML = skills.map((skill, index) => {
      const levelClass = (skill.level || 'Intermediate').toLowerCase();
      const adminActionsHtml = isAdmin ? `
        <div class="card-admin-bar">
          <span class="card-admin-tag"><i class="fa-solid fa-screwdriver-wrench"></i> Admin</span>
          <div class="card-admin-btns">
            <button type="button" class="btn-icon-admin edit btn-edit-skill" data-id="${skill.id}" title="Edit Skill">
              <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>
            <button type="button" class="btn-icon-admin delete btn-del-skill" data-id="${skill.id}" title="Hapus Skill">
              <i class="fa-solid fa-trash"></i> Hapus
            </button>
          </div>
        </div>
      ` : '';

      return `
        <div class="skill-card reveal-on-scroll revealed" id="skill-${skill.id}">
          <div class="skill-head">
            <div class="skill-icon ${escapeHtml(skill.iconColorClass || 'html-icon')}">
              <i class="${escapeHtml(skill.iconClass || 'fa-solid fa-code')}"></i>
            </div>
            <span class="skill-level ${levelClass}">${escapeHtml(skill.level || 'Intermediate')}</span>
          </div>
          <h3 class="skill-name">${escapeHtml(skill.name)}</h3>
          <p class="skill-desc">${escapeHtml(skill.desc)}</p>
          <div class="skill-track" title="${skill.percent || 70}%">
            <div class="skill-bar ${levelClass}-bar" style="width: ${skill.percent || 70}%;"></div>
          </div>
          ${adminActionsHtml}
        </div>
      `;
    }).join('');

    // Bind In-Card Admin Edit & Delete for Skills
    if (isAdmin) {
      skillsGrid.querySelectorAll('.btn-edit-skill').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          openSkillFormModal(id);
        });
      });

      skillsGrid.querySelectorAll('.btn-del-skill').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          confirmDeleteSkill(id);
        });
      });
    }
  }

  function openProjectDetailModal(id) {
    const proj = getProjects().find(p => p.id === id);
    if (!proj || !projectModal) return;

    modalImg.src = proj.img || 'assets/project1.jpg';
    modalImg.alt = proj.title;
    modalTitle.textContent = proj.title;
    modalDesc.textContent = proj.desc;
    modalTags.innerHTML = (proj.tags || []).map(t => `<span class="badge">${escapeHtml(t)}</span>`).join('');

    modalMeta.innerHTML = `
      <div><strong>Kategori:</strong> ${escapeHtml(proj.category || 'Project')}</div>
      <div><strong>Peran Arsenio:</strong> ${escapeHtml(proj.role || 'Developer & UI/UX')}</div>
      <div><strong>Timeline:</strong> ${escapeHtml(proj.duration || 'Tugas RPL')}</div>
    `;

    modalCodeBtn.onclick = () => {
      showSourceCodeAlert(proj.title, proj.github || 'https://github.com/arsenio-rpl');
    };

    modalDemoBtn.onclick = () => {
      showDemoNotice(proj.title);
    };

    openModal(projectModal);
  }

  function showSourceCodeAlert(title, repoUrl) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Source Code Project',
        html: `
          <div style="text-align: left; font-size: 0.95rem; line-height: 1.6;">
            <p style="margin-bottom: 0.5rem;"><strong>Project:</strong> ${escapeHtml(title)}</p>
            <p style="margin-bottom: 0.75rem; color: #64748b;">Repository karya siswa SMK Krian 1 Sidoarjo (XI RPL).</p>
            <div style="background: #1e293b; padding: 10px 14px; border-radius: 8px; font-family: monospace; font-size: 0.85rem; color: #38bdf8; word-break: break-all;">
              git clone ${escapeHtml(repoUrl)}.git
            </div>
          </div>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: '<i class="fa-brands fa-github"></i> Buka GitHub',
        cancelButtonText: 'Tutup',
        confirmButtonColor: '#3b82f6',
        background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
        color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
      }).then((result) => {
        if (result.isConfirmed) {
          window.open(repoUrl, '_blank');
        }
      });
    } else {
      alert(`Repository URL:\n${repoUrl}`);
    }
  }

  function showDemoNotice(title) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Demo Preview',
        text: `Demo interaktif untuk "${title}" saat ini dipresentasikan pada lab komputer RPL SMK Krian 1 Sidoarjo atau simulator hardware lokal.`,
        icon: 'info',
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'Mengerti',
        background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
        color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
      });
    } else {
      alert(`Demo preview: ${title}`);
    }
  }

  // ==========================================
  // 13. ADMIN UI STATE & AUTHENTICATION
  // ==========================================
  function updateAdminUI() {
    const isAuth = isAdminAuth();

    // 1. Update Navbar Auth Box
    if (adminNavContainer) {
      if (isAuth) {
        adminNavContainer.innerHTML = `
          <div class="admin-live-badge open-admin-panel-btn" title="Klik untuk membuka Panel Admin">
            <span class="status-indicator"></span>
            <span>Admin</span>
          </div>
          <button type="button" class="btn btn-sm btn-primary open-admin-panel-btn" title="Buka Panel Kelola Data">
            <i class="fa-solid fa-gauge-high"></i>
            <span class="admin-nav-text">Panel</span>
          </button>
          <button type="button" class="btn btn-sm btn-outline text-danger admin-logout-trigger" title="Logout Admin">
            <i class="fa-solid fa-right-from-bracket"></i>
          </button>
        `;
      } else {
        adminNavContainer.innerHTML = `
          <button id="admin-login-nav-btn" class="btn btn-sm btn-outline admin-trigger-btn" type="button" aria-label="Login Admin Panel" title="Login Admin Panel">
            <i class="fa-solid fa-lock"></i>
            <span class="admin-nav-text">Admin</span>
          </button>
        `;
        const loginBtn = document.getElementById('admin-login-nav-btn');
        if (loginBtn) {
          loginBtn.addEventListener('click', () => openModal(adminLoginModal));
        }
      }
    }

    // 2. Update Floating Action Button
    if (adminFloatingBtn) {
      if (isAuth) {
        adminFloatingBtn.className = 'admin-floating-btn active-admin';
        adminFloatingBtn.innerHTML = `
          <span class="status-indicator"></span>
          <span class="floating-text">Panel Admin</span>
        `;
      } else {
        adminFloatingBtn.className = 'admin-floating-btn';
        adminFloatingBtn.innerHTML = `
          <i class="fa-solid fa-lock"></i>
          <span class="floating-text">Admin</span>
        `;
      }
    }

    // 3. Toggle section action bars
    if (skillsAdminActions) {
      skillsAdminActions.style.display = isAuth ? 'flex' : 'none';
    }
    if (projectsAdminActions) {
      projectsAdminActions.style.display = isAuth ? 'flex' : 'none';
    }
    const heroAdminActions = document.getElementById('hero-admin-actions');
    if (heroAdminActions) {
      heroAdminActions.style.display = isAuth ? 'flex' : 'none';
    }
    const aboutAdminActions = document.getElementById('about-admin-actions');
    if (aboutAdminActions) {
      aboutAdminActions.style.display = isAuth ? 'flex' : 'none';
    }

    // 4. Update counters
    const projCount = getProjects().length;
    const skillCount = getSkills().length;
    const inboxCount = getInbox().length;

    const elProjCount = document.getElementById('tab-projects-count');
    const elSkillCount = document.getElementById('tab-skills-count');
    const elInboxCount = document.getElementById('tab-messages-count');

    if (elProjCount) elProjCount.textContent = projCount;
    if (elSkillCount) elSkillCount.textContent = skillCount;
    if (elInboxCount) elInboxCount.textContent = inboxCount;

    // Bind open-admin-panel-btn and logout clicks
    document.querySelectorAll('.open-admin-panel-btn').forEach(b => {
      b.onclick = () => {
        renderAdminPanelData();
        openModal(adminPanelModal);
      };
    });

    document.querySelectorAll('.open-profile-tab-btn').forEach(b => {
      b.onclick = () => {
        openAdminPanelToTab('tab-profile');
      };
    });

    document.querySelectorAll('.admin-logout-trigger').forEach(b => {
      b.onclick = handleLogoutConfirmation;
    });

    // Re-render grids and profile to reflect state
    renderProfile();
    renderProjects();
    renderSkills();
  }

  // Admin Floating Button click
  if (adminFloatingBtn) {
    adminFloatingBtn.addEventListener('click', () => {
      if (isAdminAuth()) {
        renderAdminPanelData();
        openModal(adminPanelModal);
      } else {
        openModal(adminLoginModal);
      }
    });
  }

  // Password toggle in login modal
  const togglePassBtn = document.getElementById('toggle-admin-password');
  const adminPasswordInput = document.getElementById('admin-password');
  if (togglePassBtn && adminPasswordInput) {
    togglePassBtn.addEventListener('click', () => {
      const isPassword = adminPasswordInput.type === 'password';
      adminPasswordInput.type = isPassword ? 'text' : 'password';
      togglePassBtn.innerHTML = isPassword ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
    });
  }

  // Admin Login Form Submit
  const adminLoginForm = document.getElementById('admin-login-form');
  const adminUsernameInput = document.getElementById('admin-username');
  const adminLoginError = document.getElementById('admin-login-error');

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (adminLoginError) adminLoginError.textContent = '';

      const username = adminUsernameInput ? adminUsernameInput.value.trim() : '';
      const password = adminPasswordInput ? adminPasswordInput.value.trim() : '';
      const creds = getAdminCreds();

      if (!username || !password) {
        if (adminLoginError) adminLoginError.textContent = 'Harap isi username dan password!';
        return;
      }

      if (username === creds.username && password === creds.password) {
        // Success
        setAdminAuth(true);
        closeModal(adminLoginModal);
        adminLoginForm.reset();

        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Login Berhasil!',
            text: `Selamat datang kembali, ${username}! Anda sekarang dapat menambah, mengedit, dan menghapus portofolio Arsenio.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
            color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
          });
        }

        // Open admin panel
        setTimeout(() => {
          renderAdminPanelData();
          openModal(adminPanelModal);
        }, 400);
      } else {
        if (adminLoginError) adminLoginError.textContent = 'Username atau password salah! Cek info petunjuk di atas.';
        if (adminPasswordInput) adminPasswordInput.focus();
      }
    });
  }

  // Logout Handler with SweetAlert confirmation
  function handleLogoutConfirmation() {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Konfirmasi Logout',
        text: 'Apakah Anda yakin ingin keluar dari mode Admin?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Logout',
        cancelButtonText: 'Batal',
        background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
        color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
      }).then((result) => {
        if (result.isConfirmed) {
          setAdminAuth(false);
          closeModal(adminPanelModal);
          Swal.fire({
            title: 'Telah Logout',
            text: 'Mode Admin telah dinonaktifkan. Anda kini berada di tampilan publik.',
            icon: 'info',
            timer: 1500,
            showConfirmButton: false,
            background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
            color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
          });
        }
      });
    } else {
      if (confirm('Yakin ingin logout dari Admin?')) {
        setAdminAuth(false);
        closeModal(adminPanelModal);
      }
    }
  }

  const panelLogoutBtn = document.getElementById('panel-logout-btn');
  if (panelLogoutBtn) {
    panelLogoutBtn.addEventListener('click', handleLogoutConfirmation);
  }

  const firebaseSyncBtn = document.getElementById('firebase-sync-now-btn');
  if (firebaseSyncBtn) {
    firebaseSyncBtn.addEventListener('click', () => {
      updateFirebaseStatusIndicator('syncing');
      try {
        saveProfile(getProfile());
        saveProjects(getProjects());
        saveSkills(getSkills());
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Sinkronisasi Aktif',
            text: 'Data profil, proyek, dan skill berhasil dikirim ke database Cloud Firestore.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
            color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
          });
        }
      } catch (e) {
        console.error('Error during manual sync:', e);
      }
    });
  }

  // ==========================================
  // 14. ADMIN DASHBOARD PANEL: TABS & DATA LISTS
  // ==========================================
  const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
  const adminTabContents = document.querySelectorAll('.admin-tab-content');

  adminTabBtns.forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      const targetId = tabBtn.getAttribute('data-tab');
      adminTabBtns.forEach(b => b.classList.remove('active'));
      adminTabContents.forEach(c => c.classList.remove('active'));

      tabBtn.classList.add('active');
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  function openAdminPanelToTab(tabId = 'tab-profile') {
    renderAdminPanelData();
    populateProfileForm();
    adminTabBtns.forEach(b => {
      if (b.getAttribute('data-tab') === tabId) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
    adminTabContents.forEach(c => {
      if (c.id === tabId) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });
    openModal(adminPanelModal);
  }

  function renderAdminPanelData() {
    populateProfileForm();
    renderAdminProjectsList();
    renderAdminSkillsList();
    renderAdminMessagesList();

    // Update counters
    const elProjCount = document.getElementById('tab-projects-count');
    const elSkillCount = document.getElementById('tab-skills-count');
    const elInboxCount = document.getElementById('tab-messages-count');

    if (elProjCount) elProjCount.textContent = getProjects().length;
    if (elSkillCount) elSkillCount.textContent = getSkills().length;
    if (elInboxCount) elInboxCount.textContent = getInbox().length;
  }

  // Render Projects List in Panel
  const adminProjectsList = document.getElementById('admin-projects-list');
  function renderAdminProjectsList() {
    if (!adminProjectsList) return;
    const projects = getProjects();

    if (projects.length === 0) {
      adminProjectsList.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-folder-open"></i>
          <div class="empty-state-title">Belum ada project</div>
          <p>Klik tombol "Tambah Proyek Baru" di atas untuk menambahkan portofolio Anda.</p>
        </div>
      `;
      return;
    }

    adminProjectsList.innerHTML = projects.map(proj => `
      <div class="admin-item-card">
        <div class="admin-item-info">
          <img src="${escapeHtml(proj.img)}" alt="${escapeHtml(proj.title)}" class="admin-item-thumb" onerror="this.src='assets/project1.jpg'" />
          <div class="admin-item-text">
            <h5 class="admin-item-title">${escapeHtml(proj.title)}</h5>
            <div class="admin-item-meta">
              <span><i class="fa-solid fa-tag"></i> ${escapeHtml(proj.category || 'IoT / Web')}</span>
              <span>•</span>
              <span><i class="fa-solid fa-layer-group"></i> ${(proj.tags || []).join(', ')}</span>
            </div>
          </div>
        </div>
        <div class="admin-item-actions">
          <button type="button" class="btn btn-sm btn-outline btn-panel-edit-proj" data-id="${proj.id}">
            <i class="fa-solid fa-pen-to-square"></i> <span>Edit</span>
          </button>
          <button type="button" class="btn btn-sm btn-outline text-danger btn-panel-del-proj" data-id="${proj.id}">
            <i class="fa-solid fa-trash"></i> <span>Hapus</span>
          </button>
        </div>
      </div>
    `).join('');

    adminProjectsList.querySelectorAll('.btn-panel-edit-proj').forEach(b => {
      b.onclick = () => openProjectFormModal(b.getAttribute('data-id'));
    });

    adminProjectsList.querySelectorAll('.btn-panel-del-proj').forEach(b => {
      b.onclick = () => confirmDeleteProject(b.getAttribute('data-id'));
    });
  }

  // Render Skills List in Panel
  const adminSkillsList = document.getElementById('admin-skills-list');
  function renderAdminSkillsList() {
    if (!adminSkillsList) return;
    const skills = getSkills();

    if (skills.length === 0) {
      adminSkillsList.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-bolt"></i>
          <div class="empty-state-title">Belum ada skill</div>
          <p>Klik tombol "Tambah Skill Baru" di atas untuk memasukkan keahlian Anda.</p>
        </div>
      `;
      return;
    }

    adminSkillsList.innerHTML = skills.map(skill => `
      <div class="admin-item-card">
        <div class="admin-item-info">
          <div class="admin-skill-icon-wrap ${escapeHtml(skill.iconColorClass || 'html-icon')}">
            <i class="${escapeHtml(skill.iconClass || 'fa-solid fa-code')}"></i>
          </div>
          <div class="admin-item-text">
            <h5 class="admin-item-title">${escapeHtml(skill.name)}</h5>
            <div class="admin-item-meta">
              <span><i class="fa-solid fa-medal"></i> ${escapeHtml(skill.level || 'Intermediate')}</span>
              <span>•</span>
              <span>Penguasaan: ${skill.percent || 70}%</span>
            </div>
          </div>
        </div>
        <div class="admin-item-actions">
          <button type="button" class="btn btn-sm btn-outline btn-panel-edit-skill" data-id="${skill.id}">
            <i class="fa-solid fa-pen-to-square"></i> <span>Edit</span>
          </button>
          <button type="button" class="btn btn-sm btn-outline text-danger btn-panel-del-skill" data-id="${skill.id}">
            <i class="fa-solid fa-trash"></i> <span>Hapus</span>
          </button>
        </div>
      </div>
    `).join('');

    adminSkillsList.querySelectorAll('.btn-panel-edit-skill').forEach(b => {
      b.onclick = () => openSkillFormModal(b.getAttribute('data-id'));
    });

    adminSkillsList.querySelectorAll('.btn-panel-del-skill').forEach(b => {
      b.onclick = () => confirmDeleteSkill(b.getAttribute('data-id'));
    });
  }

  // Render Messages Inbox in Panel
  const adminMessagesList = document.getElementById('admin-messages-list');
  function renderAdminMessagesList() {
    if (!adminMessagesList) return;
    const inbox = getInbox();

    if (inbox.length === 0) {
      adminMessagesList.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-inbox"></i>
          <div class="empty-state-title">Kotak Masuk Kosong</div>
          <p>Belum ada pesan yang dikirimkan pengunjung website.</p>
        </div>
      `;
      return;
    }

    adminMessagesList.innerHTML = inbox.map(msg => `
      <div class="message-item-card">
        <div class="message-item-head">
          <div>
            <div class="message-sender-name">${escapeHtml(msg.name)}</div>
            <a href="mailto:${escapeHtml(msg.email)}" class="message-sender-email">
              <i class="fa-regular fa-envelope"></i> ${escapeHtml(msg.email)}
            </a>
          </div>
          <span class="message-date"><i class="fa-regular fa-clock"></i> ${escapeHtml(msg.date)}</span>
        </div>
        <div class="message-content-text">${escapeHtml(msg.message)}</div>
        <div class="message-item-actions">
          <a href="mailto:${escapeHtml(msg.email)}?subject=Balasan%20dari%20Arsenio%20(SMK%20RPL)&body=Halo%20${encodeURIComponent(msg.name)},%0A%0ATerima%20kasih%20telah%20menghubungi%20saya..." class="btn btn-sm btn-primary">
            <i class="fa-solid fa-reply"></i> Balas Email
          </a>
          <button type="button" class="btn btn-sm btn-outline text-danger btn-del-msg" data-id="${msg.id}">
            <i class="fa-solid fa-trash"></i> Hapus
          </button>
        </div>
      </div>
    `).join('');

    adminMessagesList.querySelectorAll('.btn-del-msg').forEach(b => {
      b.onclick = () => {
        const id = b.getAttribute('data-id');
        const updated = getInbox().filter(m => String(m.id) !== String(id));
        saveInbox(updated);
        deleteCloudMessage(id);
        renderAdminMessagesList();
        const el = document.getElementById('tab-messages-count');
        if (el) el.textContent = updated.length;
      };
    });
  }

  // Clear All Messages
  const clearAllMessagesBtn = document.getElementById('clear-all-messages-btn');
  if (clearAllMessagesBtn) {
    clearAllMessagesBtn.addEventListener('click', () => {
      const inbox = getInbox();
      if (inbox.length === 0) return;

      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: 'Hapus Semua Pesan?',
          text: 'Seluruh pesan masuk akan dihapus secara permanen.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#ef4444',
          cancelButtonColor: '#64748b',
          confirmButtonText: 'Ya, Hapus Semua',
          cancelButtonText: 'Batal',
          background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
          color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        }).then((res) => {
          if (res.isConfirmed) {
            inbox.forEach(m => deleteCloudMessage(m.id));
            saveInbox([]);
            renderAdminMessagesList();
            const el = document.getElementById('tab-messages-count');
            if (el) el.textContent = 0;
            Swal.fire({
              title: 'Berhasil',
              text: 'Kotak masuk telah dibersihkan.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false,
              background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
              color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
            });
          }
        });
      } else {
        if (confirm('Hapus semua pesan masuk?')) {
          inbox.forEach(m => deleteCloudMessage(m.id));
          saveInbox([]);
          renderAdminMessagesList();
        }
      }
    });
  }

  // ==========================================
  // 15. PROJECT CRUD HANDLERS
  // ==========================================
  const projectCrudForm = document.getElementById('project-crud-form');
  const projectFormModalTitle = document.getElementById('project-form-modal-title');
  const projectFormId = document.getElementById('project-form-id');
  const projectFormTitle = document.getElementById('project-form-title');
  const projectFormCategory = document.getElementById('project-form-category');
  const projectFormDuration = document.getElementById('project-form-duration');
  const projectFormImgPreset = document.getElementById('project-form-img-preset');
  const projectFormImgCustom = document.getElementById('project-form-img-custom');
  const projectFormDesc = document.getElementById('project-form-desc');
  const projectFormTags = document.getElementById('project-form-tags');
  const projectFormRole = document.getElementById('project-form-role');
  const projectFormGithub = document.getElementById('project-form-github');

  // Trigger buttons to open Project Add form
  const addProjectPageBtn = document.getElementById('add-project-page-btn');
  const panelAddProjectBtn = document.getElementById('panel-add-project-btn');

  if (addProjectPageBtn) addProjectPageBtn.addEventListener('click', () => openProjectFormModal());
  if (panelAddProjectBtn) panelAddProjectBtn.addEventListener('click', () => openProjectFormModal());

  // Image Preset vs Custom dropdown handler
  if (projectFormImgPreset && projectFormImgCustom) {
    projectFormImgPreset.addEventListener('change', () => {
      if (projectFormImgPreset.value === 'custom') {
        projectFormImgCustom.style.display = 'block';
        projectFormImgCustom.focus();
      } else {
        projectFormImgCustom.style.display = 'none';
      }
    });
  }

  function openProjectFormModal(id = null) {
    if (!projectFormModal) return;

    if (id) {
      // Edit mode
      const proj = getProjects().find(p => p.id === id);
      if (!proj) return;

      if (projectFormModalTitle) projectFormModalTitle.textContent = 'Edit Proyek Portofolio';
      if (projectFormId) projectFormId.value = proj.id;
      if (projectFormTitle) projectFormTitle.value = proj.title || '';
      if (projectFormCategory) projectFormCategory.value = proj.category || '';
      if (projectFormDuration) projectFormDuration.value = proj.duration || '';
      if (projectFormDesc) projectFormDesc.value = proj.desc || '';
      if (projectFormTags) projectFormTags.value = (proj.tags || []).join(', ');
      if (projectFormRole) projectFormRole.value = proj.role || '';
      if (projectFormGithub) projectFormGithub.value = proj.github || '';

      // Image selection
      const presets = ['assets/project1.jpg', 'assets/project2.jpg', 'assets/project3.jpg', 'assets/project4.jpg'];
      if (presets.includes(proj.img)) {
        projectFormImgPreset.value = proj.img;
        projectFormImgCustom.style.display = 'none';
        projectFormImgCustom.value = '';
      } else {
        projectFormImgPreset.value = 'custom';
        projectFormImgCustom.style.display = 'block';
        projectFormImgCustom.value = proj.img || '';
      }
    } else {
      // Add mode
      if (projectFormModalTitle) projectFormModalTitle.textContent = 'Tambah Proyek Baru';
      if (projectCrudForm) projectCrudForm.reset();
      if (projectFormId) projectFormId.value = '';
      if (projectFormImgCustom) projectFormImgCustom.style.display = 'none';
    }

    openModal(projectFormModal);
  }

  if (projectCrudForm) {
    projectCrudForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = projectFormTitle.value.trim();
      const category = projectFormCategory.value.trim();
      const desc = projectFormDesc.value.trim();
      const tagsRaw = projectFormTags.value.trim();

      if (!title || !category || !desc || !tagsRaw) {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Form Belum Lengkap',
            text: 'Harap isi Judul, Kategori, Deskripsi, dan Tech Stack.',
            icon: 'warning',
            confirmButtonColor: '#3b82f6',
            background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
            color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
          });
        } else {
          alert('Harap lengkapi field yang berbintang wajib!');
        }
        return;
      }

      // Determine Image URL
      let imgUrl = projectFormImgPreset.value;
      if (imgUrl === 'custom') {
        imgUrl = projectFormImgCustom.value.trim() || 'assets/project1.jpg';
      }

      const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
      const isEditing = Boolean(projectFormId.value);
      const currentProjects = getProjects();

      if (isEditing) {
        // Update existing
        const index = currentProjects.findIndex(p => p.id === projectFormId.value);
        if (index !== -1) {
          currentProjects[index] = {
            ...currentProjects[index],
            title,
            category,
            duration: projectFormDuration.value.trim() || 'Project RPL',
            img: imgUrl,
            desc,
            tags,
            role: projectFormRole.value.trim() || 'Software & Hardware Developer',
            github: projectFormGithub.value.trim() || 'https://github.com/arsenio-rpl'
          };
        }
      } else {
        // Create new project
        const newProj = {
          id: String(Date.now()),
          title,
          category,
          duration: projectFormDuration.value.trim() || 'Project Baru 2026',
          img: imgUrl,
          desc,
          tags,
          role: projectFormRole.value.trim() || 'Frontend & Backend Developer',
          github: projectFormGithub.value.trim() || 'https://github.com/arsenio-rpl'
        };
        currentProjects.unshift(newProj);
      }

      saveProjects(currentProjects);
      closeModal(projectFormModal);
      renderProjects();
      renderAdminPanelData();

      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: isEditing ? 'Proyek Diperbarui!' : 'Proyek Ditambahkan!',
          text: `Proyek "${title}" telah tersimpan di portofolio Arsenio.`,
          icon: 'success',
          timer: 1800,
          showConfirmButton: false,
          background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
          color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        });
      }
    });
  }

  function confirmDeleteProject(id) {
    const projects = getProjects();
    const target = projects.find(p => p.id === id);
    if (!target) return;

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Hapus Proyek Ini?',
        html: `Apakah Anda yakin ingin menghapus <strong>"${escapeHtml(target.title)}"</strong> dari portofolio?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Hapus Proyek',
        cancelButtonText: 'Batal',
        background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
        color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
      }).then((res) => {
        if (res.isConfirmed) {
          const updated = projects.filter(p => p.id !== id);
          deleteCloudProject(id);
          saveProjects(updated);
          renderProjects();
          renderAdminPanelData();
          Swal.fire({
            title: 'Terhapus!',
            text: `Proyek "${target.title}" telah dihapus.`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
            color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
          });
        }
      });
    } else {
      if (confirm(`Hapus project "${target.title}"?`)) {
        deleteCloudProject(id);
        saveProjects(projects.filter(p => p.id !== id));
        renderProjects();
        renderAdminPanelData();
      }
    }
  }

  // ==========================================
  // 16. SKILLS CRUD HANDLERS
  // ==========================================
  const skillCrudForm = document.getElementById('skill-crud-form');
  const skillFormModalTitle = document.getElementById('skill-form-modal-title');
  const skillFormId = document.getElementById('skill-form-id');
  const skillFormName = document.getElementById('skill-form-name');
  const skillFormLevel = document.getElementById('skill-form-level');
  const skillFormPercent = document.getElementById('skill-form-percent');
  const skillFormIconPreset = document.getElementById('skill-form-icon-preset');
  const skillFormDesc = document.getElementById('skill-form-desc');

  const addSkillPageBtn = document.getElementById('add-skill-page-btn');
  const panelAddSkillBtn = document.getElementById('panel-add-skill-btn');

  if (addSkillPageBtn) addSkillPageBtn.addEventListener('click', () => openSkillFormModal());
  if (panelAddSkillBtn) panelAddSkillBtn.addEventListener('click', () => openSkillFormModal());

  function openSkillFormModal(id = null) {
    if (!skillFormModal) return;

    if (id) {
      // Edit
      const skill = getSkills().find(s => s.id === id);
      if (!skill) return;

      if (skillFormModalTitle) skillFormModalTitle.textContent = 'Edit Keahlian (Skill)';
      if (skillFormId) skillFormId.value = skill.id;
      if (skillFormName) skillFormName.value = skill.name || '';
      if (skillFormLevel) skillFormLevel.value = skill.level || 'Intermediate';
      if (skillFormPercent) skillFormPercent.value = skill.percent || 75;
      if (skillFormDesc) skillFormDesc.value = skill.desc || '';

      // Match preset icon
      const combined = `${skill.iconClass}|${skill.iconColorClass}`;
      if (skillFormIconPreset) {
        const optionExists = Array.from(skillFormIconPreset.options).some(o => o.value === combined);
        if (optionExists) {
          skillFormIconPreset.value = combined;
        }
      }
    } else {
      // Add
      if (skillFormModalTitle) skillFormModalTitle.textContent = 'Tambah Skill Baru';
      if (skillCrudForm) skillCrudForm.reset();
      if (skillFormId) skillFormId.value = '';
      if (skillFormPercent) skillFormPercent.value = 75;
    }

    openModal(skillFormModal);
  }

  if (skillCrudForm) {
    skillCrudForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = skillFormName.value.trim();
      const desc = skillFormDesc.value.trim();
      const level = skillFormLevel.value;
      const percent = parseInt(skillFormPercent.value, 10) || 75;

      if (!name || !desc) {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Form Belum Lengkap',
            text: 'Harap isi Nama Skill dan Deskripsi.',
            icon: 'warning',
            confirmButtonColor: '#3b82f6',
            background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
            color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
          });
        }
        return;
      }

      const iconParts = (skillFormIconPreset.value || 'fa-solid fa-code|code-icon').split('|');
      const iconClass = iconParts[0] || 'fa-solid fa-code';
      const iconColorClass = iconParts[1] || 'code-icon';

      const isEditing = Boolean(skillFormId.value);
      const currentSkills = getSkills();

      if (isEditing) {
        const index = currentSkills.findIndex(s => s.id === skillFormId.value);
        if (index !== -1) {
          currentSkills[index] = {
            ...currentSkills[index],
            name,
            level,
            percent,
            iconClass,
            iconColorClass,
            desc
          };
        }
      } else {
        const newSkill = {
          id: `skill-${Date.now()}`,
          name,
          level,
          percent,
          iconClass,
          iconColorClass,
          desc
        };
        currentSkills.push(newSkill);
      }

      saveSkills(currentSkills);
      closeModal(skillFormModal);
      renderSkills();
      renderAdminPanelData();

      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: isEditing ? 'Skill Diperbarui!' : 'Skill Ditambahkan!',
          text: `Keahlian "${name}" telah disimpan ke daftar skill.`,
          icon: 'success',
          timer: 1800,
          showConfirmButton: false,
          background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
          color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        });
      }
    });
  }

  function confirmDeleteSkill(id) {
    const skills = getSkills();
    const target = skills.find(s => s.id === id);
    if (!target) return;

    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Hapus Skill Ini?',
        html: `Apakah Anda yakin ingin menghapus <strong>"${escapeHtml(target.name)}"</strong> dari daftar skills?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Hapus Skill',
        cancelButtonText: 'Batal',
        background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
        color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
      }).then((res) => {
        if (res.isConfirmed) {
          const updated = skills.filter(s => s.id !== id);
          deleteCloudSkill(id);
          saveSkills(updated);
          renderSkills();
          renderAdminPanelData();
          Swal.fire({
            title: 'Terhapus!',
            text: `Skill "${target.name}" telah dihapus.`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
            color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
          });
        }
      });
    } else {
      if (confirm(`Hapus skill "${target.name}"?`)) {
        deleteCloudSkill(id);
        saveSkills(skills.filter(s => s.id !== id));
        renderSkills();
        renderAdminPanelData();
      }
    }
  }

  // ==========================================
  // 17. SETTINGS: CHANGE PASSWORD & RESET TO DEFAULTS
  // ==========================================
  const changePasswordForm = document.getElementById('change-password-form');
  const oldPassInput = document.getElementById('old-pass');
  const newPassInput = document.getElementById('new-pass');
  const confirmPassInput = document.getElementById('confirm-pass');

  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentCreds = getAdminCreds();
      const oldPass = oldPassInput ? oldPassInput.value : '';
      const newPass = newPassInput ? newPassInput.value : '';
      const confirmPass = confirmPassInput ? confirmPassInput.value : '';

      if (oldPass !== currentCreds.password) {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Password Salah',
            text: 'Password saat ini yang Anda masukkan tidak sesuai.',
            icon: 'error',
            confirmButtonColor: '#ef4444',
            background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
            color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
          });
        } else {
          alert('Password saat ini salah!');
        }
        return;
      }

      if (newPass.length < 6) {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Password Terlalu Pendek',
            text: 'Password baru minimal harus berisi 6 karakter.',
            icon: 'warning',
            confirmButtonColor: '#3b82f6',
            background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
            color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
          });
        }
        return;
      }

      if (newPass !== confirmPass) {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Konfirmasi Tidak Cocok',
            text: 'Konfirmasi password baru tidak cocok dengan password baru.',
            icon: 'warning',
            confirmButtonColor: '#3b82f6',
            background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
            color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
          });
        }
        return;
      }

      // Save new password
      saveAdminCreds({ username: currentCreds.username, password: newPass });
      changePasswordForm.reset();

      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: 'Password Berhasil Diubah!',
          text: 'Gunakan password baru ini saat Anda login admin berikutnya.',
          icon: 'success',
          confirmButtonColor: '#3b82f6',
          background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
          color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        });
      }
    });
  }

  // Reset to Default Data
  const resetDefaultDataBtn = document.getElementById('reset-default-data-btn');
  if (resetDefaultDataBtn) {
    resetDefaultDataBtn.addEventListener('click', () => {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: 'Pulihkan Data Bawaan?',
          text: 'Seluruh proyek dan skill akan dikembalikan ke data awal sekolah (4 Proyek Default & 8 Skills). Perubahan yang belum dicadangkan akan hilang.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#f59e0b',
          cancelButtonColor: '#64748b',
          confirmButtonText: 'Ya, Reset Data',
          cancelButtonText: 'Batal',
          background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
          color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        }).then((res) => {
          if (res.isConfirmed) {
            saveProjects(DEFAULT_PROJECTS);
            saveSkills(DEFAULT_SKILLS);
            saveProfile(DEFAULT_PROFILE);
            renderProjects();
            renderSkills();
            renderProfile();
            restartTypingEffect();
            renderAdminPanelData();
            Swal.fire({
              title: 'Data Dipulihkan!',
              text: 'Portofolio Arsenio telah dikembalikan ke struktur bawaan.',
              icon: 'success',
              timer: 1800,
              showConfirmButton: false,
              background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
              color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
            });
          }
        });
      } else {
        if (confirm('Kembalikan ke data bawaan?')) {
          saveProjects(DEFAULT_PROJECTS);
          saveSkills(DEFAULT_SKILLS);
          saveProfile(DEFAULT_PROFILE);
          renderProjects();
          renderSkills();
          renderProfile();
          restartTypingEffect();
          renderAdminPanelData();
        }
      }
    });
  }

  // ==========================================
  // 17B. PROFILE RENDERING & EDIT PROFILE SYSTEM
  // ==========================================
  function renderProfile() {
    const p = getProfile();

    // Document Title
    if (p.name) {
      document.title = `${p.name} | Portofolio Siswa RPL SMK Krian 1 Sidoarjo`;
    }

    // 1. Hero Section Bindings
    const heroName = document.getElementById('hero-name');
    if (heroName) {
      heroName.innerHTML = `${escapeHtml(p.name)}<span class="accent-dot">.</span>`;
    }

    const heroTag = document.getElementById('hero-tag-text');
    if (heroTag) heroTag.textContent = p.tagText || "HELLO, I'M";

    const heroPrefix = document.getElementById('hero-static-prefix');
    if (heroPrefix) heroPrefix.textContent = p.headlinePrefix || 'RPL Student & ';

    const heroDesc = document.getElementById('hero-desc-text');
    if (heroDesc) heroDesc.textContent = p.heroDesc || '';

    const heroIgLink = document.getElementById('hero-instagram-link');
    if (heroIgLink && p.instagram) heroIgLink.href = p.instagram;

    const heroGhLink = document.getElementById('hero-github-link');
    if (heroGhLink && p.github) heroGhLink.href = p.github;

    const heroMailLink = document.getElementById('hero-email-link');
    if (heroMailLink && p.email) heroMailLink.href = `mailto:${p.email}`;

    // 2. Terminal Graphic Mockup in Hero
    const termRole = document.getElementById('term-code-role');
    if (termRole) termRole.textContent = `"${p.major || 'RPL Student'}"`;

    const termSchool = document.getElementById('term-code-school');
    if (termSchool) termSchool.textContent = `"${p.school || 'SMK Krian 1 Sidoarjo'}"`;

    const termClass = document.getElementById('term-code-class');
    if (termClass) termClass.textContent = `"${p.grade || 'XI RPL'}"`;

    const termHobbies = document.getElementById('term-code-hobbies');
    if (termHobbies) termHobbies.textContent = `"${p.hobbies || 'Gaming 🎮, Swimming 🏊‍♂️'}"`;

    const termQuote = document.getElementById('term-code-quote');
    if (termQuote) termQuote.textContent = `"${p.quote || 'Belajar, membuat, mencoba, dan terus berkembang.'}"`;

    // 3. About Section: Profile Card
    const profilePhoto = document.getElementById('profile-photo');
    if (profilePhoto) {
      profilePhoto.src = p.avatar || 'assets/profile.jpg';
      profilePhoto.alt = `Foto ${p.name || 'Arsenio'} Siswa SMK RPL`;
    }

    const aboutStatus = document.getElementById('about-status-text');
    if (aboutStatus) aboutStatus.textContent = p.statusAvail || 'Open for Projects & PKL';

    const aboutName = document.getElementById('about-profile-name');
    if (aboutName) aboutName.textContent = p.name || 'Arsenio';

    const aboutRole = document.getElementById('about-profile-role');
    if (aboutRole) aboutRole.textContent = `Kelas ${p.grade || 'XI RPL'} • ${p.school || 'SMK Krian 1 Sidoarjo'}`;

    // About Chips
    const chipFocus = document.getElementById('about-chip-focus');
    if (chipFocus) {
      chipFocus.innerHTML = `<i class="fa-solid fa-laptop-code"></i> ${escapeHtml(p.focus || 'Web Dev')}`;
    }

    const chipHobby1 = document.getElementById('about-chip-hobby1');
    const chipHobby2 = document.getElementById('about-chip-hobby2');
    const rawHobbies = (p.hobbies || 'Gaming & Swimming').split(/[&,]/).map(s => s.trim()).filter(Boolean);
    if (chipHobby1) {
      chipHobby1.innerHTML = `<i class="fa-solid fa-gamepad"></i> ${escapeHtml(rawHobbies[0] || 'Gamer')}`;
    }
    if (chipHobby2) {
      chipHobby2.innerHTML = `<i class="fa-solid fa-person-swimming"></i> ${escapeHtml(rawHobbies[1] || 'Swimmer')}`;
    }

    // 4. About Section: Story & Biodata Grid
    const storyTitle = document.getElementById('about-story-title');
    if (storyTitle) {
      storyTitle.textContent = p.storyTitle || `Halo! Saya ${p.name}, Siswa RPL yang Menyukai Dunia Web & Kreativitas Digital.`;
    }

    const storyP1 = document.getElementById('about-story-p1');
    if (storyP1) {
      storyP1.innerHTML = p.story1
        ? escapeHtml(p.story1).replace(new RegExp(escapeHtml(p.school || 'SMK Krian 1 Sidoarjo'), 'g'), `<strong>${escapeHtml(p.school || 'SMK Krian 1 Sidoarjo')}</strong>`).replace(new RegExp(escapeHtml(p.grade || 'XI RPL'), 'g'), `<strong>${escapeHtml(p.grade || 'XI RPL')}</strong>`)
        : '';
    }

    const storyP2 = document.getElementById('about-story-p2');
    if (storyP2) storyP2.textContent = p.story2 || '';

    const bioName = document.getElementById('about-bio-name');
    if (bioName) bioName.textContent = p.name || 'Arsenio';

    const bioSchool = document.getElementById('about-bio-school');
    if (bioSchool) bioSchool.textContent = p.school || 'SMK Krian 1 Sidoarjo';

    const bioMajor = document.getElementById('about-bio-major');
    if (bioMajor) bioMajor.textContent = p.major || 'Rekayasa Perangkat Lunak';

    const bioGrade = document.getElementById('about-bio-grade');
    if (bioGrade) bioGrade.textContent = p.grade || 'XI RPL';

    const bioFocus = document.getElementById('about-bio-focus');
    if (bioFocus) bioFocus.textContent = p.focus || 'Web Development & UI/UX';

    const bioHobbies = document.getElementById('about-bio-hobbies');
    if (bioHobbies) bioHobbies.textContent = p.hobbies || 'Gaming & Swimming';

    const quoteText = document.getElementById('about-quote-text');
    if (quoteText) quoteText.textContent = `“${p.quote || 'Belajar, membuat, mencoba, dan terus berkembang.'}”`;

    const quoteAuthor = document.getElementById('about-quote-author');
    if (quoteAuthor) quoteAuthor.textContent = `— ${p.name || 'Arsenio'}`;

    // 5. Contact Info
    const contactEmailVal = document.getElementById('contact-email-val');
    const contactEmailCard = document.getElementById('contact-email-card');
    if (contactEmailVal) contactEmailVal.textContent = p.email || 'arsenio.rpl@gmail.com';
    if (contactEmailCard) contactEmailCard.href = `mailto:${p.email || 'arsenio.rpl@gmail.com'}`;

    const contactGithubVal = document.getElementById('contact-github-val');
    const contactGithubCard = document.getElementById('contact-github-card');
    if (contactGithubVal) {
      contactGithubVal.textContent = (p.github || 'github.com/arsenio-rpl').replace(/^https?:\/\//, '');
    }
    if (contactGithubCard) contactGithubCard.href = p.github || 'https://github.com/arsenio-rpl';

    const contactIgVal = document.getElementById('contact-instagram-val');
    const contactIgCard = document.getElementById('contact-instagram-card');
    if (contactIgVal) contactIgVal.textContent = p.instagramHandle || '@arsenio.rpl';
    if (contactIgCard) contactIgCard.href = p.instagram || 'https://instagram.com/arsenio.rpl';

    const contactLocVal = document.getElementById('contact-location-val');
    if (contactLocVal) contactLocVal.textContent = p.location || 'Sidoarjo, Jawa Timur, Indonesia';
  }

  function populateProfileForm() {
    const p = getProfile();
    const nameInp = document.getElementById('profile-name-input');
    if (!nameInp) return;

    nameInp.value = p.name || '';
    const schoolInp = document.getElementById('profile-school-input');
    if (schoolInp) schoolInp.value = p.school || '';

    const majorInp = document.getElementById('profile-major-input');
    if (majorInp) majorInp.value = p.major || '';

    const gradeInp = document.getElementById('profile-grade-input');
    if (gradeInp) gradeInp.value = p.grade || '';

    const tagInp = document.getElementById('profile-tag-input');
    if (tagInp) tagInp.value = p.tagText || '';

    const statusInp = document.getElementById('profile-status-avail-input');
    if (statusInp) statusInp.value = p.statusAvail || '';

    const prefixInp = document.getElementById('profile-headline-prefix-input');
    if (prefixInp) prefixInp.value = p.headlinePrefix || '';

    const typingRolesInp = document.getElementById('profile-typing-roles-input');
    if (typingRolesInp) {
      typingRolesInp.value = Array.isArray(p.typingRoles) ? p.typingRoles.join(', ') : (p.typingRoles || '');
    }

    const heroDescInp = document.getElementById('profile-hero-desc-input');
    if (heroDescInp) heroDescInp.value = p.heroDesc || '';

    const focusInp = document.getElementById('profile-focus-input');
    if (focusInp) focusInp.value = p.focus || '';

    const hobbiesInp = document.getElementById('profile-hobbies-input');
    if (hobbiesInp) hobbiesInp.value = p.hobbies || '';

    const locInp = document.getElementById('profile-location-input');
    if (locInp) locInp.value = p.location || '';

    const storyTitleInp = document.getElementById('profile-story-title-input');
    if (storyTitleInp) storyTitleInp.value = p.storyTitle || '';

    const quoteInp = document.getElementById('profile-quote-input');
    if (quoteInp) quoteInp.value = p.quote || '';

    const story1Inp = document.getElementById('profile-story1-input');
    if (story1Inp) story1Inp.value = p.story1 || '';

    const story2Inp = document.getElementById('profile-story2-input');
    if (story2Inp) story2Inp.value = p.story2 || '';

    const emailInp = document.getElementById('profile-email-input');
    if (emailInp) emailInp.value = p.email || '';

    const githubInp = document.getElementById('profile-github-input');
    if (githubInp) githubInp.value = p.github || '';

    const instagramInp = document.getElementById('profile-instagram-input');
    if (instagramInp) instagramInp.value = p.instagram || '';

    const igHandleInp = document.getElementById('profile-ig-handle-input');
    if (igHandleInp) igHandleInp.value = p.instagramHandle || '';

    // Avatar presets & URL
    const avatarPreset = document.getElementById('profile-avatar-preset');
    const customGroup = document.getElementById('custom-avatar-url-group');
    const avatarUrlInp = document.getElementById('profile-avatar-url');
    const previewImg = document.getElementById('profile-edit-avatar-preview');

    const knownPresets = [
      'assets/profile.jpg',
      'assets/project1.jpg',
      'assets/project2.jpg',
      'assets/project3.jpg',
      'assets/project4.jpg'
    ];

    if (avatarPreset && customGroup) {
      if (p.avatar && knownPresets.includes(p.avatar)) {
        avatarPreset.value = p.avatar;
        customGroup.style.display = 'none';
        if (avatarUrlInp) avatarUrlInp.value = '';
        if (previewImg) previewImg.src = p.avatar;
      } else if (p.avatar) {
        avatarPreset.value = 'custom';
        customGroup.style.display = 'block';
        if (avatarUrlInp) avatarUrlInp.value = p.avatar;
        if (previewImg) previewImg.src = p.avatar;
      } else {
        avatarPreset.value = 'assets/profile.jpg';
        customGroup.style.display = 'none';
        if (avatarUrlInp) avatarUrlInp.value = '';
        if (previewImg) previewImg.src = 'assets/profile.jpg';
      }
    }
  }

  // Avatar Selection & Live Preview Handlers
  const profileAvatarPreset = document.getElementById('profile-avatar-preset');
  const customAvatarGroup = document.getElementById('custom-avatar-url-group');
  const profileAvatarUrl = document.getElementById('profile-avatar-url');
  const profileAvatarPreview = document.getElementById('profile-edit-avatar-preview');

  if (profileAvatarPreset) {
    profileAvatarPreset.addEventListener('change', () => {
      const selected = profileAvatarPreset.value;
      if (selected === 'custom') {
        if (customAvatarGroup) customAvatarGroup.style.display = 'block';
        if (profileAvatarPreview && profileAvatarUrl) {
          profileAvatarPreview.src = profileAvatarUrl.value.trim() || 'assets/profile.jpg';
        }
      } else {
        if (customAvatarGroup) customAvatarGroup.style.display = 'none';
        if (profileAvatarPreview) {
          profileAvatarPreview.src = selected;
        }
      }
    });
  }

  if (profileAvatarUrl) {
    profileAvatarUrl.addEventListener('input', () => {
      if (profileAvatarPreset && profileAvatarPreset.value === 'custom' && profileAvatarPreview) {
        profileAvatarPreview.src = profileAvatarUrl.value.trim() || 'assets/profile.jpg';
      }
    });
  }

  // Profile Form Submit Handler
  const profileEditForm = document.getElementById('profile-edit-form');
  if (profileEditForm) {
    profileEditForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameVal = document.getElementById('profile-name-input').value.trim();
      const schoolVal = document.getElementById('profile-school-input').value.trim();
      const majorVal = document.getElementById('profile-major-input').value.trim();
      const gradeVal = document.getElementById('profile-grade-input').value.trim();

      if (!nameVal || !schoolVal || !majorVal || !gradeVal) {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Form Belum Lengkap',
            text: 'Nama, Sekolah, Jurusan, dan Kelas wajib diisi.',
            icon: 'warning',
            confirmButtonColor: '#3b82f6',
            background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
            color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
          });
        } else {
          alert('Nama, Sekolah, Jurusan, dan Kelas wajib diisi.');
        }
        return;
      }

      // Determine Avatar
      let finalAvatar = 'assets/profile.jpg';
      if (profileAvatarPreset) {
        if (profileAvatarPreset.value === 'custom') {
          finalAvatar = profileAvatarUrl ? (profileAvatarUrl.value.trim() || 'assets/profile.jpg') : 'assets/profile.jpg';
        } else {
          finalAvatar = profileAvatarPreset.value;
        }
      }

      // Parse typing roles
      const rawRoles = document.getElementById('profile-typing-roles-input').value;
      const rolesList = rawRoles
        .split(',')
        .map(r => r.trim())
        .filter(Boolean);

      const updatedProfile = {
        name: nameVal,
        school: schoolVal,
        major: majorVal,
        grade: gradeVal,
        tagText: document.getElementById('profile-tag-input').value.trim() || "HELLO, I'M",
        statusAvail: document.getElementById('profile-status-avail-input').value.trim() || 'Open for Projects & PKL',
        headlinePrefix: document.getElementById('profile-headline-prefix-input').value || 'RPL Student & ',
        typingRoles: rolesList.length > 0 ? rolesList : ['Web Developer', 'UI/UX Enthusiast', 'IoT Explorer'],
        heroDesc: document.getElementById('profile-hero-desc-input').value.trim(),
        avatar: finalAvatar,
        focus: document.getElementById('profile-focus-input').value.trim() || 'Web Development & UI/UX',
        hobbies: document.getElementById('profile-hobbies-input').value.trim() || 'Gaming & Swimming',
        location: document.getElementById('profile-location-input').value.trim() || 'Sidoarjo, Jawa Timur, Indonesia',
        storyTitle: document.getElementById('profile-story-title-input').value.trim() || `Halo! Saya ${nameVal}, Siswa RPL yang Menyukai Dunia Web & Kreativitas Digital.`,
        quote: document.getElementById('profile-quote-input').value.trim() || 'Belajar, membuat, mencoba, dan terus berkembang.',
        story1: document.getElementById('profile-story1-input').value.trim(),
        story2: document.getElementById('profile-story2-input').value.trim(),
        email: document.getElementById('profile-email-input').value.trim() || 'arsenio.rpl@gmail.com',
        github: document.getElementById('profile-github-input').value.trim() || 'https://github.com/arsenio-rpl',
        instagram: document.getElementById('profile-instagram-input').value.trim() || 'https://instagram.com/arsenio.rpl',
        instagramHandle: document.getElementById('profile-ig-handle-input').value.trim() || '@arsenio.rpl'
      };

      saveProfile(updatedProfile);
      renderProfile();
      restartTypingEffect();

      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: 'Profil Berhasil Disimpan!',
          text: 'Data identitas Arsenio, teks perkenalan, dan informasi biodata telah diperbarui di seluruh bagian portofolio.',
          icon: 'success',
          confirmButtonColor: '#3b82f6',
          timer: 2000,
          background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
          color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        });
      } else {
        alert('Profil berhasil disimpan!');
      }
    });
  }

  // Reset Profile Button
  const profileResetBtn = document.getElementById('profile-reset-btn');
  if (profileResetBtn) {
    profileResetBtn.addEventListener('click', () => {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: 'Kembalikan Profil Bawaan?',
          text: 'Nama, sekolah, biodata, hobi, dan teks cerita Arsenio akan dikembalikan ke data awal SMK Krian 1 Sidoarjo.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#f59e0b',
          cancelButtonColor: '#64748b',
          confirmButtonText: 'Ya, Kembalikan',
          cancelButtonText: 'Batal',
          background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
          color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        }).then((res) => {
          if (res.isConfirmed) {
            saveProfile(DEFAULT_PROFILE);
            renderProfile();
            populateProfileForm();
            restartTypingEffect();
            Swal.fire({
              title: 'Profil Dipulihkan!',
              text: 'Data profil bawaan Arsenio berhasil diterapkan.',
              icon: 'success',
              timer: 1800,
              showConfirmButton: false,
              background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
              color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
            });
          }
        });
      } else {
        if (confirm('Kembalikan profil ke bawaan?')) {
          saveProfile(DEFAULT_PROFILE);
          renderProfile();
          populateProfileForm();
          restartTypingEffect();
        }
      }
    });
  }

  // ==========================================
  // 18. CONTACT FORM VALIDATION & INBOX PERSISTENCE
  // ==========================================
  const contactForm = document.getElementById('contact-form');
  const nameInput = document.getElementById('user_name');
  const emailInput = document.getElementById('user_email');
  const messageInput = document.getElementById('user_message');
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');
  const submitBtn = document.getElementById('contact-submit-btn');

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  function clearErrors() {
    if (nameError) nameError.textContent = '';
    if (emailError) emailError.textContent = '';
    if (messageError) messageError.textContent = '';
    [nameInput, emailInput, messageInput].forEach(inp => {
      if (inp) inp.style.borderColor = '';
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();

      let isValid = true;
      const nameVal = nameInput ? nameInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const messageVal = messageInput ? messageInput.value.trim() : '';

      // Validate Name
      if (!nameVal) {
        if (nameError) nameError.textContent = 'Nama lengkap tidak boleh kosong.';
        if (nameInput) nameInput.style.borderColor = '#ef4444';
        isValid = false;
      } else if (nameVal.length < 2) {
        if (nameError) nameError.textContent = 'Nama minimal 2 karakter.';
        if (nameInput) nameInput.style.borderColor = '#ef4444';
        isValid = false;
      }

      // Validate Email
      if (!emailVal) {
        if (emailError) emailError.textContent = 'Email tidak boleh kosong.';
        if (emailInput) emailInput.style.borderColor = '#ef4444';
        isValid = false;
      } else if (!validateEmail(emailVal)) {
        if (emailError) emailError.textContent = 'Format email tidak valid (contoh: nama@email.com).';
        if (emailInput) emailInput.style.borderColor = '#ef4444';
        isValid = false;
      }

      // Validate Message
      if (!messageVal) {
        if (messageError) messageError.textContent = 'Pesan tidak boleh kosong.';
        if (messageInput) messageInput.style.borderColor = '#ef4444';
        isValid = false;
      } else if (messageVal.length < 8) {
        if (messageError) messageError.textContent = 'Pesan minimal berisi 8 karakter.';
        if (messageInput) messageInput.style.borderColor = '#ef4444';
        isValid = false;
      }

      if (!isValid) return;

      // Loading state on button
      if (submitBtn) {
        const originalHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Mengirim...</span>';

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHtml;
          contactForm.reset();

          // Save into Admin Inbox
          const now = new Date();
          const dateStr = now.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          const currentInbox = getInbox();
          const newMsg = {
            id: Date.now(),
            name: nameVal,
            email: emailVal,
            message: messageVal,
            date: dateStr
          };
          currentInbox.unshift(newMsg);
          saveInbox(currentInbox);
          saveCloudMessage(newMsg);

          // Update inbox count in Admin Panel
          const inboxCountEl = document.getElementById('tab-messages-count');
          if (inboxCountEl) inboxCountEl.textContent = currentInbox.length;

          // Trigger Success Notification (SweetAlert2)
          if (typeof Swal !== 'undefined') {
            Swal.fire({
              title: 'Pesan Berhasil Terkirim!',
              html: `
                <p style="margin-bottom: 0.5rem; font-size: 0.95rem;">
                  Terima kasih <strong>${escapeHtml(nameVal)}</strong> telah menghubungi Arsenio.
                </p>
                <p style="color: #64748b; font-size: 0.85rem;">
                  Pesan Anda telah masuk ke kotak pesan portofolio. Saya akan segera membalas ke <strong>${escapeHtml(emailVal)}</strong>.
                </p>
              `,
              icon: 'success',
              confirmButtonText: 'Selesai',
              confirmButtonColor: '#3b82f6',
              background: htmlRoot.classList.contains('dark') ? '#0f172a' : '#ffffff',
              color: htmlRoot.classList.contains('dark') ? '#f8fafc' : '#0f172a'
            });
          } else {
            alert(`Terima kasih ${nameVal}! Pesan Anda telah terkirim.`);
          }
        }, 700);
      }
    });

    // Clear error on input
    [nameInput, emailInput, messageInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', () => {
          inp.style.borderColor = '';
          const errorSpan = inp.closest('.form-group')?.querySelector('.error-msg');
          if (errorSpan) errorSpan.textContent = '';
        });
      }
    });
  }

  function escapeHtml(string) {
    if (!string) return '';
    const div = document.createElement('div');
    div.textContent = string;
    return div.innerHTML;
  }

  // Initial render of Admin UI & Dynamic Grids
  updateAdminUI();

  // Initialize Firebase Firestore Cloud Database
  initFirebaseDatabase();
});

