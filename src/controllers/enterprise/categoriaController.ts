import type { Categoria } from "@/interfaces/categoria.interface";
import { CategoriasService } from "@/services/categorias.service";

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

      if (!categoriasResponse.success) {
        console.error("Error en la respuesta:", categoriasResponse.message);
        this.categorias = [];
        return;
      }

      const data = categoriasResponse.data;

      if (!Array.isArray(data)) {
        console.error("La respuesta no es un array:", data);
        this.categorias = [];
        return;
      }

      this.categorias = data;
    } catch (error) {
      console.error("Error al obtener las categorias:", error);
      this.categorias = [];
    }
  }

  public renderCategorias(): void {
    const categoriasContainer = document.getElementById(
      "etiquetas-empleo"
    ) as HTMLSelectElement | null;

    if (!categoriasContainer) {
      console.error("No se encontró el contenedor de categorías");

      return;
    }

    if (this.categorias.length === 0) {
      console.warn("No hay categorías para mostrar");

      return;
    }

    // Guardamos la primera opción por defecto
    const defaultOption = categoriasContainer.querySelector('option[value=""]');

    // Limpiamos y reintegramos la opción por defecto
    categoriasContainer.innerHTML = "";
    if (defaultOption) {
      categoriasContainer.appendChild(defaultOption);
    } else {
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Selecciona una etiqueta";
      categoriasContainer.appendChild(placeholder);
    }

    this.categorias.forEach((categoria) => {
      try {
        const categoriaElement = document.createElement("option");
        categoriaElement.value = String(categoria.id_categoria);
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
  }
}

declare global {
  interface Window {
    categoriaController: CategoriaController;
  }
}

window.categoriaController = new CategoriaController();
