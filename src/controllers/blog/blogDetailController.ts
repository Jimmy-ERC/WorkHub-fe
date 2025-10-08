import type { Blog } from "@/interfaces/blog.interface";
import type { ProfileResponse } from "@/interfaces/profileResponse.interface";
import { BlogService } from "@/services/blogService";
import { CategoriasService } from "@/services/categorias.service";
import { ProfileCandidateService } from "@/services/profileCandidate.service";
import { ProfileEnterpriseService } from "@/services/profileEnterprise.service";

export class BlogDetailController {
  private blogId: number | null = null;
  private blog: Blog | null = null;
  private id_perfil: number | null = null;


  constructor() {
    this.init();
  }

  private init(): void {
    const runAll = async () => {
            const currentUser =
        (await ProfileCandidateService.fetchCandidateProfile()) as ProfileResponse;
      this.id_perfil = currentUser.data.id_perfil;
      this.getBlogIdFromURL();
      if (this.blogId) {
        await this.loadBlog();
        if (this.blog) {
          this.renderBlog();
          await this.loadComentarios();
          this.setupCommentForm();
        }
      } else {
        this.showError();
      }
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", runAll);
    } else {
      runAll();
    }
  }

  private getBlogIdFromURL(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    this.blogId = id ? parseInt(id) : null;
  }

  private async loadBlog(): Promise<void> {
    try {
      const response = await BlogService.getBlogs();
      
      if (!response.success) {
        this.showError();
        return;
      }

      const blogs = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];

      this.blog = blogs.find((b: Blog) => b.id_blog === this.blogId) || null;

      if (!this.blog) {
        this.showError();
      }
    } catch (error) {
      console.error("Error al cargar el blog:", error);
      this.showError();
    }
  }

  private async renderBlog(): Promise<void> {
    if (!this.blog) return;

    // Ocultar loading, mostrar contenido
    const loading = document.getElementById("loading");
    const content = document.getElementById("blog-content");
    if (loading) loading.style.display = "none";
    if (content) content.style.display = "block";

    // Imagen hero
    const heroImage = document.getElementById("blog-hero-image") as HTMLImageElement;
    if (heroImage) {
      heroImage.src =
        this.blog.link_miniatura ||
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=400&fit=crop";
      heroImage.alt = this.blog.titulo;
    }

    // Título
    const title = document.getElementById("blog-title");
    if (title) title.textContent = this.blog.titulo;

    // Fecha
    const dateText = document.querySelector("#blog-date .date-text");
    if (dateText) dateText.textContent = this.formatFecha(this.blog.fecha);

    // Categoría
    const categoryText = document.querySelector("#blog-category .category-text");
    if (categoryText) {
      const categoriaResponse = await CategoriasService.getCategorias();
      const categorias = categoriaResponse.success ? categoriaResponse.data ?? [] : [];
      const categoria = categorias.find((c: any) => c.id_categoria === this.blog?.id_categoria);
      categoryText.textContent = categoria?.nombre_categoria || "Sin categoría";
    }

    const authorAvatar = document.getElementById("author-avatar") as HTMLImageElement;
    const authorName = document.getElementById("author-name");
    if (authorAvatar && authorName) {
      // @ts-ignore - Si tu Blog interface tiene estos campos
      authorAvatar.src = this.blog.link_foto_perfil || "https://via.placeholder.com/50";
      // @ts-ignore
      authorName.textContent = `@${this.blog.nombre_usuario || "Usuario"}`;
    }

    // Contenido
    const blogText = document.getElementById("blog-text");
    if (blogText) {
      // Dividir el contenido en párrafos si viene como texto plano
      const paragraphs = this.blog.contenido.split("\n\n").filter((p) => p.trim());
      blogText.innerHTML = paragraphs.map((p) => `<p>${p}</p>`).join("");
    }

    // Actualizar título de la página
    document.title = `${this.blog.titulo} - Workhub`;
  }

  private async loadComentarios(): Promise<void> {
    if (!this.blogId) return;

    try {
      const response = await BlogService.getComentariosByBlogId(this.blogId);
      const comentarios = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      // Actualizar contador
      const countElements = document.querySelectorAll("#blog-comments-count .count, #comments-total");
      countElements.forEach((el) => {
        el.textContent = comentarios.length.toString();
      });

      // Renderizar comentarios
      this.renderComentarios(comentarios);
    } catch (error) {
      console.error("Error al cargar comentarios:", error);
    }
  }
