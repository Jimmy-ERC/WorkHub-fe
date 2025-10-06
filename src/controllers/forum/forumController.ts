import type { Foro } from "@/interfaces/forum.interface";
import type { ProfileResponse } from "@/interfaces/profileResponse.interface";
import { CategoriasService } from "@/services/categorias.service";
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
    // Botón "Crear Foro"
    const crearBtn = document.createElement("button");
    crearBtn.className = "btn btn-primary mb-3";
    crearBtn.textContent = "Crear Foro";
    crearBtn.addEventListener("click", () =>
      this.renderCrearForoForm(forosContainer)
    );
    forosContainer.appendChild(crearBtn);

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
           <img src="${foro.link_foto_perfil ?? 'https://via.placeholder.com/40'}" 
     class="rounded-circle me-2" alt="avatar" style="width:40px; height:40px; object-fit:cover;">

            <div>
              <h6 class="mb-0">@${foro.nombre_usuario}</h6>
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
  private async renderCrearForoForm(container: HTMLElement): Promise<void> {
    // Crear card
    const card = document.createElement("div");
    card.className = "card mb-3 shadow-sm";

    // Obtener categorías
    const categoriasResponse = await CategoriasService.getCategorias();
    const categorias = categoriasResponse.success
      ? categoriasResponse.data ?? []
      : [];

    const options = categorias
      .map(
        (c) =>
          `<option value="${c.id_categoria}">${c.nombre_categoria}</option>`
      )
      .join("");

    card.innerHTML = `
    <div class="card-body">
      <h5 class="card-title">Nuevo Foro</h5>
      <form class="crear-foro-form d-flex flex-column gap-2">
        <input type="text" class="form-control" placeholder="Título del foro" required />
        <textarea class="form-control" placeholder="Contenido del foro" rows="3" required></textarea>
        <select class="form-select" required>
          <option value="" disabled selected>Selecciona una categoría</option>
          ${options}
        </select>
        <button type="submit" class="btn btn-success mt-2">Publicar foro</button>
      </form>
      <div class="foro-msg mt-2 small"></div>
    </div>
  `;

    container.prepend(card);

    const form = card.querySelector(".crear-foro-form") as HTMLFormElement;
    const msg = card.querySelector(".foro-msg") as HTMLElement;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const titulo = (
        form.querySelector("input") as HTMLInputElement
      ).value.trim();
      const contenido = (
        form.querySelector("textarea") as HTMLTextAreaElement
      ).value.trim();
      const categoriaId = parseInt(
        (form.querySelector("select") as HTMLSelectElement).value
      );

      if (!titulo || !contenido || !categoriaId) return;

      // Obtener id_perfil
      let id_perfil: number | undefined;
      const profileRes =
        (await ProfileEnterpriseService.fetchEnterpriseProfile()) as ProfileResponse;
      if (profileRes.success && profileRes.data?.id_perfil)
        id_perfil = profileRes.data.id_perfil;
      else {
        const candidateRes =
          (await ProfileCandidateService.fetchCandidateProfile()) as ProfileResponse;
        if (candidateRes.success && candidateRes.data?.id_perfil)
          id_perfil = candidateRes.data.id_perfil;
      }

      if (!id_perfil) {
        msg.textContent = "❌ Debes crear un perfil antes de publicar un foro.";
        msg.className = "foro-msg text-danger small";
        return;
      }

      const fecha = new Date();
      // Crear foro
      const result = await ForumService.crearForo(
        categoriaId,
        id_perfil,
        titulo,
        contenido,
        fecha
      );

      if (result.success) {
        msg.textContent = "✅ Foro creado correctamente";
        msg.className = "foro-msg text-success small";
        form.reset();
        // Recargar foros
        await this.loadForos();
        this.renderForos();
      } else {
        msg.textContent = "❌ Error al crear el foro";
        msg.className = "foro-msg text-danger small";
      }
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

    if (
      respuestasContainer.style.display === "block" ||
      respuestasContainer.style.display === ""
    ) {
      respuestasContainer.style.display = "none";
      toggleLink.innerHTML = `<i class="bi bi-chevron-down"></i> Ver respuestas`;
      return;
    }

    respuestasContainer.innerHTML = `<div class="text-center text-muted small">Cargando respuestas...</div>`;
    respuestasContainer.style.display = "block";

    const response = await ForumService.getRespuestasByForoId(id_foro);
    console.log("Respuestas API:", response);

    const respuestas = Array.isArray(response.data.data)
      ? response.data.data
      : [];

    if (respuestas.length === 0) {
      respuestasContainer.innerHTML = `<div class="text-muted small">No hay respuestas todavía.</div>`;
      return;
    }

    const respuestasHTML = respuestas
      .map(
        (r: any) => `
    <div class="card mt-2 ms-4 border-start border-3 shadow-sm" 
         style="
           border-color: #2A6DFC; 
           background-color: #f8f9fa; 
           border-radius: 0.5rem;
         ">
      <div class="card-body py-2 px-3">
        <div class="d-flex align-items-center mb-1">
          <img src="${r.link_foto_perfil ?? 'https://via.placeholder.com/35'}" 
     class="rounded-circle me-2" alt="avatar" style="width:35px; height:35px; object-fit:cover;">

          <div class="d-flex flex-column">
            <strong style="color: #343a40;">@${r.nombre_usuario}</strong>
            <small class="text-muted">${this.formatFecha(new Date(r.fecha))}</small>
          </div>
        </div>
        <p class="mb-0" style="word-break: break-word; font-size: 0.95rem; color: #343a40;">
          ${r.contenido}
        </p>
      </div>
    </div>`
      )
      .join("");

    respuestasContainer.innerHTML = respuestasHTML;
    toggleLink.innerHTML = `<i class="bi bi-chevron-up"></i> Esconder respuestas (${respuestas.length})`;
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

      // 1️⃣ Intentar con perfil de empresa
      let response =
        (await ProfileEnterpriseService.fetchEnterpriseProfile()) as ProfileResponse;
      console.log("Perfil empresa:", response);

      if (response.success && response.data?.id_perfil) {
        id_perfil = response.data.id_perfil;
        console.log("✅ ID perfil obtenido (empresa):", id_perfil);
      } else {
        // 2️⃣ Si no existe, intentar con candidato
        const candidateResponse =
          (await ProfileCandidateService.fetchCandidateProfile()) as ProfileResponse;
        console.log("Perfil candidato:", candidateResponse);

        if (candidateResponse.success && candidateResponse.data?.id_perfil) {
          id_perfil = candidateResponse.data.id_perfil;
          console.log("✅ ID perfil obtenido (candidato):", id_perfil);
        }
      }

      // 3️⃣ Validar si no se encontró ningún perfil
      if (!id_perfil) {
        mensaje.textContent = "❌ Debes crear un perfil antes de responder.";
        mensaje.className = "respuesta-msg text-danger small";
        return;
      }

      const fecha = new Date();
      console.log("📤 Enviando respuesta con:", {
        id_foro,
        id_perfil,
        contenido,
        fecha,
      });

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
        await this.toggleRespuestas(id_foro, card);
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
