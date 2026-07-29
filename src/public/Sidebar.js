class TokenStorage {
  static #KEY = 'accessToken';

  static get() {
    return localStorage.getItem(TokenStorage.#KEY);
  }

  static set(token) {
    localStorage.setItem(TokenStorage.#KEY, token);
  }

  static clear() {
    localStorage.removeItem(TokenStorage.#KEY);
  }
}

class UserService {
  constructor(baseUrl = '/api/auth') {
    this.baseUrl = baseUrl;
  }

  async getCurrentUser(token) {
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      return null;
    }
  }
}

class Sidebar {
  constructor(containerId, userService, tokenStorage) {
    this.container = document.getElementById(containerId);
    this.userService = userService;
    this.tokenStorage = tokenStorage;
  }

  async render() {
    try {
      if (!this.container) {
        console.error('Sidebar: container element not found.');
        return;
      }

      const response = await fetch('sidebar.html');
      if (!response.ok) {
        throw new Error(`Failed to load sidebar.html (status ${response.status})`);
      }

      const html = await response.text();
      this.container.innerHTML = html;

      this.#highlightActivePage();
      this.#bindMenuClicks();
      await this.#loadUserInfo();

      console.log('Sidebar: rendered successfully.');
    } catch (error) {
      console.error('Sidebar: failed to render.', error);
    }
  }

  #bindMenuClicks() {
    try {
      const menuItems = this.container.querySelectorAll('.menu-item');

      menuItems.forEach((item) => {
        item.addEventListener('click', (event) => {
          event.preventDefault();
          this.#setActiveItem(item);
        });
      });

      console.log('Sidebar: menu click handlers bound.');
    } catch (error) {
      console.error('Sidebar: failed to bind menu clicks.', error);
    }
  }

  #setActiveItem(clickedItem) {
    try {
      const menuItems = this.container.querySelectorAll('.menu-item');
      menuItems.forEach((item) => item.classList.remove('active'));
      clickedItem.classList.add('active');

      console.log('Sidebar: active item changed.', { page: clickedItem.dataset.page });
    } catch (error) {
      console.error('Sidebar: failed to set active item.', error);
    }
  }

  async #loadUserInfo() {
  }

  #highlightActivePage() {
  }
}