private renderComentarios(comentarios: any[]): void {
  const commentsList = document.getElementById("comments-list");
  const noComments = document.getElementById("no-comments");

  if (!commentsList) return;

  if (comentarios.length === 0) {
    commentsList.innerHTML = "";
    if (noComments) noComments.style.display = "block";
    return;
  }

  if (noComments) noComments.style.display = "none";

  commentsList.innerHTML = comentarios
    .map((comentario) => {
      const isMine = comentario.id_perfil === this.id_perfil;
      return `
      <div class="card comment-card shadow-sm border-start border-4 border-primary" data-id="${comentario.id_comentario}">
        <div class="card-body">
          <div class="d-flex align-items-start mb-3">
            <img
              src="${comentario.link_foto_perfil || "https://via.placeholder.com/40"}"
              alt="${comentario.nombre_usuario}"
              class="rounded-circle me-3"
              style="width: 40px; height: 40px; object-fit: cover;"
            />
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h6 class="mb-0 fw-bold">@${comentario.nombre_usuario}</h6>
                  <small class="text-muted">${this.formatFecha(comentario.fecha)}</small>
                </div>
                ${
                  isMine
                    ? `<div class="dropdown">
                         <button class="btn btn-sm btn-link text-muted p-0" data-bs-toggle="dropdown" aria-expanded="false">
                           <i class="bi bi-three-dots"></i>
                         </button>
                         <ul class="dropdown-menu dropdown-menu-end">
                           <li><a class="dropdown-item editar-comentario" href="#">Editar</a></li>
                           <li><a class="dropdown-item eliminar-comentario" href="#">Eliminar</a></li>
                         </ul>
                       </div>`
                    : ""
                }
              </div>
              <p class="mb-0 comment-content" style="white-space: pre-wrap;">${comentario.contenido}</p>
            </div>
          </div>
        </div>
      </div>
      `;
    })
    .join("");

  this.setupCommentActions();
}
private setupCommentActions(): void {
  const editButtons = document.querySelectorAll(".editar-comentario");
  const deleteButtons = document.querySelectorAll(".eliminar-comentario");

  editButtons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const card = (e.target as HTMLElement).closest(".comment-card") as HTMLElement;
      this.makeCommentEditable(card);
    });
  });

  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const card = (e.target as HTMLElement).closest(".comment-card") as HTMLElement;
      const id_comentario = parseInt(card.getAttribute("data-id")!);

      if (!confirm("¿Seguro que deseas eliminar este comentario?")) return;

      const result = await BlogService.eliminarComentario(id_comentario);
      if (result.success) {
        card.remove();
      } else {
        alert("Error al eliminar comentario");
      }
    });
  });
}
private makeCommentEditable(card: HTMLElement): void {
  const contentP = card.querySelector(".comment-content") as HTMLParagraphElement;
  const originalText = contentP.textContent || "";

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
    const id_comentario = parseInt(card.getAttribute("data-id")!);

    if (!newContent) return;

    const result = await BlogService.actualizarComentario(id_comentario, newContent, new Date());
    if (result.success) {
      textarea.replaceWith(this.createContentParagraph(newContent));
      btnContainer.remove();
    } else {
      alert("Error al actualizar el comentario");
    }
  });

  cancelBtn.addEventListener("click", () => {
    textarea.replaceWith(this.createContentParagraph(originalText));
    btnContainer.remove();
  });
}

