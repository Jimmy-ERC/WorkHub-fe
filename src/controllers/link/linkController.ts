import type { Link } from "@/interfaces/link.interface";
import type { ProfileResponse } from "@/interfaces/profileResponse.interface";
import { CategoriasService } from "@/services/categorias.service";
import { LinkService } from "@/services/linkServices";
import { ProfileCandidateService } from "@/services/profileCandidate.service";
import { ProfileEnterpriseService } from "@/services/profileEnterprise.service";

export class LinksController {
  private links: Link[] = [];
  private linksOriginales: Link[] = [];
  private categoriasFiltradas: Set<number> = new Set();
  private searchTerm: string = "";
  private id_perfil: any = null;

  constructor() {
    this.init();
  }

  private init(): void {
    const runAll = async () => {
      const currentUser =
        (await ProfileCandidateService.fetchCandidateProfile()) as ProfileResponse;
      this.id_perfil = currentUser.data.id_perfil;

      await this.loadCategorias();
      await this.loadLinks();
      this.renderLinks();
      this.setupFilters();
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", runAll);
    } else {
      runAll();
    }
  }

  private async loadCategorias(): Promise<void> {
    try {
      const categoriasResponse = await CategoriasService.getCategorias();
      const categorias = categoriasResponse.success
        ? categoriasResponse.data ?? []
        : [];

      const categoriasContainer = document.getElementById(
        "categorias-container"
      );
      if (!categoriasContainer) return;

      categoriasContainer.innerHTML = categorias
        .map(
          (cat: any) => `
        <div class="form-check category-checkbox p-2 rounded">
          <input
            class="form-check-input"
            type="checkbox"
            value="${cat.id_categoria}"
            id="categoria${cat.id_categoria}"
          />
          <label class="form-check-label" for="categoria${cat.id_categoria}">
            ${cat.nombre_categoria}
          </label>
        </div>
      `
        )
        .join("");
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  }

  private async loadLinks(): Promise<void> {
    try {
      const linksResponse = await LinkService.getLinks();

      console.log("Respuesta completa del servidor:", linksResponse);

      if (!linksResponse.success) {
        console.error("Error en la respuesta:", linksResponse.message);
        this.links = [];
        this.linksOriginales = [];
        return;
      }

      const payload = linksResponse.data;
      console.log("Payload recibido:", payload);
      

      // Intentar diferentes estructuras de respuesta
      if (Array.isArray(payload)) {
        this.links = payload;
        this.linksOriginales = payload;
      } else if (payload && Array.isArray(payload.data)) {
        this.links = payload.data;
        this.linksOriginales = payload.data;
      } else if (payload && payload.success && Array.isArray(payload.data)) {
        this.links = payload.data;
        this.linksOriginales = payload.data;
      } else {
        console.error("La respuesta no contiene un array válido:", payload);
        this.links = [];
        this.linksOriginales = [];
      }
      console.log("Cada link:", payload.data.map((l: { id_link: any; }) => l.id_link));

      console.log("Links cargados:", this.links);
    } catch (error) {
      console.error("Error al obtener los links:", error);
      this.links = [];
      this.linksOriginales = [];
    }
  }

  private setupFilters(): void {
    const searchInput = document.getElementById(
      "searchInput"
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchTerm = (e.target as HTMLInputElement).value
          .toLowerCase()
          .trim();
        this.applyFilters();
      });
    }

    const checkboxes = document.querySelectorAll(
      'input[type="checkbox"][id^="categoria"]'
    );
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const target = e.target as HTMLInputElement;
        const categoryId = parseInt(target.value);

        if (target.checked) {
          this.categoriasFiltradas.add(categoryId);
        } else {
          this.categoriasFiltradas.delete(categoryId);
        }

