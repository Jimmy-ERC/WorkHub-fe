import type { Categoria } from "@/interfaces/categoria.interface.ts";
import { CategoriasService } from "@/services/categoriasService.ts";

export class CategoriaController {
  private categorias: Categoria[] = [];

  constructor() {
    this.init();
  }

  private init(): void {
    const runAll = async () => {
      await this.loadCategorias();
      this.renderCategorias();
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

      if (!categoriasResponse) {
        console.error("Error en la respuesta:", "Error desconocido");
        return;
      }

      // Validar que la respuesta sea un array
      if (!Array.isArray(categoriasResponse.data)) {
        console.error("La respuesta no es un array:", categoriasResponse.data);
        this.categorias = [];
        return;
      }

      this.categorias = categoriasResponse.data;
    } catch (error) {
      console.error("Error al obtener las categorias:", error);
      this.categorias = [];
    }
  }

  public renderCategorias(): void {
    const categoriasContainer = document.getElementById("etiquetas-empleo");

    if (!categoriasContainer) {
      console.error("No se encontró el contenedor de categorías");
      return;
    }

    // Validar que categorias sea un array antes de iterar
    if (!Array.isArray(this.categorias)) {
      console.error("this.categorias no es un array:", this.categorias);
      return;
    }

    if (this.categorias.length === 0) {
      console.warn("No hay categorías para mostrar");
      return;
    }

    // Limpiar el contenedor antes de agregar nuevas opciones
    // Mantener la primera opción por defecto
    const defaultOption = categoriasContainer.querySelector('option[value=""]');
    categoriasContainer.innerHTML = "";
    if (defaultOption) {
      categoriasContainer.appendChild(defaultOption);
    }

    this.categorias.forEach((categoria) => {
      try {
        const categoriaElement = document.createElement("option");
        categoriaElement.value = categoria.id_categoria.toString();
        categoriaElement.textContent = categoria.nombre_categoria;
        categoriasContainer.appendChild(categoriaElement);
      } catch (error) {
        console.error(
          "Error al crear opción para categoría:",
          categoria,
          error
        );
      }
    });

    console.log(`Se agregaron ${this.categorias.length} categorías al select`);
  }
}

// Crear instancia global para acceso desde HTML
declare global {
  interface Window {
    categoriaController: CategoriaController;
  }
}

window.categoriaController = new CategoriaController();