private createContentParagraph(text: string): HTMLParagraphElement {
  const p = document.createElement("p");
  p.className = "mb-0 comment-content";
  p.style.whiteSpace = "pre-wrap";
  p.textContent = text;
  return p;
}

  // private renderComentarios(comentarios: any[]): void {
  //   const commentsList = document.getElementById("comments-list");
  //   const noComments = document.getElementById("no-comments");

  //   if (!commentsList) return;

  //   if (comentarios.length === 0) {
  //     commentsList.innerHTML = "";
  //     if (noComments) noComments.style.display = "block";
  //     return;
  //   }

  //   if (noComments) noComments.style.display = "none";

  //   commentsList.innerHTML = comentarios
  //     .map(
  //       (comentario) => `
  //     <div class="card comment-card shadow-sm border-start border-4 border-primary">
  //       <div class="card-body">
  //         <div class="d-flex align-items-start mb-3">
  //           <img
  //             src="${comentario.link_foto_perfil || "https://via.placeholder.com/40"}"
  //             alt="${comentario.nombre_usuario}"
  //             class="rounded-circle me-3"
  //             style="width: 40px; height: 40px; object-fit: cover;"
  //           />
  //           <div class="flex-grow-1">
  //             <div class="d-flex justify-content-between align-items-start">
  //               <div>
  //                 <h6 class="mb-0 fw-bold">@${comentario.nombre_usuario}</h6>
  //                 <small class="text-muted">${this.formatFecha(comentario.fecha)}</small>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //         <p class="mb-0" style="white-space: pre-wrap;">${comentario.contenido}</p>
  //       </div>
  //     </div>
  //   `
  //     )
  //     .join("");
  // }

  private setupCommentForm(): void {
    const form = document.getElementById("comment-form") as HTMLFormElement;
    const textarea = document.getElementById("comment-textarea") as HTMLTextAreaElement;
    const message = document.getElementById("comment-message");

    if (!form || !textarea || !message) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const contenido = textarea.value.trim();
      if (!contenido) return;

      // Obtener id_perfil
      let id_perfil: number | undefined;
      const profileRes = (await ProfileEnterpriseService.fetchEnterpriseProfile()) as ProfileResponse;
      if (profileRes.success && profileRes.data?.id_perfil) {
        id_perfil = profileRes.data.id_perfil;
      } else {
        const candidateRes = (await ProfileCandidateService.fetchCandidateProfile()) as ProfileResponse;
        if (candidateRes.success && candidateRes.data?.id_perfil) {
          id_perfil = candidateRes.data.id_perfil;
        }
      }

      if (!id_perfil) {
        message.innerHTML =
          '<div class="alert alert-danger"><i class="bi bi-exclamation-triangle me-2"></i>Debes crear un perfil antes de comentar.</div>';
        return;
      }

      if (!this.blogId) return;

      // Deshabilitar formulario
      form.classList.add("opacity-50");
      const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Publicando...';
      }

      try {
        const fecha = new Date();
        const result = await BlogService.crearComentario(
          this.blogId,
          id_perfil,
          contenido,
          fecha
        );

        if (result.success) {
          message.innerHTML =
            '<div class="alert alert-success"><i class="bi bi-check-circle me-2"></i>Comentario publicado correctamente</div>';
          textarea.value = "";
          
          await this.loadComentarios();

          setTimeout(() => {
            message.innerHTML = "";
          }, 3000);
        } else {
          message.innerHTML =
            '<div class="alert alert-danger"><i class="bi bi-x-circle me-2"></i>Error al publicar el comentario</div>';
        }
      } catch (error) {
        message.innerHTML =
          '<div class="alert alert-danger"><i class="bi bi-x-circle me-2"></i>Error al publicar el comentario</div>';
      } finally {
        // Rehabilitar formulario
        form.classList.remove("opacity-50");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="bi bi-send me-2"></i>Publicar comentario';
        }
      }
    });
  }

  private showError(): void {
    const loading = document.getElementById("loading");
    const content = document.getElementById("blog-content");
    const error = document.getElementById("error-state");

    if (loading) loading.style.display = "none";
    if (content) content.style.display = "none";
    if (error) error.style.display = "block";
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
    blogDetailController: BlogDetailController;
  }
}

window.blogDetailController = new BlogDetailController();