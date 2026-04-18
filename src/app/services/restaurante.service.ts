import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

import { initializeApp } from 'firebase/app';
import { addDoc, collection, getDocs, getFirestore, query, where } from 'firebase/firestore/lite';
import { MenuItemRestaurante, PromocionRestaurante, ResenaRestaurante, Restaurante } from '../models/restaurante.model';
import { obtenerMenuPorCategoria, obtenerPromocionesPorCategoria } from '../utils/restaurante-defaults';

const firebaseConfig = {
  apiKey: 'AIzaSyDN4LLme9FTVrYTK37w3ICyCsRxLaISATw',
  authDomain: 'foodierd-6853b.firebaseapp.com',
  projectId: 'foodierd-6853b',
  storageBucket: 'foodierd-6853b.firebasestorage.app',
  messagingSenderId: '490185860414',
  appId: '1:490185860414:web:02a2bfd8920c3e5746386f'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

@Injectable({
  providedIn: 'root'
})
export class RestauranteService {
  constructor() {}

  getRestaurantes(): Observable<Restaurante[]> {
    const restaurantesCol = collection(db, 'restaurantes');

    return from(
      getDocs(restaurantesCol).then(snapshot => {
        return snapshot.docs.map(doc => {
          const data = doc.data();
          return this.normalizarRestaurante({
            id: doc.id,
            ...data
          });
        });
      })
    );
  }

  async getResenas(restauranteId: string): Promise<ResenaRestaurante[]> {
    const resenasCol = collection(db, 'resenas');
    const resenasQuery = query(resenasCol, where('restauranteId', '==', restauranteId));
    const snapshot = await getDocs(resenasQuery);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        restauranteId,
        autor: String(data['autor'] ?? 'Foodie RD'),
        comentario: String(data['comentario'] ?? ''),
        calificacion: Number(data['calificacion'] ?? 5),
        fotoUrl: data['fotoUrl'] ? String(data['fotoUrl']) : undefined,
        fecha: String(data['fecha'] ?? new Date().toISOString()),
        origen: 'server',
        pendienteSync: false
      } satisfies ResenaRestaurante;
    });
  }

  async guardarResena(resena: Omit<ResenaRestaurante, 'id' | 'origen' | 'pendienteSync'>): Promise<string> {
    const resenasCol = collection(db, 'resenas');
    const docRef = await addDoc(resenasCol, {
      restauranteId: resena.restauranteId,
      autor: resena.autor,
      comentario: resena.comentario,
      calificacion: resena.calificacion,
      fotoUrl: resena.fotoUrl ?? '',
      fecha: resena.fecha
    });

    return docRef.id;
  }

  private normalizarRestaurante(data: any): Restaurante {
    const categoria = String(data['categoria'] ?? 'Tradicional');
    const distanciaKm = this.extraerDistanciaKm(data['distanciaKm'] ?? data['distancia']);
    const precioNivel = this.normalizarPrecioNivel(data['precioNivel'] ?? data['precio'] ?? data['priceLevel']);
    const menu = this.normalizarMenu(data['menu'], categoria);
    const promociones = this.normalizarPromociones(data['promociones'], categoria);

    return {
      id: String(data['id']),
      nombre: String(data['nombre'] ?? 'Restaurante sin nombre'),
      categoria,
      distancia: this.formatearDistancia(distanciaKm),
      distanciaKm,
      calificacion: Number(data['calificacion'] ?? 4.5),
      imagen: String(data['imagen'] ?? 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80'),
      descripcion: String(data['descripcion'] ?? 'Sin descripcion disponible.'),
      telefono: data['telefono'] ? String(data['telefono']) : undefined,
      precioNivel,
      latitud: data['latitud'] !== undefined ? Number(data['latitud']) : data['latitude'] !== undefined ? Number(data['latitude']) : undefined,
      longitud: data['longitud'] !== undefined ? Number(data['longitud']) : data['longitude'] !== undefined ? Number(data['longitude']) : undefined,
      promociones,
      menu
    };
  }

  private extraerDistanciaKm(value: unknown): number {
    if (typeof value === 'number' && !Number.isNaN(value)) return value;
    if (typeof value === 'string') {
      const match = value.replace(',', '.').match(/(\d+(\.\d+)?)/);
      if (match) return Number(match[1]);
    }
    return 2.5;
  }

  private formatearDistancia(distanciaKm: number): string {
    return `${distanciaKm.toFixed(1)} km`;
  }

  private normalizarPrecioNivel(value: unknown): number {
    const numero = Number(value);
    if (!Number.isNaN(numero) && numero >= 1 && numero <= 4) {
      return numero;
    }
    return 2;
  }

  private normalizarMenu(menu: unknown, categoria: string): MenuItemRestaurante[] {
    if (Array.isArray(menu) && menu.length > 0) {
      return menu.map(item => ({
        nombre: String(item['nombre'] ?? 'Item del menu'),
        descripcion: String(item['descripcion'] ?? ''),
        precio: Number(item['precio'] ?? 0),
        destacado: Boolean(item['destacado'])
      }));
    }

    return obtenerMenuPorCategoria(categoria);
  }

  private normalizarPromociones(promociones: unknown, categoria: string): PromocionRestaurante[] {
    if (Array.isArray(promociones) && promociones.length > 0) {
      return promociones.map(item => ({
        titulo: String(item['titulo'] ?? 'Promocion'),
        descripcion: String(item['descripcion'] ?? ''),
        vigencia: item['vigencia'] ? String(item['vigencia']) : undefined
      }));
    }

    return obtenerPromocionesPorCategoria(categoria);
  }
}
