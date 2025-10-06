import type { Foro } from "@/interfaces/forum.interface";
import type { ProfileResponse } from "@/interfaces/profileResponse.interface";
import { ForumService } from "@/services/forum.service";
import { ProfileCandidateService } from "@/services/profileCandidate.service";
import { ProfileEnterpriseService } from "@/services/profileEnterprise.service";

export class ForumController {
  private foros: Foro[] = [];

  constructor() {
    this.init();
  }

  private init(): void {
    const runAll = async () => {
      await this.loadForos();
      this.renderForos();
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", runAll);
    } else {
      runAll();
    }
  }

  private async loadForos(): Promise<void> {
    try {
      const forosResponse = await ForumService.getForos();

      if (!forosResponse.success) {
        console.error("Error en la respuesta:", forosResponse.message);
        this.foros = [];
        return;
      }

      const payload = forosResponse.data;

      if (Array.isArray(payload)) {
        this.foros = payload;
      } else if (payload && Array.isArray(payload.data)) {
        this.foros = payload.data;
      } else {
        console.error("La respuesta no contiene un array válido:", payload);
        this.foros = [];
      }
    } catch (error) {
      console.error("Error al obtener los foros:", error);
      this.foros = [];
    }
  }

  public renderForos(): void {
    const forosContainer = document.getElementById("lista-foros");
    if (!forosContainer) {
      console.error("No se encontró el contenedor de foros");
      return;
    }

    forosContainer.innerHTML = "";

    if (this.foros.length === 0) {
      const emptyMsg = document.createElement("p");
      emptyMsg.className = "text-muted";
      emptyMsg.textContent = "No hay foros disponibles por el momento.";
      forosContainer.appendChild(emptyMsg);
      return;
    }

    this.foros.forEach((foro) => {
      const card = document.createElement("div");
      card.className = "card mb-3 shadow-sm";
      card.setAttribute("data-foro-id", foro.id_foro.toString());

      card.innerHTML = `
        <div class="card-body">
          <div class="d-flex align-items-center mb-2">
            <img src="https://via.placeholder.com/40" class="rounded-circle me-2" alt="avatar">
            <div>
              <h6 class="mb-0">@Usuario${foro.id_perfil}</h6>
              <small class="text-muted">${this.formatFecha(foro.fecha)}</small>
            </div>
            <div class="ms-auto">
              <button class="btn btn-sm btn-link text-muted" data-bs-toggle="dropdown">
                <i class="bi bi-three-dots-vertical"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="#">Editar</a></li>
                <li><a class="dropdown-item text-danger" href="#">Eliminar</a></li>
              </ul>
            </div>
          </div>

          <h5 class="card-title">${foro.titulo}</h5>
          <p class="card-text">${foro.contenido}</p>

          <div class="d-flex justify-content-between border-top pt-2">
            <a href="#" class="small text-decoration-none text-muted ver-respuestas">
              <i class="bi bi-chevron-down"></i> Ver respuestas
            </a>
            <a href="#" class="small text-decoration-none responder">
              <i class="bi bi-reply"></i> Responder
            </a>
          </div>

          <div class="respuestas-container mt-3" style="display:none;"></div>
          <div class="responder-container mt-3" style="display:none;"></div>
        </div>
      `;

      // Ver respuestas
      const verRespuestasLink = card.querySelector(".ver-respuestas");
      if (verRespuestasLink) {
        verRespuestasLink.addEventListener("click", (e) => {
          e.preventDefault();
          this.toggleRespuestas(foro.id_foro, card);
        });
      }

      // Responder
      const responderLink = card.querySelector(".responder");
      if (responderLink) {
        responderLink.addEventListener("click", (e) => {
          e.preventDefault();
          this.toggleResponder(foro.id_foro, card);
        });
      }

      forosContainer.appendChild(card);
    });
  }

