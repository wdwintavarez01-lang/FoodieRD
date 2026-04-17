import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { addIcons } from 'ionicons';
import { heart, heartOutline, navigate, shareSocial, playCircle, camera } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Share } from '@capacitor/share';

interface Restaurante {
  id: number;
  nombre: string;
  categoria: string;
  distancia: string;
  calificacion: number;
  imagen: string;
  descripcion: string;
}

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class DetallePage implements OnInit {
  restaurante: Restaurante | null = null;
  esFavorito: boolean = false;
  private storageReady: boolean = false;
  fotoCapturada: string | undefined;
  async irAlLocal() {
    try {
      // Pedimos las coordenadas actuales
      const coordinates = await Geolocation.getCurrentPosition();
      
      const lat = coordinates.coords.latitude;
      const lng = coordinates.coords.longitude;

      console.log('Tu ubicación actual es:', lat, lng);

      // Simulamos la apertura del mapa externo (Google Maps)
      // En una app real, aquí abriríamos la URL de navegación de Google
      const url = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${this.restaurante?.nombre}`;
      window.open(url, '_blank');

    } catch (error) {
      console.error('Error al obtener la ubicación. ¿Tienes el GPS encendido?', error);
    }
  }

  async compartir() {
    if (!this.restaurante) return;

    try {
      await Share.share({
        title: '¡Vamos a comer en Foodie RD!',
        text: `Te recomiendo ${this.restaurante.nombre}. Tienen un ambiente excelente y comida de categoría ${this.restaurante.categoria}.`,
        url: 'https://tu-proyecto-foodierd.com',
        dialogTitle: 'Compartir restaurante con tus amigos',
      });
    } catch (error) {
      console.error('El usuario canceló o hubo un error al compartir', error);
    }
  }

  constructor(private router: Router, private storage: Storage) {
    addIcons({ heart, heartOutline, navigate, shareSocial, playCircle, camera });
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state && navigation.extras.state['data']) {
      this.restaurante = navigation.extras.state['data'];
    } else {
      this.router.navigate(['/home']);
    }
  }

  async ngOnInit() {
    if (!this.restaurante) return;
    if (!this.storageReady) {
      await this.storage.create();
      this.storageReady = true;
    }
    await this.verificarSiEsFavorito();
  }

  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt
      });
      this.fotoCapturada = image.dataUrl;
    } catch (error) {
      console.error('El usuario canceló la foto', error);
    }
  }

  async verificarSiEsFavorito() {
    const favoritos: Restaurante[] = await this.storage.get('favoritos_foodie') || [];
    this.esFavorito = favoritos.some(fav => fav.id === this.restaurante?.id);
  }

  async toggleFavorito() {
    if (!this.restaurante) return;
    let favoritos: Restaurante[] = await this.storage.get('favoritos_foodie') || [];
    if (this.esFavorito) {
      favoritos = favoritos.filter(fav => fav.id !== this.restaurante?.id);
    } else {
      favoritos.push(this.restaurante);
    }
    await this.storage.set('favoritos_foodie', favoritos);
    this.esFavorito = !this.esFavorito;
  }
}
