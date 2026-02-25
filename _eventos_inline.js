
    document.addEventListener('DOMContentLoaded', () => {
      const firebaseConfig = {
        apiKey: "AIzaSyCSXdOu9Cwly0-s9rySbe9jKb7fqhcz1p8",
        authDomain: "jackbarcafe-b8fa8.firebaseapp.com",
        projectId: "jackbarcafe-b8fa8",
        storageBucket: "jackbarcafe-b8fa8.appspot.com",
        messagingSenderId: "849215333925",
        appId: "1:849215333925:web:e02cb0d11c590af32201cc"
      };

      if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
      const auth = firebase.auth();
      const db = firebase.firestore();
      const storage = firebase.storage();

      const ADMIN_EMAILS = [
        // 'admin@jackbarcafe.com'
      ];

      const els = {
        menuToggle: document.getElementById('menuToggle'),
        siteNav: document.getElementById('siteNav'),
        loginLink: document.getElementById('loginLink'),
        logoutLink: document.getElementById('logoutLink'),
        userInfo: document.getElementById('user-info'),
        pointsInfo: document.getElementById('points-info'),
        loginModal: document.getElementById('loginModal'),
        closeModal: document.getElementById('closeModal'),
        emailInput: document.getElementById('emailInput'),
        passwordInput: document.getElementById('passwordInput'),
        loginBtn: document.getElementById('loginBtn'),
        googleLoginBtn: document.getElementById('googleLoginBtn'),
        signupBtn: document.getElementById('signupBtn'),
        loginError: document.getElementById('loginError'),
        adminSection: document.getElementById('adminSection'),
        adminLoginBtn: document.getElementById('adminLoginBtn'),
        adminStatus: document.getElementById('adminStatus'),
        adminPanel: document.getElementById('adminPanel'),
        toggleAdminPanelBtn: document.getElementById('toggleAdminPanelBtn'),
        uploadForm: document.getElementById('uploadForm'),
        eventTitle: document.getElementById('eventTitle'),
        eventDate: document.getElementById('eventDate'),
        eventCategory: document.getElementById('eventCategory'),
        eventDescription: document.getElementById('eventDescription'),
        eventFiles: document.getElementById('eventFiles'),
        uploadStatus: document.getElementById('uploadStatus'),
        uploadProgress: document.getElementById('uploadProgress'),
        uploadProgressFill: document.querySelector('#uploadProgress span'),
        feedStatus: document.getElementById('feedStatus'),
        feedGrid: document.getElementById('feedGrid'),
        emptyState: document.getElementById('emptyState'),
        refreshBtn: document.getElementById('refreshBtn'),
        searchInput: document.getElementById('searchInput'),
        categoryFilter: document.getElementById('categoryFilter'),
        lightbox: document.getElementById('lightbox'),
        lightboxImage: document.getElementById('lightboxImage'),
        closeLightboxBtn: document.getElementById('closeLightbox')
      };

      let currentUser = null;
      let isAdmin = false;
      let allPosts = [];
      let adminPanelOpen = false;
      let adminWatchUnsubs = [];
      let adminWatchState = { emailAdmin: false, userDocAdmin: false, adminsDoc: false };

      function escapeHtml(str) {
        return String(str ?? '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }
      function escapeAttr(str) { return escapeHtml(str); }
      function safeError(err) { return (err && (err.message || String(err))) || 'Erro inesperado.'; }

      function setStatus(el, msg, type='') {
        el.textContent = msg;
        el.className = 'status' + (type ? ' ' + type : '');
      }

      function setMenu(open) {
        els.siteNav.classList.toggle('open', open);
        els.menuToggle.setAttribute('aria-expanded', String(open));
        els.menuToggle.textContent = open ? '✕' : '☰';
      }
      els.menuToggle.addEventListener('click', () => setMenu(!els.siteNav.classList.contains('open')));
      els.siteNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        if (window.innerWidth <= 860) setMenu(false);
      }));

      function openLoginModal() {
        els.loginError.textContent = '';
        els.loginModal.style.display = 'flex';
        els.loginModal.setAttribute('aria-hidden', 'false');
      }
      function closeLoginModal() {
        els.loginModal.style.display = 'none';
        els.loginModal.setAttribute('aria-hidden', 'true');
      }
      function openLightbox(src, alt='Imagem') {
        if (!src) return;
        els.lightboxImage.src = src;
        els.lightboxImage.alt = alt;
        els.lightbox.classList.add('open');
        els.lightbox.setAttribute('aria-hidden', 'false');
      }
      function closeLightbox() {
        els.lightbox.classList.remove('open');
        els.lightbox.setAttribute('aria-hidden', 'true');
        els.lightboxImage.src = '';
      }

      els.loginLink.addEventListener('click', (e) => { e.preventDefault(); openLoginModal(); });
      els.adminLoginBtn.addEventListener('click', openLoginModal);
      els.closeModal.addEventListener('click', closeLoginModal);
      els.loginModal.addEventListener('click', (e) => { if (e.target === els.loginModal) closeLoginModal(); });
      els.closeLightboxBtn.addEventListener('click', closeLightbox);
      els.lightbox.addEventListener('click', (e) => { if (e.target === els.lightbox) closeLightbox(); });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeLoginModal();
          closeLightbox();
        }
      });

      els.loginBtn.addEventListener('click', async () => {
        els.loginError.textContent = '';
        try {
          await auth.signInWithEmailAndPassword(els.emailInput.value.trim(), els.passwordInput.value);
          closeLoginModal();
        } catch (err) {
          els.loginError.textContent = safeError(err);
        }
      });

      els.signupBtn.addEventListener('click', async () => {
        els.loginError.textContent = '';
        try {
          const cred = await auth.createUserWithEmailAndPassword(els.emailInput.value.trim(), els.passwordInput.value);
          await db.collection('users').doc(cred.user.uid).set({ points: 0 }, { merge: true });
          closeLoginModal();
        } catch (err) {
          els.loginError.textContent = safeError(err);
        }
      });

      els.googleLoginBtn.addEventListener('click', async () => {
        els.loginError.textContent = '';
        try {
          const res = await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
          const ref = db.collection('users').doc(res.user.uid);
          const doc = await ref.get();
          if (!doc.exists) await ref.set({ points: 0 }, { merge: true });
          closeLoginModal();
        } catch (err) {
          els.loginError.textContent = safeError(err);
        }
      });

      els.logoutLink.addEventListener('click', async (e) => {
        e.preventDefault();
        try { await auth.signOut(); } catch (err) { console.warn(err); }
      });

      function parseDateValue(value) {
        if (!value) return 0;
        const d = new Date(value);
        return Number.isFinite(d.getTime()) ? d.getTime() : 0;
      }
      function formatDate(value) {
        if (!value) return '';
        const d = new Date(value);
        return Number.isFinite(d.getTime()) ? d.toLocaleDateString('pt-BR') : value;
      }

      function normalizePost(doc) {
        const data = doc.data() || {};
        let createdAt = '';
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          createdAt = data.createdAt.toDate().toISOString();
        } else if (data.createdAtISO) {
          createdAt = data.createdAtISO;
        }
        return {
          id: doc.id,
          title: data.title || 'Publicação sem título',
          description: data.description || '',
          category: String(data.category || 'galeria').toLowerCase(),
          eventDate: data.eventDate || '',
          imageUrl: data.imageUrl || '',
          imageName: data.imageName || '',
          createdAt,
          createdByName: data.createdByName || data.createdByEmail || ''
        };
      }

      function sortPosts(posts) {
        return [...posts].sort((a, b) => {
          const aEvent = parseDateValue(a.eventDate);
          const bEvent = parseDateValue(b.eventDate);
          if (aEvent !== bEvent) return bEvent - aEvent;
          return parseDateValue(b.createdAt) - parseDateValue(a.createdAt);
        });
      }

      function getFilteredPosts() {
        const term = els.searchInput.value.trim().toLowerCase();
        const filterCat = els.categoryFilter.value;
        return sortPosts(allPosts).filter(post => {
          if (filterCat !== 'all' && post.category !== filterCat) return false;
          if (!term) return true;
          const hay = `${post.title} ${post.description} ${post.category} ${post.imageName}`.toLowerCase();
          return hay.includes(term);
        });
      }

      function renderFeed() {
        const items = getFilteredPosts();
        els.feedGrid.innerHTML = '';
        els.emptyState.style.display = items.length ? 'none' : 'block';

        if (!allPosts.length) {
          setStatus(els.feedStatus, 'Nenhuma publicação enviada pelos administradores ainda. Use a galeria base abaixo enquanto isso.', 'warn');
        } else {
          setStatus(els.feedStatus, `${items.length} publicação(ões) exibida(s) de ${allPosts.length} carregadas.`, 'ok');
        }

        items.forEach(post => {
          const categoryLabel = post.category ? post.category.charAt(0).toUpperCase() + post.category.slice(1) : 'Galeria';
          const card = document.createElement('article');
          card.className = 'card';
          card.innerHTML = `
            <div class="img-wrap">
              <img src="${escapeAttr(post.imageUrl)}" alt="${escapeAttr(post.title)}" loading="lazy">
            </div>
            <div class="card-body">
              <h3>${escapeHtml(post.title)}</h3>
              <div class="meta">
                <span class="badge">🏷️ ${escapeHtml(categoryLabel)}</span>
                ${post.eventDate ? `<span class="badge">📅 ${escapeHtml(formatDate(post.eventDate))}</span>` : ''}
                ${post.createdByName ? `<span class="badge">👤 ${escapeHtml(post.createdByName)}</span>` : ''}
              </div>
              ${post.description ? `<p>${escapeHtml(post.description)}</p>` : ''}
            </div>
          `;
          const img = card.querySelector('img');
          img.addEventListener('click', () => openLightbox(post.imageUrl, post.title));
          els.feedGrid.appendChild(card);
        });
      }

      async function loadPosts() {
        setStatus(els.feedStatus, 'Carregando publicações...', '');
        try {
          const snap = await db.collection('event_gallery').limit(200).get();
          allPosts = snap.docs.map(normalizePost).filter(p => p.imageUrl);
          renderFeed();
        } catch (err) {
          allPosts = [];
          els.feedGrid.innerHTML = '';
          els.emptyState.style.display = 'block';
          setStatus(els.feedStatus, 'Erro ao carregar publicações: ' + safeError(err), 'error');
        }
      }

      async function loadUserPoints(uid) {
        try {
          const doc = await db.collection('users').doc(uid).get();
          const points = (doc.exists && typeof doc.data().points !== 'undefined') ? doc.data().points : 0;
          els.pointsInfo.textContent = `Pontos: ${points}`;
          els.pointsInfo.style.display = 'inline-flex';
        } catch (err) {
          els.pointsInfo.textContent = 'Pontos: --';
          els.pointsInfo.style.display = 'inline-flex';
        }
      }

      function clearAdminWatchers(resetState = true) {
        adminWatchUnsubs.forEach(unsub => {
          try { if (typeof unsub === 'function') unsub(); } catch (err) { console.warn(err); }
        });
        adminWatchUnsubs = [];
        if (resetState) {
          adminWatchState = { emailAdmin: false, userDocAdmin: false, adminsDoc: false };
        }
      }

      function recomputeAdminFromWatch() {
        const nextIsAdmin = !!(adminWatchState.emailAdmin || adminWatchState.userDocAdmin || adminWatchState.adminsDoc);
        const changed = nextIsAdmin !== isAdmin;
        isAdmin = nextIsAdmin;
        if (changed && currentUser) {
          setStatus(els.adminStatus, isAdmin
            ? 'Permissão de administrador detectada. Painel liberado automaticamente.'
            : 'Permissão de administrador removida. Painel ocultado automaticamente.',
            isAdmin ? 'ok' : 'warn');
        }
        refreshAdminUI();
      }

      function startAdminRealtimeWatch(user) {
        clearAdminWatchers();
        if (!user) return;

        const email = (user.email || '').toLowerCase();
        adminWatchState.emailAdmin = ADMIN_EMAILS.includes(email);
        adminWatchState.userDocAdmin = false;
        adminWatchState.adminsDoc = false;
        recomputeAdminFromWatch();

        const userDocRef = db.collection('users').doc(user.uid);
        const adminsDocRef = db.collection('admins').doc(user.uid);

        const unsubUser = userDocRef.onSnapshot((snap) => {
          const data = snap.exists ? (snap.data() || {}) : {};
          adminWatchState.userDocAdmin = !!data.isAdmin;
          recomputeAdminFromWatch();
        }, (err) => {
          console.warn('Erro ao monitorar users/{uid}:', err);
          adminWatchState.userDocAdmin = false;
          recomputeAdminFromWatch();
        });

        const unsubAdmins = adminsDocRef.onSnapshot((snap) => {
          adminWatchState.adminsDoc = !!snap.exists;
          recomputeAdminFromWatch();
        }, (err) => {
          console.warn('Erro ao monitorar admins/{uid}:', err);
          adminWatchState.adminsDoc = false;
          recomputeAdminFromWatch();
        });

        adminWatchUnsubs.push(unsubUser, unsubAdmins);
      }

      function setAdminPanelVisible(show) {
        adminPanelOpen = !!show;
        els.adminPanel.classList.toggle('visible', adminPanelOpen);
        els.adminPanel.setAttribute('aria-hidden', String(!adminPanelOpen));
        els.toggleAdminPanelBtn.textContent = adminPanelOpen ? 'Fechar formulário de upload' : 'Abrir formulário de upload';
      }

      function setAdminSectionVisible(show) {
        els.adminSection.style.display = show ? 'block' : 'none';
        els.adminSection.setAttribute('aria-hidden', String(!show));
      }

      function refreshAdminUI() {
        if (!currentUser) {
          isAdmin = false;
          setAdminSectionVisible(false);
          els.adminLoginBtn.style.display = 'inline-flex';
          els.toggleAdminPanelBtn.style.display = 'none';
          setAdminPanelVisible(false);
          setStatus(els.adminStatus, 'Faça login para verificar permissão de administrador (atualiza em tempo real).', '');
          return;
        }

        if (isAdmin) {
          setAdminSectionVisible(true);
          els.adminLoginBtn.style.display = 'none';
          els.toggleAdminPanelBtn.style.display = 'inline-flex';
          setStatus(els.adminStatus, 'Administrador autenticado. O upload de imagens está liberado.', 'ok');
        } else {
          // Oculta completamente a área administrativa para usuários comuns.
          setAdminSectionVisible(false);
          els.adminLoginBtn.style.display = 'none';
          els.toggleAdminPanelBtn.style.display = 'none';
          setAdminPanelVisible(false);
          setStatus(els.adminStatus, 'Usuário logado, mas sem permissão de administrador.', 'warn');
        }
      }

      els.toggleAdminPanelBtn.addEventListener('click', () => {
        if (!isAdmin) return;
        setAdminPanelVisible(!adminPanelOpen);
      });

      function setUploadProgress(show, pct = 0) {
        els.uploadProgress.style.display = show ? 'block' : 'none';
        els.uploadProgressFill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
      }

      async function uploadSingleFile(file, payload, index, total) {
        const safeFileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const storagePath = `event-gallery/${new Date().getFullYear()}/${safeFileName}`;
        const ref = storage.ref().child(storagePath);
        const task = ref.put(file, { contentType: file.type || 'image/jpeg' });

        await new Promise((resolve, reject) => {
          task.on('state_changed', snap => {
            const filePct = snap.totalBytes ? (snap.bytesTransferred / snap.totalBytes) : 0;
            const totalPct = (((index - 1) + filePct) / total) * 100;
            setUploadProgress(true, totalPct);
            setStatus(els.uploadStatus, `Enviando ${index}/${total}: ${file.name} (${Math.round(filePct * 100)}%)`, '');
          }, reject, resolve);
        });

        const imageUrl = await task.snapshot.ref.getDownloadURL();
        await db.collection('event_gallery').add({
          ...payload,
          imageUrl,
          imageName: file.name,
          storagePath,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          createdAtISO: new Date().toISOString(),
          createdByUid: currentUser.uid,
          createdByEmail: currentUser.email || '',
          createdByName: currentUser.displayName || currentUser.email || 'Admin'
        });
      }

      els.uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser || !isAdmin) {
          setStatus(els.uploadStatus, 'Apenas administradores podem enviar imagens.', 'error');
          return;
        }

        const title = els.eventTitle.value.trim();
        const description = els.eventDescription.value.trim();
        const eventDate = els.eventDate.value;
        const category = String(els.eventCategory.value || 'evento').toLowerCase();
        const files = Array.from(els.eventFiles.files || []).filter(f => f.type && f.type.startsWith('image/'));

        if (!title) {
          setStatus(els.uploadStatus, 'Informe o título da publicação.', 'error');
          return;
        }
        if (!files.length) {
          setStatus(els.uploadStatus, 'Selecione pelo menos uma imagem.', 'error');
          return;
        }

        const payload = { title, description, eventDate: eventDate || '', category };

        try {
          setUploadProgress(true, 0);
          for (let i = 0; i < files.length; i++) {
            await uploadSingleFile(files[i], payload, i + 1, files.length);
          }
          setUploadProgress(true, 100);
          setStatus(els.uploadStatus, `Upload concluído com sucesso! ${files.length} imagem(ns) publicada(s).`, 'ok');
          els.uploadForm.reset();
          setTimeout(() => setUploadProgress(false, 0), 800);
          await loadPosts();
        } catch (err) {
          console.error(err);
          setStatus(els.uploadStatus, 'Erro no upload: ' + safeError(err), 'error');
          setUploadProgress(false, 0);
        }
      });

      els.uploadForm.addEventListener('reset', () => {
        setTimeout(() => {
          setUploadProgress(false, 0);
          setStatus(els.uploadStatus, '', '');
        }, 0);
      });

      els.refreshBtn.addEventListener('click', loadPosts);
      els.searchInput.addEventListener('input', renderFeed);
      els.categoryFilter.addEventListener('change', renderFeed);
      document.querySelectorAll('#fallbackGallery img').forEach(img => {
        img.addEventListener('click', () => openLightbox(img.src, img.alt));
      });

      auth.onAuthStateChanged(async user => {
        currentUser = user || null;
        clearAdminWatchers(false);

        if (currentUser) {
          els.userInfo.textContent = `Olá, ${currentUser.displayName || currentUser.email || 'usuário'}`;
          els.userInfo.style.display = 'inline-flex';
          els.loginLink.style.display = 'none';
          els.logoutLink.style.display = 'inline-flex';
          await loadUserPoints(currentUser.uid);

          // Estado inicial rápido (email) + atualização em tempo real via Firestore.
          adminWatchState = {
            emailAdmin: ADMIN_EMAILS.includes((currentUser.email || '').toLowerCase()),
            userDocAdmin: false,
            adminsDoc: false
          };
          isAdmin = !!adminWatchState.emailAdmin;
          refreshAdminUI();
          if (!isAdmin) {
            setStatus(els.adminStatus, 'Verificando permissão de administrador em tempo real...', '');
          }
          startAdminRealtimeWatch(currentUser);
        } else {
          clearAdminWatchers();
          isAdmin = false;
          els.userInfo.style.display = 'none';
          els.userInfo.textContent = '';
          els.pointsInfo.style.display = 'none';
          els.pointsInfo.textContent = '';
          els.loginLink.style.display = 'inline-flex';
          els.logoutLink.style.display = 'none';
          refreshAdminUI();
        }
      });

      loadPosts();
    });
  