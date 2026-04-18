import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonContent,
  IonHeader,
  IonLabel,
  IonSearchbar,
  IonSkeletonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { RestauranteService } from '../services/restaurante.service';
import { FiltrosRestaurantes, OrdenRestaurantes, Restaurante } from '../models/restaurante.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonChip,
    IonContent,
    IonHeader,
    IonLabel,
    IonSearchbar,
    IonSkeletonText,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule
  ],
})
export class HomePage implements OnInit {
  restaurantes: Restaurante[] = [];
  restaurantesFiltrados: Restaurante[] = [];
  cargando = true;

  categorias: { label: string; value: string }[] = [
    { label: 'Todas', value: 'Todas' },
    { label: 'Criollo', value: 'Criollo' },
    { label: 'Mariscos', value: 'Mariscos' },
    { label: 'Comida rapida', value: 'Comida Rapida' },
    { label: 'Tradicional', value: 'Tradicional' },
    { label: 'Italiana', value: 'Italiana' },
    { label: 'Postres y cafe', value: 'Postres y Cafe' }
  ];
  categoriaActiva = 'Todas';

  filtros: FiltrosRestaurantes = {
    textoBusqueda: '',
    categoria: 'Todas',
    precioMaximo: null,
    calificacionMinima: null,
    distanciaMaximaKm: null,
    orden: 'destacados'
  };

  readonly opcionesOrden: { label: string; value: OrdenRestaurantes }[] = [
    { label: 'Destacados', value: 'destacados' },
    { label: 'Mejor calificados', value: 'calificacion' },
    { label: 'Mas cercanos', value: 'distancia' },
    { label: 'Menor precio', value: 'precio-asc' },
    { label: 'Mayor precio', value: 'precio-desc' }
  ];

  constructor(private router: Router, private restauranteService: RestauranteService) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.restauranteService.getRestaurantes().subscribe({
      next: (datosDelServidor) => {
        this.restaurantes = datosDelServidor;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.cargando = false;
      }
    });
  }

  seleccionarCategoria(categoria: string) {
    this.categoriaActiva = categoria;
    this.filtros.categoria = categoria;
    this.aplicarFiltros();
  }

  buscarRestaurante(event: Event) {
    const target = event.target as HTMLInputElement | null;
    this.filtros.textoBusqueda = (target?.value ?? '').toLowerCase();
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    const listaFiltrada = this.restaurantes.filter(restaurante => {
      const texto = this.filtros.textoBusqueda.trim();
      const coincideTexto = texto === '' ||
        restaurante.nombre.toLowerCase().includes(texto) ||
        restaurante.categoria.toLowerCase().includes(texto) ||
        restaurante.descripcion.toLowerCase().includes(texto);

      const coincideCategoria = this.filtros.categoria === 'Todas' ||
        this.normalizarTexto(restaurante.categoria) === this.normalizarTexto(this.filtros.categoria);
      const coincidePrecio = this.filtros.precioMaximo === null || restaurante.precioNivel <= this.filtros.precioMaximo;
      const coincideCalificacion = this.filtros.calificacionMinima === null || restaurante.calificacion >= this.filtros.calificacionMinima;
      const coincideDistancia = this.filtros.distanciaMaximaKm === null || restaurante.distanciaKm <= this.filtros.distanciaMaximaKm;

      return coincideTexto && coincideCategoria && coincidePrecio && coincideCalificacion && coincideDistancia;
    });

    this.restaurantesFiltrados = this.ordenarRestaurantes(listaFiltrada, this.filtros.orden);
  }

  limpiarFiltrosAvanzados() {
    this.filtros.precioMaximo = null;
    this.filtros.calificacionMinima = null;
    this.filtros.distanciaMaximaKm = null;
    this.filtros.orden = 'destacados';
    this.aplicarFiltros();
  }

  getPrecioVisual(precioNivel: number): string {
    return '$'.repeat(precioNivel);
  }

  verDetalle(restaurante: Restaurante) {
    this.router.navigate(['/detalle'], { state: { data: restaurante } });
  }

  private ordenarRestaurantes(restaurantes: Restaurante[], orden: OrdenRestaurantes): Restaurante[] {
    const copia = [...restaurantes];

    switch (orden) {
      case 'calificacion':
        return copia.sort((a, b) => b.calificacion - a.calificacion);
      case 'distancia':
        return copia.sort((a, b) => a.distanciaKm - b.distanciaKm);
      case 'precio-asc':
        return copia.sort((a, b) => a.precioNivel - b.precioNivel);
      case 'precio-desc':
        return copia.sort((a, b) => b.precioNivel - a.precioNivel);
      case 'destacados':
      default:
        return copia.sort((a, b) => {
          if (b.calificacion !== a.calificacion) return b.calificacion - a.calificacion;
          return a.distanciaKm - b.distanciaKm;
        });
    }
  }

  private normalizarTexto(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