  private async toggleRespuestas(
    id_foro: number,
    card: HTMLElement
  ): Promise<void> {
    const respuestasContainer = card.querySelector(
      ".respuestas-container"
    ) as HTMLElement;
    const toggleLink = card.querySelector(".ver-respuestas") as HTMLElement;

    if (!respuestasContainer || !toggleLink) return;

    if (respuestasContainer.style.display === "block") {
      respuestasContainer.style.display = "none";
      toggleLink.innerHTML = `<i class="bi bi-chevron-down"></i> Ver respuestas`;
      return;
    }

    respuestasContainer.innerHTML = `<div class="text-center text-muted small">Cargando respuestas...</div>`;
    respuestasContainer.style.display = "block";

    const response = await ForumService.getRespuestasByForoId(id_foro);

    if (!response.success || !response.data.length) {
      respuestasContainer.innerHTML = `<div class="text-muted small">No hay respuestas todavía.</div>`;
      return;
    }

    const respuestasHTML = response.data
      .map(
        (r: any) => `
        <div class="card mt-2 ms-4 border-start border-3 border-primary-subtle">
          <div class="card-body py-2">
            <div class="d-flex align-items-center mb-1">
              <img src="https://via.placeholder.com/30" class="rounded-circle me-2" alt="avatar">
              <div>
                <strong>@Usuario${r.id_perfil}</strong>
                <small class="text-muted ms-2">${this.formatFecha(
                  r.fecha
                )}</small>
              </div>
            </div>
            <p class="mb-0">${r.contenido}</p>
          </div>
        </div>`
      )
      .join("");

    respuestasContainer.innerHTML = respuestasHTML;

    toggleLink.innerHTML = `<i class="bi bi-chevron-up"></i> Esconder respuestas (${response.data.length})`;
  }

  private toggleResponder(id_foro: number, card: HTMLElement): void {
    const responderContainer = card.querySelector(
      ".responder-container"
    ) as HTMLElement;
    if (!responderContainer) return;

    if (responderContainer.style.display === "block") {
      responderContainer.style.display = "none";
      responderContainer.innerHTML = "";
      return;
    }

    responderContainer.style.display = "block";
    responderContainer.innerHTML = `
      <form class="responder-form d-flex gap-2">
        <input type="text" class="form-control form-control-sm" placeholder="Escribe tu respuesta..." required>
        <button type="submit" class="btn btn-sm btn-primary">Enviar</button>
      </form>
      <div class="respuesta-msg small mt-1"></div>
    `;

    const form = responderContainer.querySelector(
      ".responder-form"
    ) as HTMLFormElement;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = form.querySelector("input") as HTMLInputElement;
      const mensaje = responderContainer.querySelector(
        ".respuesta-msg"
      ) as HTMLElement;
      const contenido = input.value.trim();
      if (!contenido) return;

      let id_perfil: number | undefined = undefined;

      // Intentar con perfil de empresa
      let response =
        (await ProfileEnterpriseService.fetchEnterpriseProfile()) as ProfileResponse;
      if (response.success && response.data?.id_perfil) {
        id_perfil = response.data.id_perfil;
      } else {
        // Si no se encuentra, intentar con candidato
        response =
          (await ProfileCandidateService.fetchCandidateProfile()) as ProfileResponse;
        if (response.success && response.data?.id_perfil) {
          id_perfil = response.data.id_perfil;
        }
      }
      if (!id_perfil) {
        mensaje.textContent = "Debes iniciar sesión para responder";
        mensaje.className = "respuesta-msg text-danger small";
        return;
      }

      const fecha = new Date();

      const result = await ForumService.crearRespuesta(
        id_foro,
        id_perfil,
        contenido,
        fecha
      );

      if (result.success) {
        mensaje.textContent = "✅ Respuesta publicada correctamente";
        mensaje.className = "respuesta-msg text-success small";
        input.value = "";
        // Refrescar respuestas automáticamente
        this.toggleRespuestas(id_foro, card);
        this.toggleRespuestas(id_foro, card);
      } else {
        mensaje.textContent = "Error al publicar respuesta";
        mensaje.className = "respuesta-msg text-danger small";
      }
    });
  }

  private formatFecha(fecha: Date | string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

declare global {
  interface Window {
    forumController: ForumController;
  }
}

window.forumController = new ForumController();
