import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { heartOutline } from 'ionicons/icons';
import { Restaurante } from '../../models/restaurante.model';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class FavoritosPage implements OnInit {
  favoritos: Restaurante[] = [];

  constructor(private storage: Storage, private router: Router) {
    addIcons({ heartOutline });
  }

  async ngOnInit() {
    await this.storage.create();
  }

  async ionViewWillEnter() {
    this.favoritos = await this.storage.get('favoritos_foodie') || [];
  }

  verDetalle(restaurante: Restaurante) {
    this.router.navigate(['/detalle'], { state: { data: restaurante } });
  }
}
