import type { Foro } from "@/interfaces/forum.interface";
import type { ProfileResponse } from "@/interfaces/profileResponse.interface";
import { CategoriasService } from "@/services/categorias.service";
import { ForumService } from "@/services/forum.service";
import { ProfileCandidateService } from "@/services/profileCandidate.service";
import { ProfileEnterpriseService } from "@/services/profileEnterprise.service";

import { loadUserData } from "../../lib/userDataLoader.js";

export class ForumController {
  private foros: Foro[] = [];
  private id_perfil: any = null;

  constructor() {
    this.init();
  }

  private init(): void {
    const runAll = async () => {
      await loadUserData();
      const currentUser =
        (await ProfileCandidateService.fetchCandidateProfile()) as ProfileResponse;
      this.id_perfil = currentUser.data.id_perfil;

      const urlParams = new URLSearchParams(window.location.search);
      const soloMisForos = urlParams.get("misforos") === "true";

      if (soloMisForos) {
        await this.loadMisForos(); 
      } else {
        await this.loadForos(); 
      }

      this.renderForos();
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", runAll);
    } else {
      runAll();
    }
  }

  private async loadMisForos(): Promise<void> {
    try {
      let idPerfil: number | undefined = undefined;
      const profileRes =
        (await ProfileEnterpriseService.fetchEnterpriseProfile()) as ProfileResponse;
      if (profileRes.success && profileRes.data?.id_perfil)
        idPerfil = profileRes.data.id_perfil;
      else {
        const candidateRes =
          (await ProfileCandidateService.fetchCandidateProfile()) as ProfileResponse;
        if (candidateRes.success && candidateRes.data?.id_perfil)
          idPerfil = candidateRes.data.id_perfil;
      }
      if (typeof idPerfil === "undefined") {
        this.foros = [];
        console.error("No se pudo obtener el id del perfil del usuario.");
        return;
      }
      const response = await ForumService.getForosByUserId(idPerfil);
      if (response.success) {
        this.foros = response.data ?? [];
      } else {
        this.foros = [];
        console.error("Error al traer tus foros:", response.message);
      }
    } catch (error) {
      console.error("Error al cargar tus foros:", error);
      this.foros = [];
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
           <img src="${
             foro.link_foto_perfil ?? "https://via.placeholder.com/40"
           }" 
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

      const verRespuestasLink = card.querySelector(".ver-respuestas");
      if (verRespuestasLink) {
        verRespuestasLink.addEventListener("click", (e) => {
          e.preventDefault();
          this.toggleRespuestas(foro.id_foro, card);
        });
      }

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

    const card = document.createElement("div");
    card.className = "card mb-3 shadow-sm";
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
        msg.textContent = "Debes crear un perfil antes de publicar un foro.";
        msg.className = "foro-msg text-danger small";
        return;
      }

      const fecha = new Date();
      const result = await ForumService.crearForo(
        categoriaId,
        id_perfil,
        titulo,
        contenido,
        fecha
      );

