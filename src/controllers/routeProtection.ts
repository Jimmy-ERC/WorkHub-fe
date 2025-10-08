import sessionManager from "../lib/session";

/**
 * Route protection controller - protects pages that require authentication
 * Redirects to login if user is not authenticated
 */
export class RouteProtection {
  // esta url relativa se utiliza para redirigir a la página de login si no está autenticado
  private loginUrl = "/src/pages/auth/login.html";

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.checkAuthentication()
      );
    } else {
      await this.checkAuthentication();
    }
  }

  private async checkAuthentication(): Promise<void> {
    try {
      // First check if we have stored session data
      const storedUser = sessionManager.getStoredUser();

      if (!storedUser) {
        this.redirectToLogin();
        return;
      }

      // Validate session with Supabase to ensure it's still valid
      const result = await sessionManager.getUserFromSupabase();

      if (!result.success || !result.user) {
        // Sesión invalida, limpia  datos almacenados y redirigir
        sessionManager.signOut();
        this.redirectToLogin();
        return;
      }

      console.log("User authenticated:", result.user.email);

      // si estamos en la página de login o register y SI hay sesión, redirigir al dashboard dependiendo del tipo de usuario (Candidato, Empresa)
      const currentPath = window.location.pathname;
      if (
        currentPath.endsWith("login.html") ||
        currentPath.endsWith("register.html")
      ) {
        if (result.user.user_metadata?.user_type === "Candidato") {
          window.location.href = "/src/pages/candidate/home.html";
        } else if (result.user.user_metadata?.user_type === "Empresa") {
          window.location.href = "/src/pages/enterprise/home.html";
        } else {
          console.log("Unknown user role, staying on current page.");
        }
      } else {
        // si estamos en cualquier otra página y SI hay sesión, redirigir a su propio dashboard dependiendo del tipo de usuario (Candidato, Empresa), esto para que no pueda un candidato entrar a la página de empresa y viceversa

        if (
          result.user.user_metadata?.user_type === "Candidato" &&
          !currentPath.includes("/candidate/")
        ) {
          window.location.href = "/src/pages/candidate/home.html";
        } else if (
          result.user.user_metadata?.user_type === "Empresa" &&
          !currentPath.includes("/enterprise/")
        ) {
          window.location.href = "/src/pages/enterprise/home.html";
        }
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      this.redirectToLogin();
    }
  }

  private redirectToLogin(): void {
    console.log("User not authenticated, redirecting to login...");
    const currentPath = window.location.pathname;

    if (
      !currentPath.endsWith("register.html") &&
      !currentPath.endsWith("login.html")
    ) {
      window.location.href = this.loginUrl;
    }
  }

  // obtiene el usuario actual de la sesión almacenada
  public getCurrentUser() {
    return sessionManager.getStoredUser();
  }

  // toma el usuario actual desde supabase, la diferencia con getCurrentUser es que esta es en tiempo real, no es tomado del localStorage
  public async getCurrentUserFromSupabase() {
    return await sessionManager.getUserFromSupabase();
  }
}

new RouteProtection();
