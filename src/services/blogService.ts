import { api } from "@/lib/api";

const apiUrl = api.baseUrl;

export class BlogService {
  constructor() {}

  public static async crearBlog(
    id_categoria: number,
    id_perfil: number,
    link_miniatura: string,
    titulo: string,
    contenido: string,
    fecha: Date
  ): Promise<any> {
    try {
      const response = await fetch(`${apiUrl}/recursos/blogs/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_categoria,
          id_perfil,
          link_miniatura,
          titulo,
          contenido,
          fecha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error del servidor:", data);
        return {
          success: false,
          error: data.error || "Error al crear el blog",
          message: data.message || `HTTP error! status: ${response.status}`,
          data: data
        };
      }

      return {
        success: true,
        data,
        message: "Blog creado correctamente",
      };
    } catch (error) {
      console.error("Error al crear el blog:", error);
      return {
        success: false,
        error: "Error al crear el blog",
        message: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  public static async getBlogs(): Promise<any> {
    try {
      const response = await fetch(`${apiUrl}/recursos/blogs/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data,
        message: "Blogs obtenidos correctamente",
      };
    } catch (error) {
      console.error("Error al obtener los blogs:", error);
      return {
        success: false,
        error: "Error al obtener los blogs",
        message: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  public static async getComentariosByBlogId(id_blog: number): Promise<any> {
    try {
      const response = await fetch(
        `${apiUrl}/recursos/comentarios/blog/${id_blog}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data,
        message: "Comentarios obtenidos correctamente",
      };
    } catch (error) {
      console.error("Error al obtener comentarios:", error);
      return {
        success: false,
        error: "Error al obtener comentarios",
        message: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  public static async crearComentario(
    id_blog: number,
    id_perfil: number,
    contenido: string,
    fecha: Date
  ): Promise<any> {
    try {
      const response = await fetch(`${apiUrl}/recursos/comentarios/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_blog,
          id_perfil,
          contenido,
          fecha,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data,
        message: "Comentario creado correctamente",
      };
    } catch (error) {
      console.error("Error al crear comentario:", error);
      return {
        success: false,
        error: "Error al crear comentario",
        message: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }
}