export interface PromocionRestaurante {
  titulo: string;
  descripcion: string;
  vigencia?: string;
}

export interface MenuItemRestaurante {
  nombre: string;
  descripcion: string;
  precio: number;
  destacado?: boolean;
}

export interface ResenaRestaurante {
  id: string;
  restauranteId: string;
  autor: string;
  comentario: string;
  calificacion: number;
  fotoUrl?: string;
  fecha: string;
  origen: 'local' | 'server';
  pendienteSync?: boolean;
}

export interface Restaurante {
  id: string;
  nombre: string;
  categoria: string;
  distancia: string;
  distanciaKm: number;
  calificacion: number;
  imagen: string;
  descripcion: string;
  telefono?: string;
  precioNivel: number;
  latitud?: number;
  longitud?: number;
  promociones: PromocionRestaurante[];
  menu: MenuItemRestaurante[];
}

export type OrdenRestaurantes =
  | 'destacados'
  | 'calificacion'
  | 'distancia'
  | 'precio-asc'
  | 'precio-desc';

export interface FiltrosRestaurantes {
  textoBusqueda: string;
  categoria: string;
  precioMaximo: number | null;
  calificacionMinima: number | null;
  distanciaMaximaKm: number | null;
  orden: OrdenRestaurantes;
}
