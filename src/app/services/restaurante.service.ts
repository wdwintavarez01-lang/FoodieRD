import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestauranteService {
  // Aqui pondras la URL de tu API en el Hito 4
  private apiUrl = 'https://api.tu-servidor.com/restaurantes';

  constructor(private http: HttpClient) {}

  getRestaurantes(): Observable<any[]> {
    // Por ahora, para no romper tu avance, el servicio devuelve los datos locales.
    // La estructura ya esta lista para cambiar a: return this.http.get<any[]>(this.apiUrl);
    return of([
      {
        id: 1,
        nombre: 'El Rincón del Sabor',
        categoria: 'Criollo',
        distancia: '1.2 km',
        calificacion: 4.8,
        imagen: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=60',
        descripcion: 'Auténtico sabor dominicano.'
      },
      {
        id: 2,
        nombre: 'Mariscos del Caribe',
        categoria: 'Mariscos',
        distancia: '3.5 km',
        calificacion: 4.5,
        imagen: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=500&q=60',
        descripcion: 'Fresco desde el mar a tu mesa.'
      }
    ]);
  }
}
