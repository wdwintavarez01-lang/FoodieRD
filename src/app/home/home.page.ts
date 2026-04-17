import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { RestauranteService } from '../services/restaurante.service';

export interface Restaurante {
  id: number;
  nombre: string;
  categoria: string;
  distancia: string;
  calificacion: number;
  imagen: string;
  descripcion: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class HomePage implements OnInit {
  restaurantes: Restaurante[] = [];

  constructor(
    private router: Router,
    private restauranteService: RestauranteService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.restauranteService.getRestaurantes().subscribe({
      next: (datosDelServidor) => {
        this.restaurantes = datosDelServidor;
      },
      error: (error) => {
        console.error('Hubo un error al conectar con la API:', error);
      }
    });
  }

  verDetalle(restaurante: Restaurante) {
    this.router.navigate(['/detalle'], { state: { data: restaurante } });
  }
}
