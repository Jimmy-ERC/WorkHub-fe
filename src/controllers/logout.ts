import sessionManager from "../lib/session";

export class LogoutController {
  constructor() {
    this.init();
  }

  private init(): void {
    // carga del DOM
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.setupEventListeners()
      );
    } else {
      this.setupEventListeners();
    }
  }

  private setupEventListeners(): void {
    // Find logout links/buttons and attach event listeners
    const logoutLinks = document.querySelectorAll(
      '[data-logout], .logout-link, a[href*="login.html"]'
    );

    logoutLinks.forEach((link) => {
      link.addEventListener("click", (e) => this.handleLogout(e));
    });
  }

  private async handleLogout(event: Event): Promise<void> {
    event.preventDefault();

    try {
      // Show loading state if possible
      const target = event.target as HTMLElement;
      target.textContent = "Cerrando sesión...";

      // Sign out from Supabase and clear local storage
      await sessionManager.signOut();

      setTimeout(() => {
        window.location.href = "/src/pages/auth/login.html";
      }, 500);
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if there's an error, redirect to login
      window.location.href = "/src/pages/auth/login.html";
    }
  }

  public async logout(): Promise<void> {
    try {
      await sessionManager.signOut();
      window.location.href = "/src/pages/auth/login.html";
    } catch (error) {
      console.error("Error during logout:", error);
      window.location.href = "/src/pages/auth/login.html";
    }
  }
}

// Auto-initialize logout controller
new LogoutController();
