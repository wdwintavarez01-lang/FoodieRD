import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonSkeletonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { addIcons } from 'ionicons';
import {
  camera,
  giftOutline,
  heart,
  heartOutline,
  locationOutline,
  logoWhatsapp,
  navigate,
  shareSocial,
  star,
  starOutline
} from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Share } from '@capacitor/share';
import { ResenaRestaurante, Restaurante } from '../../models/restaurante.model';
import { RestauranteService } from '../../services/restaurante.service';

type ResenaNueva = {
  autor: string;
  comentario: string;
  calificacion: number;
};

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
  standalone: true,
  imports: [
    IonBackButton,
    IonBadge,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonIcon,
    IonSkeletonText,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule
  ]
})
export class DetallePage implements OnInit {
  restaurante: Restaurante | null = null;
  esFavorito = false;
  fotoCapturada: string | undefined;
  resenas: ResenaRestaurante[] = [];
  cargandoResenas = true;
  sincronizandoResenas = false;
  nuevaResena: ResenaNueva = {
    autor: '',
    comentario: '',
    calificacion: 5
  };

  private storageReady = false;

  constructor(
    private router: Router,
    private storage: Storage,
    private restauranteService: RestauranteService
  ) {
    addIcons({
      heart,
      heartOutline,
      navigate,
      shareSocial,
      camera,
      logoWhatsapp,
      locationOutline,
      giftOutline,
      star,
      starOutline
    });

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state?.['data']) {
      this.restaurante = navigation.extras.state['data'];
    } else {
      this.router.navigate(['/tabs/home']);
    }
  }

  async ngOnInit() {
    if (!this.restaurante) return;

    if (!this.storageReady) {
      await this.storage.create();
      this.storageReady = true;
    }

    await this.verificarSiEsFavorito();
    await this.cargarResenas();
    await this.sincronizarResenasPendientes();
  }

  get precioVisual(): string {
    return this.restaurante ? '$'.repeat(this.restaurante.precioNivel) : '';
  }

  setCalificacion(calificacion: number) {
    this.nuevaResena.calificacion = calificacion;
  }

  estrellasArray() {
    return [1, 2, 3, 4, 5];
  }

  async irAlLocal() {
    if (!this.restaurante) return;

    const destino = this.restaurante.latitud !== undefined && this.restaurante.longitud !== undefined
      ? `${this.restaurante.latitud},${this.restaurante.longitud}`
      : encodeURIComponent(this.restaurante.nombre);

    try {
      const permissionStatus = await Geolocation.checkPermissions();
      if (permissionStatus.location !== 'granted' && permissionStatus.coarseLocation !== 'granted') {
        await Geolocation.requestPermissions();
      }

      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      const lat = coordinates.coords.latitude;
      const lng = coordinates.coords.longitude;
      const url = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${destino}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error al obtener la ubicacion. Se abrira el mapa sin tu posicion actual.', error);
      window.open(`https://www.google.com/maps/search/?api=1&query=${destino}`, '_blank');
    }
  }

  async compartir() {
    if (!this.restaurante) return;

    const texto = `Te recomiendo ${this.restaurante.nombre}. Categoria ${this.restaurante.categoria}, calificacion ${this.restaurante.calificacion}.`;

    try {
      await Share.share({
        title: 'Vamos a comer en Foodie RD!',
        text: texto,
        url: 'https://tu-proyecto-foodierd.com',
        dialogTitle: 'Compartir restaurante con tus amigos',
      });
    } catch (error) {
      console.error('El plugin Share fallo o el usuario cancelo. Intentando alternativa web.', error);

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Vamos a comer en Foodie RD!',
            text: texto,
            url: 'https://tu-proyecto-foodierd.com'
          });
          return;
        } catch {}
      }

      try {
        await navigator.clipboard.writeText(`${texto} https://tu-proyecto-foodierd.com`);
        alert('No se pudo abrir el menu de compartir, pero el texto se copio al portapapeles.');
      } catch {
        alert('No se pudo compartir automaticamente en este dispositivo.');
      }
    }
  }

  pedirPorWhatsApp() {
    if (!this.restaurante || !this.restaurante.telefono) {
      console.warn('Este restaurante no tiene telefono registrado');
      return;
    }

    const url = `https://wa.me/${this.restaurante.telefono}?text=${encodeURIComponent(`Hola! Encontre a ${this.restaurante.nombre} en Foodie RD y me gustaria hacer un pedido.`)}`;
    window.open(url, '_blank');
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
      console.error('El usuario cancelo la foto', error);
    }
  }

  async guardarResena() {
    if (!this.restaurante) return;
    if (!this.nuevaResena.autor.trim() || !this.nuevaResena.comentario.trim()) {
      alert('Completa tu nombre y comentario antes de guardar la resena.');
      return;
    }

    const resenaLocal: ResenaRestaurante = {
      id: `local-${Date.now()}`,
      restauranteId: this.restaurante.id,
      autor: this.nuevaResena.autor.trim(),
      comentario: this.nuevaResena.comentario.trim(),
      calificacion: this.nuevaResena.calificacion,
      fotoUrl: this.fotoCapturada,
      fecha: new Date().toISOString(),
      origen: 'local',
      pendienteSync: true
    };

    this.resenas = [resenaLocal, ...this.resenas];
    await this.storage.set(this.storageKeyResenas, this.resenas);

    this.nuevaResena = { autor: '', comentario: '', calificacion: 5 };
    this.fotoCapturada = undefined;
    await this.sincronizarResenasPendientes();
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

  trackByResena(_: number, resena: ResenaRestaurante) {
    return resena.id;
  }

  private async cargarResenas() {
    if (!this.restaurante) return;

    this.cargandoResenas = true;
    const locales: ResenaRestaurante[] = await this.storage.get(this.storageKeyResenas) || [];

    try {
      const servidor = await this.restauranteService.getResenas(this.restaurante.id);
      this.resenas = this.mezclarResenas(locales, servidor);
      await this.storage.set(this.storageKeyResenas, this.resenas);
    } catch {
      this.resenas = [...locales];
    } finally {
      this.cargandoResenas = false;
    }
  }

  private async sincronizarResenasPendientes() {
    if (!this.restaurante) return;
    const pendientes = this.resenas.filter(resena => resena.pendienteSync);
    if (pendientes.length === 0) return;

    this.sincronizandoResenas = true;
    for (const resena of pendientes) {
      try {
        const idServidor = await this.restauranteService.guardarResena({
          restauranteId: resena.restauranteId,
          autor: resena.autor,
          comentario: resena.comentario,
          calificacion: resena.calificacion,
          fotoUrl: resena.fotoUrl,
          fecha: resena.fecha
        });

        this.resenas = this.resenas.map(actual => actual.id === resena.id ? {
          ...actual,
          id: idServidor,
          origen: 'server',
          pendienteSync: false
        } : actual);
      } catch {}
    }

    await this.storage.set(this.storageKeyResenas, this.resenas);
    this.sincronizandoResenas = false;
  }

  private mezclarResenas(locales: ResenaRestaurante[], servidor: ResenaRestaurante[]): ResenaRestaurante[] {
    const mapa = new Map<string, ResenaRestaurante>();
    [...servidor, ...locales].forEach(resena => mapa.set(resena.id, resena));
    return [...mapa.values()].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  private get storageKeyResenas(): string {
    return `resenas_foodie_${this.restaurante?.id ?? 'desconocido'}`;
  }
}