        this.applyFilters();
      });
    });
  }

  private applyFilters(): void {
    let filteredLinks = [...this.linksOriginales];

    if (this.searchTerm) {
      filteredLinks = filteredLinks.filter(
        (link) =>
          link.titulo?.toLowerCase().includes(this.searchTerm) ||
          link.descripcion?.toLowerCase().includes(this.searchTerm) ||
          link.url.toLowerCase().includes(this.searchTerm)
      );
    }

    if (this.categoriasFiltradas.size > 0) {
      filteredLinks = filteredLinks.filter((link) =>
        this.categoriasFiltradas.has(link.id_categoria)
      );
    }

    this.links = filteredLinks;
    this.renderLinks();
  }

  public renderLinks(): void {
    const linksContainer = document.getElementById("lista-recursos");
    if (!linksContainer) {
      console.error("No se encontró el contenedor de recursos");
      return;
    }

    const linksCountBadge = document.getElementById("resources-count");
    if (linksCountBadge) {
      linksCountBadge.textContent = `${this.links.length} ${
        this.links.length === 1 ? "recurso" : "recursos"
      }`;
    }

    linksContainer.innerHTML = "";

    // Botón para agregar nuevo recurso
    const crearBtn = document.createElement("button");
    crearBtn.className = "btn btn-primary mb-4";
    crearBtn.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Agregar Recurso';
    crearBtn.addEventListener("click", () => this.renderCrearLinkForm());
    linksContainer.appendChild(crearBtn);

    if (this.links.length === 0) {
      const emptyMsg = document.createElement("div");
      emptyMsg.className = "alert alert-info";
      emptyMsg.innerHTML =
        '<i class="bi bi-info-circle me-2"></i>No hay recursos disponibles con los filtros seleccionados.';
      linksContainer.appendChild(emptyMsg);
      return;
    }

    const grid = document.createElement("div");
    grid.className = "row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4";
    linksContainer.appendChild(grid);

    this.links.forEach((link) => {
      const col = document.createElement("div");
      col.className = "col";

      const card = document.createElement("div");
      card.className = "card resource-card border-0 shadow-sm h-100";
      card.setAttribute("data-link-id", link.id?.toString());

      const preview =
        link.descripcion && link.descripcion.length > 120
          ? link.descripcion.substring(0, 120) + "..."
          : link.descripcion || "Sin descripción disponible";

      card.innerHTML = `
        <div class="position-relative">
          <img
            src="${link.link_imagen}"}"
            class="card-img-top resource-image"
            alt="${link.titulo || "Recurso"}"
            onerror="this.src='https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=600&fit=crop'"
          />
        </div>
        <div class="card-body d-flex flex-column">
          <div class="d-flex align-items-center gap-2 mb-2">
            ${
              link.favicon
                ? `<img src="${link.favicon}" class="favicon-icon" alt="icon" onerror="this.style.display='none'" />`
                : '<i class="bi bi-link-45deg text-primary"></i>'
            }
            <small class="text-muted text-truncate">${new URL(link.url).hostname}</small>
          </div>
          <h5 class="card-title fw-bold mb-2">${link.titulo || "Recurso sin título"}</h5>
          <p class="card-text text-muted mb-3 flex-grow-1">${preview}</p>
        </div>
        <div class="card-footer">
          <div class="d-flex justify-content-between align-items-center">
            <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-primary">
              <i class="bi bi-box-arrow-up-right me-1"></i>Visitar
            </a>
            ${
              this.id_perfil === link.id_perfil
                ? `<button class="btn btn-sm btn-outline-danger eliminar-link" data-id="${link.id}">
                     <i class="bi bi-trash"></i>
                   </button>`
                : ""
            }
          </div>
        </div>
      `;

      const eliminarBtn = card.querySelector(".eliminar-link") as HTMLElement;
      if (eliminarBtn) {
        eliminarBtn.addEventListener("click", async (e) => {
          e.stopPropagation();

          const confirmar = confirm(
            "¿Estás seguro de que deseas eliminar este recurso?"
          );
          if (!confirmar) return;

          const result = await LinkService.eliminarLink(link.id);
          if (result.success) {
            alert("Recurso eliminado correctamente");
            await this.loadLinks();
            this.renderLinks();
          } else {
            alert("Error al eliminar el recurso");
          }
        });
      }

      col.appendChild(card);
      grid.appendChild(col);
    });
  }

  private async renderCrearLinkForm(): Promise<void> {
    const linksContainer = document.getElementById("lista-recursos");
    if (!linksContainer) return;

    const card = document.createElement("div");
    card.className = "card mb-4 shadow-sm";

    card.innerHTML = `
      <div class="card-body">
        <h5 class="card-title mb-3">
          <i class="bi bi-link-45deg me-2"></i>Agregar Nuevo Recurso
        </h5>
        <form class="crear-link-form">
          <div class="mb-3">
            <label class="form-label">URL del recurso</label>
            <input type="url" class="form-control" placeholder="https://ejemplo.com" required />
            <small class="text-muted">La información del sitio se extraerá automáticamente</small>
          </div>
          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-success">
              <i class="bi bi-check-circle me-2"></i>Agregar Recurso
            </button>
            <button type="button" class="btn btn-secondary cancelar">Cancelar</button>
          </div>
        </form>
        <div class="link-msg mt-3"></div>
      </div>
    `;

    const insertAfter = linksContainer.firstChild && linksContainer.firstChild.nextSibling
      ? linksContainer.firstChild.nextSibling
      : linksContainer.firstChild;
    linksContainer.insertBefore(card, insertAfter);

    const form = card.querySelector(".crear-link-form") as HTMLFormElement;
    const msg = card.querySelector(".link-msg") as HTMLElement;
    const cancelBtn = card.querySelector(".cancelar");

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        card.remove();
      });
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const url = (
        form.querySelector('input[type="url"]') as HTMLInputElement
      ).value.trim();

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
        msg.innerHTML =
          '<div class="alert alert-danger">Debes crear un perfil antes de agregar un recurso.</div>';
        return;
      }

      msg.innerHTML =
        '<div class="alert alert-info"><div class="spinner-border spinner-border-sm me-2"></div>Extrayendo información del sitio...</div>';

      const result = await LinkService.crearLink(url, id_perfil);

      if (result.success) {
        msg.innerHTML =
          '<div class="alert alert-success">Recurso agregado correctamente</div>';
        form.reset();
        setTimeout(() => card.remove(), 2000);
        await this.loadLinks();
        this.renderLinks();
      } else {
        msg.innerHTML = `<div class="alert alert-danger">Error: ${result.message || "No se pudo agregar el recurso"}</div>`;
      }
    });
  }
}

declare global {
  interface Window {
    linksController: LinksController;
  }
}

window.linksController = new LinksController();