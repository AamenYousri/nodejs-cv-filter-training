class TokenStorage {
  static #KEY = 'accessToken';

  static get() {
    const match = document.cookie.match(
      new RegExp('(?:^|; )' + TokenStorage.#KEY.replace(/([.$?*|{}\(\)\[\]\\/\+\^])/g, '\\$1') + '=([^;]*)')
    );
    return match ? decodeURIComponent(match[1]) : null;
  }

  static set(token) {
    document.cookie = `${TokenStorage.#KEY}=${encodeURIComponent(token)}; path=/; max-age=${10 * 24 * 60 * 60}; SameSite=Lax`;
  }

  static clear() {
    document.cookie = `${TokenStorage.#KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

class UserService {
  constructor(baseUrl = '/api/auth') {
    this.baseUrl = baseUrl;
    this._userPromise = null;
  }

  async getCurrentUser(token) {
    if (!token) {
      return null;
    }
    if (this._userPromise) {
      return this._userPromise;
    }
    this._userPromise = this.#fetchUser(token);
    return this._userPromise;
  }

  async #fetchUser(token) {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        this._userPromise = null;
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      this._userPromise = null;
      return null;
    }
  }
}

class Sidebar {
  static #instances = [];
  static #offcanvasBound = false;

  constructor(containerId, userService, tokenStorage) {
    this.container = document.getElementById(containerId);
    this.userService = userService;
    this.tokenStorage = tokenStorage;
    Sidebar.#instances.push(this);
  }

  static init(configs) {
    const instances = configs.map(
      (cfg) => new Sidebar(cfg.containerId, cfg.userService, cfg.tokenStorage)
    );
    instances.forEach((instance) => instance.render());
    Sidebar.#bindOffcanvasBehavior();
    return instances;
  }

  static #bindOffcanvasBehavior() {
    if (Sidebar.#offcanvasBound) return;

    const mobileSidebarEl = document.getElementById('mobileSidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    if (!mobileSidebarEl || !toggleBtn) return;

    mobileSidebarEl.addEventListener('shown.bs.offcanvas', () => {
      toggleBtn.classList.add('open');
    });

    mobileSidebarEl.addEventListener('hidden.bs.offcanvas', () => {
      toggleBtn.classList.remove('open');
      toggleBtn.blur();
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth >= 992) {
          const offcanvasInstance = bootstrap.Offcanvas.getInstance(mobileSidebarEl);
          if (offcanvasInstance) {
            offcanvasInstance.hide();
          }
        }
      }, 150);
    });

    Sidebar.#offcanvasBound = true;
  }

  async render() {
    try {
      if (!this.container) {
        console.error('Sidebar: container element not found.');
        return;
      }

      const response = await fetch('/html/sidebar-partial.html');
      if (!response.ok) {
        throw new Error(`Failed to load sidebar-partial.html (status ${response.status})`);
      }

      const html = await response.text();
      this.container.innerHTML = html;

      this.#highlightActivePage();
      this.#bindMenuClicks();
      this.#bindLogout();
      await this.#loadUserInfo();
    } catch (error) {
      console.error('Sidebar: failed to render.', error);
    }
  }

  #bindMenuClicks() {
    const menuItems = this.container.querySelectorAll('.menu-item[data-page]');
    menuItems.forEach((item) => {
      item.addEventListener('click', (event) => {
        event.preventDefault();
        const page = item.dataset.page;
        Sidebar.#instances.forEach((instance) => instance.#applyActivePage(page));
      });
    });
  }

  #bindLogout() {
    const logoutBtn = this.container.querySelector('#logoutBtn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', (event) => {
      event.preventDefault();
      this.tokenStorage.clear();
      window.location.href = '/login';
    });
  }

  #applyActivePage(page) {
    const menuItems = this.container.querySelectorAll('.menu-item[data-page]');
    menuItems.forEach((item) => {
      item.classList.toggle('active', item.dataset.page === page);
    });
  }

  #highlightActivePage() {
    const currentPage = this.container.dataset.activePage;
    this.#applyActivePage(currentPage);
  }

  async #loadUserInfo() {
    const token = this.tokenStorage.get();
    const user = await this.userService.getCurrentUser(token);
    const nameEl = this.container.querySelector('#sidebar-user-name');
    if (nameEl) {
      nameEl.textContent = user ? user.name : 'Guest';
    }
  }
}

window.TokenStorage = TokenStorage;
window.UserService = UserService;
window.Sidebar = Sidebar;