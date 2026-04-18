import { MenuItemRestaurante, PromocionRestaurante } from '../models/restaurante.model';

const menusPorCategoria: Record<string, MenuItemRestaurante[]> = {
  Criollo: [
    { nombre: 'Bandera Dominicana', descripcion: 'Arroz, habichuelas y carne guisada.', precio: 325, destacado: true },
    { nombre: 'Mofongo de Chicharron', descripcion: 'Pure de platano con chicharron crujiente.', precio: 390 },
    { nombre: 'Sancocho del Dia', descripcion: 'Receta tradicional dominicana.', precio: 280 }
  ],
  Mariscos: [
    { nombre: 'Pescado Frito', descripcion: 'Servido con tostones y ensalada fresca.', precio: 520, destacado: true },
    { nombre: 'Camarones al Ajillo', descripcion: 'Camarones salteados en mantequilla y ajo.', precio: 610 },
    { nombre: 'Paella Caribe', descripcion: 'Arroz meloso con mariscos mixtos.', precio: 740 }
  ],
  Tradicional: [
    { nombre: 'Pollo Guisado', descripcion: 'Con arroz blanco y ensalada.', precio: 295, destacado: true },
    { nombre: 'Pastelon', descripcion: 'Capas de platano maduro y carne.', precio: 310 },
    { nombre: 'Asopao', descripcion: 'Caldo espeso con pollo y vegetales.', precio: 285 }
  ],
  Italiana: [
    { nombre: 'Pizza de la Casa', descripcion: 'Mozzarella, pepperoni y salsa artesanal.', precio: 480, destacado: true },
    { nombre: 'Pasta Alfredo', descripcion: 'Fettuccine en salsa cremosa.', precio: 430 },
    { nombre: 'Lasaña Mixta', descripcion: 'Carne, queso y salsa pomodoro.', precio: 450 }
  ],
  'Comida Rapida': [
    { nombre: 'Burger Stop Doble', descripcion: 'Doble carne, queso cheddar y salsa especial.', precio: 360, destacado: true },
    { nombre: 'Hot Dog Supremo', descripcion: 'Salchicha jumbo con topping criollo.', precio: 210 },
    { nombre: 'Papas Loaded', descripcion: 'Papas fritas con bacon y queso.', precio: 240 }
  ],
  'Postres y Cafe': [
    { nombre: 'Tres Leches', descripcion: 'Bizcocho humedo con crema batida.', precio: 180, destacado: true },
    { nombre: 'Cafe Especial', descripcion: 'Cafe dominicano con canela.', precio: 120 },
    { nombre: 'Flan de Vainilla', descripcion: 'Suave y cremoso.', precio: 150 }
  ]
};

const promocionesPorCategoria: Record<string, PromocionRestaurante[]> = {
  Criollo: [
    { titulo: 'Combo familiar', descripcion: '15% de descuento de lunes a jueves.' }
  ],
  Mariscos: [
    { titulo: 'Happy hour marino', descripcion: '2x1 en entradas despues de las 6:00 PM.' }
  ],
  Tradicional: [
    { titulo: 'Almuerzo ejecutivo', descripcion: 'Bebida incluida en horario de almuerzo.' }
  ],
  Italiana: [
    { titulo: 'Martes de pizza', descripcion: 'Segunda pizza al 50%.' }
  ],
  'Comida Rapida': [
    { titulo: 'Burger combo', descripcion: 'Papas y refresco gratis en combos seleccionados.' }
  ],
  'Postres y Cafe': [
    { titulo: 'Tarde dulce', descripcion: 'Cafe + postre con precio especial.' }
  ]
};

export function obtenerMenuPorCategoria(categoria: string): MenuItemRestaurante[] {
  return menusPorCategoria[categoria] ? [...menusPorCategoria[categoria]] : [
    { nombre: 'Especial de la casa', descripcion: 'Seleccion del chef.', precio: 350, destacado: true }
  ];
}

export function obtenerPromocionesPorCategoria(categoria: string): PromocionRestaurante[] {
  return promocionesPorCategoria[categoria] ? [...promocionesPorCategoria[categoria]] : [
    { titulo: 'Promocion especial', descripcion: 'Consulta en el local por la oferta del dia.' }
  ];
}
