import type { Blog } from "@/interfaces/blog.interface";
import type { ProfileResponse } from "@/interfaces/profileResponse.interface";
import { CategoriasService } from "@/services/categorias.service";
import { BlogService } from "@/services/blogService";
import { ProfileCandidateService } from "@/services/profileCandidate.service";
import { ProfileEnterpriseService } from "@/services/profileEnterprise.service";

declare var bootstrap: any;

export class BlogController {
  private blogs: Blog[] = [];
  private blogsOriginales: Blog[] = [];
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
      await this.loadBlogs();
      this.renderBlogs();
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

  private async loadBlogs(): Promise<void> {
    try {
      const blogsResponse = await BlogService.getBlogs();

      if (!blogsResponse.success) {
        console.error("Error en la respuesta:", blogsResponse.message);
        this.blogs = [];
        this.blogsOriginales = [];
        return;
      }

      const payload = blogsResponse.data;

      if (Array.isArray(payload)) {
        this.blogs = payload;
        this.blogsOriginales = payload;
      } else if (payload && Array.isArray(payload.data)) {
        this.blogs = payload.data;
        this.blogsOriginales = payload.data;
      } else {
        console.error("La respuesta no contiene un array válido:", payload);
        this.blogs = [];
        this.blogsOriginales = [];
      }
    } catch (error) {
      console.error("Error al obtener los blogs:", error);
      this.blogs = [];
      this.blogsOriginales = [];
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
    let filteredBlogs = [...this.blogsOriginales];

    if (this.searchTerm) {
      filteredBlogs = filteredBlogs.filter(
        (blog) =>
          blog.titulo.toLowerCase().includes(this.searchTerm) ||
          blog.contenido.toLowerCase().includes(this.searchTerm)
      );
    }

    if (this.categoriasFiltradas.size > 0) {
      filteredBlogs = filteredBlogs.filter((blog) =>
        this.categoriasFiltradas.has(blog.id_categoria)
      );
    }

    this.blogs = filteredBlogs;
    this.renderBlogs();
  }

  public renderBlogs(): void {
    const blogsContainer = document.getElementById("lista-foros");
    if (!blogsContainer) {
      console.error("No se encontró el contenedor de blogs");
      return;
    }

    const blogsCountBadge = document.getElementById("blogs-count");
    if (blogsCountBadge) {
      blogsCountBadge.textContent = `${this.blogs.length} ${
        this.blogs.length === 1 ? "blog" : "blogs"
      }`;
    }

    blogsContainer.innerHTML = "";

    const crearBtn = document.createElement("button");
    crearBtn.className = "btn btn-primary mb-4";
    crearBtn.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Crear Blog';
    crearBtn.addEventListener("click", () =>
      this.renderCrearBlogForm(blogsContainer)
    );
    blogsContainer.appendChild(crearBtn);

    if (this.blogs.length === 0) {
      const emptyMsg = document.createElement("div");
      emptyMsg.className = "alert alert-info";
      emptyMsg.innerHTML =
        '<i class="bi bi-info-circle me-2"></i>No hay blogs disponibles con los filtros seleccionados.';
      blogsContainer.appendChild(emptyMsg);
      return;
    }

    this.blogs.forEach((blog) => {
      const card = document.createElement("div");

      card.className = "card blog-card border-0 shadow-sm overflow-hidden";
      card.setAttribute("data-blog-id", blog.id_blog.toString());

      const preview =
        blog.contenido.length > 150
          ? blog.contenido.substring(0, 150) + "..."
          : blog.contenido;

      card.innerHTML = `
  <div class="row g-0">
    <div class="col-md-4">
      <img
        src="${
          blog.link_miniatura ||
          "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop"
        }"
        class="img-fluid blog-image w-100"
        alt="${blog.titulo}"
        onerror="this.src='https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop'"
      />
    </div>
    <div class="col-md-8">
      <div class="card-body p-4">
        <div class="d-flex align-items-center gap-3 mb-2 text-muted small">
          <span>
            <i class="bi bi-calendar-event me-1"></i>
            ${this.formatFecha(blog.fecha)}
          </span>
          <span class="comentarios-count">
            <i class="bi bi-chat me-1"></i>
            <span class="count">0</span> Comentarios
          </span>
        </div>
        <h5 class="card-title fw-bold mb-3">${blog.titulo}</h5>
        <p class="card-text text-muted mb-3">${preview}</p>
        
        <div class="d-flex gap-2 align-items-center">
          <button class="btn btn-link text-primary text-decoration-none p-0 ver-detalle" data-id="${
            blog.id_blog
          }">
            Leer más <i class="bi bi-arrow-right ms-1"></i>
          </button>

          ${
            this.id_perfil === blog.id_perfil
              ? `
      <button class="btn btn-sm btn-outline-warning ms-2 editar-blog" data-id="${blog.id_blog}">
        <i class="bi bi-pencil"></i>
      </button>
      <button class="btn btn-sm btn-outline-danger eliminar-blog" data-id="${blog.id_blog}">
        <i class="bi bi-trash"></i>
      </button>
    `
              : ""
          }

        </div>

      </div>
    </div>
  </div>
`;
      // Botón editar
      const editarBtn = card.querySelector(".editar-blog") as HTMLElement;
      if (editarBtn) {
        editarBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.openOptionsModal(blog.id_blog);
        });
      }

      // Botón eliminar
      const eliminarBtn = card.querySelector(".eliminar-blog") as HTMLElement;
      if (eliminarBtn) {
        eliminarBtn.addEventListener("click", async (e) => {
          e.stopPropagation();

          const confirmar = confirm(
            "¿Estás seguro de que deseas eliminar este blog?"
          );
          if (!confirmar) return;

          const result = await BlogService.eliminarBlog(blog.id_blog);
          if (result.success) {
            alert("Blog eliminado correctamente");
            await this.loadBlogs();
            this.renderBlogs();
          } else {
            alert("Error al eliminar el blog");
          }
        });
      }

      // Hacer toda la card clickeable
      card.style.cursor = "pointer";
      card.addEventListener("click", (e) => {
        e.preventDefault();

        const target = e.target as HTMLElement;
        const btnDetalle = target.closest(".ver-detalle");

        // Si se clickea el botón específico
        if (btnDetalle) {
          const id = btnDetalle.getAttribute("data-id");
          if (id) {
            window.location.href = `./blogDetail.html?id=${id}`;
          }
          return;
        }

        // Si se hace clic en cualquier parte de la card
        window.location.href = `./blogDetail.html?id=${blog.id_blog}`;
      });

      blogsContainer.appendChild(card);

      // Cargar conteo de comentarios
      this.loadComentariosCount(blog.id_blog, card);
    });
  }

  private async loadComentariosCount(
    id_blog: number,
    card: HTMLElement
  ): Promise<void> {
    const response = await BlogService.getComentariosByBlogId(id_blog);
    const comentarios = Array.isArray(response.data?.data)
      ? response.data.data
      : [];
    const countElement = card.querySelector(".comentarios-count .count");
    if (countElement) {
      countElement.textContent = comentarios.length.toString();
    }
  }
  private async renderCrearBlogForm(
    container: HTMLElement,
    blogToEdit?: Blog
  ): Promise<void> {
    const card = document.createElement("div");
    card.className = "card mb-4 shadow-sm";

    const categoriasResponse = await CategoriasService.getCategorias();
    const categorias = categoriasResponse.success
      ? categoriasResponse.data ?? []
      : [];

    const options = categorias
      .map(
        (c) =>
          `<option value="${c.id_categoria}" ${
            blogToEdit?.id_categoria === c.id_categoria ? "selected" : ""
          }>${c.nombre_categoria}</option>`
      )
      .join("");

    card.innerHTML = `
    <div class="card-body">
      <h5 class="card-title mb-3">
        <i class="bi bi-pencil-square me-2"></i>${
          blogToEdit ? "Editar Blog" : "Crear Nuevo Blog"
        }
      </h5>
      <form class="crear-blog-form">
        <div class="mb-3">
          <label class="form-label">Título</label>
          <input type="text" class="form-control" placeholder="Título del blog" required
                 value="${blogToEdit?.titulo || ""}" />
        </div>
        <div class="mb-3">
          <label class="form-label">Contenido</label>
          <textarea class="form-control" placeholder="Escribe el contenido de tu blog..." rows="5" required>${
            blogToEdit?.contenido || ""
          }</textarea>
        </div>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Categoría</label>
            <select class="form-select" required>
              <option value="" disabled ${
                blogToEdit ? "" : "selected"
              }>Selecciona una categoría</option>
              ${options}
            </select>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">URL de imagen miniatura</label>
            <input type="url" class="form-control link-miniatura" placeholder="https://ejemplo.com/imagen.jpg" value="${
              blogToEdit?.link_miniatura || ""
            }" />
            <small class="text-muted">Opcional - Deja vacío para usar imagen por defecto</small>
          </div>
        </div>
        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-success">
            <i class="bi ${
              blogToEdit ? "bi-pencil-square" : "bi-check-circle"
            } me-2"></i>${blogToEdit ? "Actualizar Blog" : "Publicar Blog"}
          </button>
          <button type="button" class="btn btn-secondary cancelar">Cancelar</button>
        </div>
      </form>
      <div class="blog-msg mt-3"></div>
    </div>
  `;

    container.innerHTML = "";
    container.appendChild(card);

    const form = card.querySelector(".crear-blog-form") as HTMLFormElement;
    const msg = card.querySelector(".blog-msg") as HTMLElement;
    const cancelBtn = card.querySelector(".cancelar");

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        card.remove();
      });
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const titulo = (
        form.querySelector('input[type="text"]') as HTMLInputElement
      ).value.trim();
      const contenido = (
        form.querySelector("textarea") as HTMLTextAreaElement
      ).value.trim();
      const categoriaId = parseInt(
        (form.querySelector("select") as HTMLSelectElement).value
      );
      const linkMiniatura =
        (
          form.querySelector(".link-miniatura") as HTMLInputElement
        ).value.trim() ||
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop";

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
          '<div class="alert alert-danger">Debes crear un perfil antes de publicar un blog.</div>';
        return;
      }

      const fecha = new Date();

      let result;
      if (blogToEdit) {
        result = await BlogService.actualizarBlog(blogToEdit.id_blog, {
          id_categoria: categoriaId,
          id_perfil: id_perfil,
          link_miniatura: linkMiniatura,
          titulo: titulo,
          contenido: contenido,
          fecha: fecha,
        });
      } else {
        result = await BlogService.crearBlog(
          id_perfil,
          categoriaId,
          linkMiniatura,
          titulo,
          contenido,
          fecha
        );
      }

      if (result.success) {
        msg.innerHTML = `<div class="alert alert-success">${
          blogToEdit ? "Blog actualizado" : "Blog creado"
        } correctamente</div>`;
        form.reset();
        setTimeout(() => card.remove(), 2000);
        await this.loadBlogs();
        this.renderBlogs();
      } else {
        msg.innerHTML = `<div class="alert alert-danger">Error al ${
          blogToEdit ? "actualizar" : "crear"
        } el blog</div>`;
      }
    });
  }

  private async toggleComentarios(
    id_blog: number,
    card: HTMLElement
  ): Promise<void> {
    const comentariosContainer = card.querySelector(
      ".comentarios-container"
    ) as HTMLElement;
    const comentarContainer = card.querySelector(
      ".comentar-container"
    ) as HTMLElement;
    const toggleBtn = card.querySelector(".ver-comentarios") as HTMLElement;

    if (!comentariosContainer || !toggleBtn) return;

    if (comentariosContainer.style.display === "block") {
      comentariosContainer.style.display = "none";
      comentarContainer.style.display = "none";
      toggleBtn.innerHTML =
        '<i class="bi bi-chevron-down"></i> Ver comentarios';
      return;
    }

    comentariosContainer.innerHTML = `
      <div class="text-center text-muted py-3">
        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
        Cargando comentarios...
      </div>`;
    comentariosContainer.style.display = "block";

    const response = await BlogService.getComentariosByBlogId(id_blog);
    const comentarios = Array.isArray(response.data?.data)
      ? response.data.data
      : [];

    if (comentarios.length === 0) {
      comentariosContainer.innerHTML = `
        <div class="alert alert-light border">
          <i class="bi bi-chat-left-text me-2"></i>No hay comentarios todavía. ¡Sé el primero en comentar!
        </div>`;
    } else {
      const comentariosHTML = comentarios
        .map(
          (c: any) => `
        <div class="card mt-2 border-start border-3 border-primary shadow-sm">
          <div class="card-body py-2 px-3">
            <div class="d-flex align-items-center mb-2">
              <img src="${
                c.link_foto_perfil ?? "https://via.placeholder.com/35"
              }" 
                   class="rounded-circle me-2" alt="avatar" 
                   style="width:35px; height:35px; object-fit:cover;">
              <div class="d-flex flex-column">
                <strong class="text-dark">@${c.nombre_usuario}</strong>
                <small class="text-muted">${this.formatFecha(
                  new Date(c.fecha)
                )}</small>
              </div>
            </div>
            <p class="mb-0" style="word-break: break-word;">${c.contenido}</p>
          </div>
        </div>`
        )
        .join("");

      comentariosContainer.innerHTML = comentariosHTML;
    }

    toggleBtn.innerHTML = `<i class="bi bi-chevron-up"></i> Ocultar comentarios (${comentarios.length})`;

    this.renderComentarForm(id_blog, card, comentarContainer);
  }

  private async openOptionsModal(blogId: number): Promise<void> {
    const modalElement = document.getElementById("blogOptionsModal");
    if (!modalElement) return;

    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    const modalBody = document.getElementById("blogModalBody");
    const modalTitle = document.getElementById("blogModalTitle");

    const blog = this.blogs.find((b) => b.id_blog === blogId);
    if (!blog || !modalBody || !modalTitle) return;

    modalTitle.textContent = "Editar Blog";

    await this.renderCrearBlogForm(modalBody, blog);
  }

  private renderComentarForm(
    id_blog: number,
    card: HTMLElement,
    container: HTMLElement
  ): void {
    container.style.display = "block";
    container.innerHTML = `
      <div class="card bg-light border">
        <div class="card-body">
          <form class="comentar-form">
            <div class="mb-2">
              <textarea class="form-control" placeholder="Escribe tu comentario..." rows="2" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-sm">
              <i class="bi bi-send me-1"></i>Enviar comentario
            </button>
          </form>
          <div class="comentario-msg mt-2"></div>
        </div>
      </div>
    `;

    const form = container.querySelector(".comentar-form") as HTMLFormElement;
    const msg = container.querySelector(".comentario-msg") as HTMLElement;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const textarea = form.querySelector("textarea") as HTMLTextAreaElement;
      const contenido = textarea.value.trim();
      if (!contenido) return;

      const fecha = new Date();
      const result = await BlogService.crearComentario(
        id_blog,
        this.id_perfil,
        contenido,
        fecha
      );

      if (result.success) {
        msg.innerHTML =
          '<small class="text-success"><i class="bi bi-check-circle me-1"></i>Comentario publicado</small>';
        textarea.value = "";
        setTimeout(() => (msg.innerHTML = ""), 3000);
        await this.toggleComentarios(id_blog, card);
        await this.toggleComentarios(id_blog, card);
      } else {
        msg.innerHTML =
          '<small class="text-danger"><i class="bi bi-x-circle me-1"></i>Error al publicar</small>';
      }
    });
  }

  private formatFecha(fecha: Date | string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}

declare global {
  interface Window {
    blogController: BlogController;
  }
}

window.blogController = new BlogController();