      if (result.success) {
        msg.textContent = "Foro creado correctamente";
        msg.className = "foro-msg text-success small";
        form.reset();
        await this.loadForos();
        this.renderForos();
      } else {
        msg.textContent = "Error al crear el foro";
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
      .map((r: any) => {
        const isMine = r.id_perfil === this.id_perfil;
        console.log("Respuesta API:", r);

        return `
    <div class="card mt-2 ms-4 border-start border-3 shadow-sm" 
         data-respuesta-id="${r.id_respuesta_foro}"

         style="border-color: #2A6DFC; background-color: #f8f9fa; border-radius: 0.5rem;">
      <div class="card-body py-2 px-3">
        <div class="d-flex align-items-center mb-1">
          <img src="${r.link_foto_perfil ?? "https://via.placeholder.com/35"}" 
               class="rounded-circle me-2" alt="avatar" style="width:35px; height:35px; object-fit:cover;">
          <div class="d-flex flex-column flex-grow-1">
            <strong style="color: #343a40;">@${r.nombre_usuario}</strong>
            <small class="text-muted">${this.formatFecha(
              new Date(r.fecha)
            )}</small>
          </div>
          ${
            isMine
              ? `
          <div class="ms-2 dropdown">
<button class="btn btn-sm btn-link text-muted p-0 toggle-dropdown">
  <i class="bi bi-three-dots"></i>
</button>
<ul class="dropdown-menu dropdown-menu-end">
  <li><a class="dropdown-item editar-respuesta" href="#">Editar</a></li>
  <li><a class="dropdown-item text-danger eliminar-respuesta" href="#">Eliminar</a></li>
</ul>

          </div>`
              : ""
          }
        </div>
        <p class="mb-0 respuesta-contenido" style="word-break: break-word; font-size: 0.95rem; color: #343a40;">
          ${r.contenido}
        </p>
      </div>
    </div>`;
      })
      .join("");

    respuestasContainer.innerHTML = respuestasHTML;
    this.setupRespuestaActions(respuestasContainer, id_foro, card);
    toggleLink.innerHTML = `<i class="bi bi-chevron-up"></i> Esconder respuestas (${respuestas.length})`;
  }
  private setupRespuestaActions(
    container: HTMLElement,
    id_foro: number,
    card: HTMLElement
  ): void {
    const editButtons = container.querySelectorAll(".editar-respuesta");
    const deleteButtons = container.querySelectorAll(".eliminar-respuesta");

    editButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const respuestaCard = (e.target as HTMLElement).closest(
          "[data-respuesta-id]"
        ) as HTMLElement;
        console.log("respuestaCard:", respuestaCard);
        console.log(
          "data-respuesta-id:",
          respuestaCard.getAttribute("data-respuesta-id")
        );

        this.makeRespuestaEditable(respuestaCard, id_foro, card);
      });
    });

    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const respuestaCard = (e.target as HTMLElement).closest(
          ".card"
        ) as HTMLElement;
        const id_respuesta = parseInt(
          respuestaCard.getAttribute("data-respuesta-id")!
        );

        if (!confirm("¿Seguro que deseas eliminar esta respuesta?")) return;

        const result = await ForumService.deleteRespuesta(id_respuesta);
        if (result.success) {
          respuestaCard.remove();
        } else {
          alert("Error al eliminar la respuesta");
        }
      });
    });

    const toggleButtons = container.querySelectorAll(".toggle-dropdown");
    toggleButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const menu = btn.nextElementSibling as HTMLElement;
        if (!menu) return;

        container.querySelectorAll(".dropdown-menu.show").forEach((m) => {
          if (m !== menu) m.classList.remove("show");
        });

        menu.classList.toggle("show");
      });
    });

    document.addEventListener("click", () => {
      container.querySelectorAll(".dropdown-menu.show").forEach((m) => {
        m.classList.remove("show");
      });
    });
  }
  private makeRespuestaEditable(
    respuestaCard: HTMLElement,
    id_foro: number,
    card: HTMLElement
  ): void {
    const contentP = respuestaCard.querySelector(
      ".respuesta-contenido"
    ) as HTMLParagraphElement;
    const originalText = contentP.textContent || "";
    const id_respuesta = parseInt(
      respuestaCard.getAttribute("data-respuesta-id")!
    );
    if (isNaN(id_respuesta)) {
      console.error(
        "No se pudo obtener id_respuesta del elemento:",
        respuestaCard
      );
      return;
    }
    const textarea = document.createElement("textarea");
    textarea.className = "form-control mb-2";
    textarea.value = originalText;
    contentP.replaceWith(textarea);

    const saveBtn = document.createElement("button");
    saveBtn.className = "btn btn-sm btn-primary me-2";
    saveBtn.textContent = "Guardar";
    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn btn-sm btn-secondary";
    cancelBtn.textContent = "Cancelar";

    const btnContainer = document.createElement("div");
    btnContainer.className = "mt-2";
    btnContainer.append(saveBtn, cancelBtn);
    textarea.after(btnContainer);

    saveBtn.addEventListener("click", async () => {
      const newContent = textarea.value.trim();
      const id_respuesta = parseInt(
        respuestaCard.getAttribute("data-respuesta-id")!
      );

      if (!newContent) return;

      try {
        console.log("Intentando editar respuesta:", {
          id_respuesta,
          newContent,
        });
        const result = await ForumService.editarRespuesta(
          id_respuesta,
          newContent
        );
        console.log("Resultado API:", result);

        if (result.success) {
          textarea.replaceWith(this.createRespuestaParagraph(newContent));
          btnContainer.remove();
        } else {
          alert("Error al actualizar la respuesta: " + result.message);
        }
      } catch (error) {
        console.error("Error al llamar a editarRespuesta:", error);
        alert("Error al actualizar la respuesta, revisa la consola");
      }
    });

    cancelBtn.addEventListener("click", () => {
      textarea.replaceWith(this.createRespuestaParagraph(originalText));
      btnContainer.remove();
    });
  }

  private createRespuestaParagraph(text: string): HTMLParagraphElement {
    const p = document.createElement("p");
    p.className = "mb-0 respuesta-contenido";
    p.style.wordBreak = "break-word";
    p.style.fontSize = "0.95rem";
    p.style.color = "#343a40";
    p.textContent = text;
    return p;
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

      let response =
        (await ProfileEnterpriseService.fetchEnterpriseProfile()) as ProfileResponse;
      console.log("Perfil empresa:", response);

      if (response.success && response.data?.id_perfil) {
        id_perfil = response.data.id_perfil;
        console.log("ID perfil obtenido (empresa):", id_perfil);
      } else {
        const candidateResponse =
          (await ProfileCandidateService.fetchCandidateProfile()) as ProfileResponse;
        console.log("Perfil candidato:", candidateResponse);

        if (candidateResponse.success && candidateResponse.data?.id_perfil) {
          id_perfil = candidateResponse.data.id_perfil;
          console.log("ID perfil obtenido (candidato):", id_perfil);
        }
      }

      if (!id_perfil) {
        mensaje.textContent = "Debes crear un perfil antes de responder.";
        mensaje.className = "respuesta-msg text-danger small";
        return;
      }

      const fecha = new Date();
      console.log("Enviando respuesta con:", {
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
        mensaje.textContent = "Respuesta publicada correctamente";
        mensaje.className = "respuesta-msg text-success small";
        input.value = "";
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
