import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface EducationalVideo {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  category: string;
  duration: string;
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
  tags: string[];
  thumbnail: string;
}

@Component({
  selector: 'app-patient-education',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatExpansionModule,
    MatDialogModule,
    MatSnackBarModule,
    FormsModule
  ],
  template: `
    <div class="education-container">
      <div class="header-section">
        <h1>
          <mat-icon class="header-icon">school</mat-icon>
          Biblioteca de Autocuidado
        </h1>
        <p class="subtitle">Aprende sobre tu salud y bienestar con videos educativos</p>
      </div>

      <!-- Filtros de búsqueda -->
      <div class="filters-section">
        <mat-card class="filters-card">
          <mat-card-content>
            <div class="filters-row">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Buscar videos</mat-label>
                <input matInput [(ngModel)]="searchTerm" (input)="filterVideos()" placeholder="Ej: diabetes, ejercicio, medicamentos...">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="category-field">
                <mat-label>Categoría</mat-label>
                <mat-select [(ngModel)]="selectedCategory" (selectionChange)="filterVideos()">
                  <mat-option value="">Todas las categorías</mat-option>
                  <mat-option *ngFor="let category of categories" [value]="category">
                    {{ category }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="difficulty-field">
                <mat-label>Nivel</mat-label>
                <mat-select [(ngModel)]="selectedDifficulty" (selectionChange)="filterVideos()">
                  <mat-option value="">Todos los niveles</mat-option>
                  <mat-option value="Básico">Básico</mat-option>
                  <mat-option value="Intermedio">Intermedio</mat-option>
                  <mat-option value="Avanzado">Avanzado</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Categorías destacadas -->
      <div class="categories-section">
        <h2>Categorías Populares</h2>
        <div class="category-chips">
          <mat-chip-set>
            <mat-chip 
              *ngFor="let category of categories" 
              [class.selected]="selectedCategory === category"
              (click)="selectCategory(category)">
              <mat-icon>{{ getCategoryIcon(category) }}</mat-icon>
              {{ category }}
            </mat-chip>
          </mat-chip-set>
        </div>
      </div>

      <!-- Videos -->
      <div class="videos-section">
        <div class="videos-header">
          <h2>Videos Educativos</h2>
          <span class="video-count">{{ filteredVideos.length }} videos encontrados</span>
        </div>

        <div class="videos-grid">
          <mat-card 
            *ngFor="let video of filteredVideos" 
            class="video-card"
            (click)="openVideo(video)">
            <div class="video-thumbnail">
              <img [src]="video.thumbnail" [alt]="video.title">
              <div class="play-overlay">
                <mat-icon>play_circle_filled</mat-icon>
              </div>
              <div class="duration-badge">{{ video.duration }}</div>
            </div>
            
            <mat-card-content>
              <h3 class="video-title">{{ video.title }}</h3>
              <p class="video-description">{{ video.description }}</p>
              
              <div class="video-meta">
                <mat-chip-set>
                  <mat-chip [class]="'difficulty-' + video.difficulty.toLowerCase()">
                    {{ video.difficulty }}
                  </mat-chip>
                  <mat-chip *ngFor="let tag of video.tags.slice(0, 2)">
                    {{ tag }}
                  </mat-chip>
                </mat-chip-set>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- Sección de favoritos -->
      <div class="favorites-section" *ngIf="favoriteVideos.length > 0">
        <h2>Mis Videos Favoritos</h2>
        <div class="videos-grid">
          <mat-card 
            *ngFor="let video of favoriteVideos" 
            class="video-card favorite"
            (click)="openVideo(video)">
            <div class="video-thumbnail">
              <img [src]="video.thumbnail" [alt]="video.title">
              <div class="play-overlay">
                <mat-icon>play_circle_filled</mat-icon>
              </div>
              <div class="duration-badge">{{ video.duration }}</div>
              <div class="favorite-badge">
                <mat-icon>favorite</mat-icon>
              </div>
            </div>
            
            <mat-card-content>
              <h3 class="video-title">{{ video.title }}</h3>
              <p class="video-description">{{ video.description }}</p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>

    <!-- Modal de video -->
    <div class="video-modal" *ngIf="selectedVideo" (click)="closeVideo()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ selectedVideo.title }}</h2>
          <button mat-icon-button (click)="closeVideo()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        
        <div class="video-container">
          <iframe 
            [src]="getVideoUrl(selectedVideo.youtubeId)"
            frameborder="0" 
            allowfullscreen>
          </iframe>
        </div>
        
        <div class="video-info">
          <p class="video-description">{{ selectedVideo.description }}</p>
          <div class="video-actions">
            <button 
              mat-raised-button 
              [color]="isFavorite(selectedVideo.id) ? 'warn' : 'primary'"
              (click)="toggleFavorite(selectedVideo)">
              <mat-icon>{{ isFavorite(selectedVideo.id) ? 'favorite' : 'favorite_border' }}</mat-icon>
              {{ isFavorite(selectedVideo.id) ? 'Quitar de favoritos' : 'Agregar a favoritos' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .education-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-section {
      text-align: center;
      margin-bottom: 30px;
    }

    .header-section h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
      color: var(--medical-primary);
      margin-bottom: 10px;
    }

    .header-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
    }

    .subtitle {
      color: #666;
      font-size: 1.1rem;
      margin: 0;
    }

    .filters-section {
      margin-bottom: 30px;
    }

    .filters-card {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }

    .filters-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 20px;
      align-items: center;
    }

    .search-field, .category-field, .difficulty-field {
      width: 100%;
    }

    .categories-section {
      margin-bottom: 30px;
    }

    .categories-section h2 {
      color: var(--medical-primary);
      margin-bottom: 15px;
    }

    .category-chips {
      margin-bottom: 20px;
    }

    .category-chips mat-chip {
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .category-chips mat-chip:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .category-chips mat-chip.selected {
      background-color: var(--medical-primary);
      color: white;
    }

    .videos-section {
      margin-bottom: 40px;
    }

    .videos-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .videos-header h2 {
      color: var(--medical-primary);
      margin: 0;
    }

    .video-count {
      color: #666;
      font-size: 0.9rem;
    }

    .videos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .video-card {
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 12px;
      overflow: hidden;
    }

    .video-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .video-thumbnail {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .video-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .play-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.7);
      border-radius: 50%;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .play-overlay mat-icon {
      color: white;
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .video-card:hover .play-overlay {
      background: rgba(25, 118, 210, 0.9);
      transform: translate(-50%, -50%) scale(1.1);
    }

    .duration-badge {
      position: absolute;
      bottom: 10px;
      right: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
    }

    .favorite-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(244, 67, 54, 0.9);
      color: white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .favorite-badge mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .video-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 10px 0 5px 0;
      color: #333;
      line-height: 1.3;
    }

    .video-description {
      color: #666;
      font-size: 0.9rem;
      line-height: 1.4;
      margin: 0 0 15px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .video-meta {
      margin-top: 10px;
    }

    .difficulty-básico {
      background-color: #4caf50 !important;
      color: white !important;
    }

    .difficulty-intermedio {
      background-color: #ff9800 !important;
      color: white !important;
    }

    .difficulty-avanzado {
      background-color: #f44336 !important;
      color: white !important;
    }

    .favorites-section {
      margin-bottom: 40px;
    }

    .favorites-section h2 {
      color: var(--medical-primary);
      margin-bottom: 20px;
    }

    .video-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      max-width: 900px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #eee;
    }

    .modal-header h2 {
      margin: 0;
      color: var(--medical-primary);
    }

    .video-container {
      position: relative;
      width: 100%;
      height: 0;
      padding-bottom: 56.25%; /* 16:9 aspect ratio */
    }

    .video-container iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .video-info {
      padding: 20px;
    }

    .video-actions {
      margin-top: 15px;
    }

    @media (max-width: 768px) {
      .filters-row {
        grid-template-columns: 1fr;
        gap: 15px;
      }

      .videos-grid {
        grid-template-columns: 1fr;
      }

      .videos-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }

      .modal-content {
        margin: 10px;
        max-height: 95vh;
      }
    }
  `]
})
export class PatientEducationComponent implements OnInit {
  searchTerm: string = '';
  selectedCategory: string = '';
  selectedDifficulty: string = '';
  selectedVideo: EducationalVideo | null = null;
  favoriteVideos: EducationalVideo[] = [];

  categories: string[] = [];

  educationalVideos: EducationalVideo[] = [
    {
      id: '1',
      title: 'El Autocuidado – Explicación para Todos',
      description: 'Una explicación clara y sencilla sobre qué es el autocuidado y por qué es fundamental para nuestra salud.',
      youtubeId: 'gTQRuUgx6Mo',
      category: 'Autocuidado',
      duration: '8:30',
      difficulty: 'Básico',
      tags: ['autocuidado', 'bienestar', 'salud general'],
      thumbnail: 'https://img.youtube.com/vi/gTQRuUgx6Mo/maxresdefault.jpg'
    },
    {
      id: '2',
      title: 'Salud Mental para todos – El autocuidado personal',
      description: 'Aprende sobre la importancia del autocuidado en la salud mental y cómo practicarlo diariamente.',
      youtubeId: '5jqWuEPe47E',
      category: 'Salud Mental',
      duration: '12:15',
      difficulty: 'Básico',
      tags: ['salud mental', 'autocuidado', 'bienestar emocional'],
      thumbnail: 'https://img.youtube.com/vi/5jqWuEPe47E/maxresdefault.jpg'
    },
    {
      id: '3',
      title: 'Aprendiendo autocuidado: ¿Qué me digo a mí mismo?',
      description: 'Descubre el poder del diálogo interno positivo y cómo puede transformar tu autocuidado.',
      youtubeId: 'PXwAkKbcmgk',
      category: 'Autocuidado',
      duration: '6:45',
      difficulty: 'Básico',
      tags: ['autocuidado', 'diálogo interno', 'autoestima'],
      thumbnail: 'https://img.youtube.com/vi/PXwAkKbcmgk/maxresdefault.jpg'
    },
    {
      id: '4',
      title: '5 formas simples de practicar el autocuidado cada día',
      description: 'Técnicas prácticas y fáciles de implementar para cuidar de ti mismo en tu rutina diaria.',
      youtubeId: 'SxsjzlTco_c',
      category: 'Autocuidado',
      duration: '7:20',
      difficulty: 'Básico',
      tags: ['autocuidado', 'rutina diaria', 'técnicas prácticas'],
      thumbnail: 'https://img.youtube.com/vi/SxsjzlTco_c/maxresdefault.jpg'
    },
    {
      id: '5',
      title: 'La importancia del autocuidado',
      description: 'Comprende por qué el autocuidado no es egoísmo, sino una necesidad fundamental para una vida saludable.',
      youtubeId: '1fPfXq-Rg0s',
      category: 'Autocuidado',
      duration: '9:10',
      difficulty: 'Básico',
      tags: ['autocuidado', 'importancia', 'vida saludable'],
      thumbnail: 'https://img.youtube.com/vi/1fPfXq-Rg0s/maxresdefault.jpg'
    },
    {
      id: '6',
      title: 'AUTOCUIDADO personal - QUÉ es y POR QUÉ es tan importante',
      description: 'Una guía completa sobre el concepto de autocuidado personal y su impacto en nuestra calidad de vida.',
      youtubeId: 'JOLMAhC1JrA',
      category: 'Autocuidado',
      duration: '11:30',
      difficulty: 'Intermedio',
      tags: ['autocuidado personal', 'calidad de vida', 'bienestar integral'],
      thumbnail: 'https://img.youtube.com/vi/JOLMAhC1JrA/maxresdefault.jpg'
    },
    {
      id: '7',
      title: '¿Qué es el autocuidado y por qué es importante?',
      description: 'Definición clara del autocuidado y sus beneficios para la salud física y mental.',
      youtubeId: 'cjkmDOE5pm8',
      category: 'Autocuidado',
      duration: '5:45',
      difficulty: 'Básico',
      tags: ['autocuidado', 'definición', 'beneficios'],
      thumbnail: 'https://img.youtube.com/vi/cjkmDOE5pm8/maxresdefault.jpg'
    },
    {
      id: '8',
      title: '¿Que es el Autocuidado? | Cómo aplicar el Autocuidado',
      description: 'Aprende qué es el autocuidado y descubre estrategias prácticas para aplicarlo en tu vida diaria.',
      youtubeId: 'HoGs6OcFWng',
      category: 'Autocuidado',
      duration: '8:15',
      difficulty: 'Básico',
      tags: ['autocuidado', 'estrategias', 'aplicación práctica'],
      thumbnail: 'https://img.youtube.com/vi/HoGs6OcFWng/maxresdefault.jpg'
    },
    {
      id: '9',
      title: '¿En qué consiste el AUTOCUIDADO? [Tipos y beneficios]',
      description: 'Explora los diferentes tipos de autocuidado y sus múltiples beneficios para tu bienestar integral.',
      youtubeId: 'KN7saWM2-ss',
      category: 'Autocuidado',
      duration: '10:20',
      difficulty: 'Intermedio',
      tags: ['tipos de autocuidado', 'beneficios', 'bienestar integral'],
      thumbnail: 'https://img.youtube.com/vi/KN7saWM2-ss/maxresdefault.jpg'
    },
    {
      id: '10',
      title: 'Autocuidado – 10 Prácticas Simples para Mimarte en Cuerpo, Mente y Alma',
      description: 'Descubre 10 prácticas sencillas de autocuidado que abarcan el bienestar físico, mental y espiritual.',
      youtubeId: '57YvQ2gjQIA',
      category: 'Autocuidado',
      duration: '15:45',
      difficulty: 'Intermedio',
      tags: ['prácticas de autocuidado', 'cuerpo mente alma', 'bienestar holístico'],
      thumbnail: 'https://img.youtube.com/vi/57YvQ2gjQIA/maxresdefault.jpg'
    }
  ];

  filteredVideos: EducationalVideo[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.filteredVideos = [...this.educationalVideos];
    this.loadFavorites();
    this.generateCategories();
  }

  generateCategories() {
    // Extraer categorías únicas de los videos disponibles
    const uniqueCategories = [...new Set(this.educationalVideos.map(video => video.category))];
    this.categories = uniqueCategories.sort();
  }

  filterVideos() {
    this.filteredVideos = this.educationalVideos.filter(video => {
      const matchesSearch = !this.searchTerm || 
        video.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        video.tags.some(tag => tag.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesCategory = !this.selectedCategory || video.category === this.selectedCategory;
      const matchesDifficulty = !this.selectedDifficulty || video.difficulty === this.selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }

  selectCategory(category: string) {
    this.selectedCategory = this.selectedCategory === category ? '' : category;
    this.filterVideos();
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Autocuidado': 'self_improvement',
      'Salud Mental': 'psychology',
      'Diabetes': 'bloodtype',
      'Hipertensión': 'favorite',
      'Ejercicio y Rehabilitación': 'fitness_center',
      'Medicamentos': 'medication',
      'Nutrición': 'restaurant',
      'Cuidados Post-operatorios': 'healing',
      'Prevención': 'shield',
      'Primeros Auxilios': 'emergency'
    };
    return icons[category] || 'category';
  }

  openVideo(video: EducationalVideo) {
    this.selectedVideo = video;
  }

  closeVideo() {
    this.selectedVideo = null;
  }

  getVideoUrl(youtubeId: string): SafeResourceUrl {
    const url = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  toggleFavorite(video: EducationalVideo) {
    const index = this.favoriteVideos.findIndex(fav => fav.id === video.id);
    
    if (index > -1) {
      this.favoriteVideos.splice(index, 1);
      this.snackBar.open('Video removido de favoritos', 'Cerrar', { duration: 2000 });
    } else {
      this.favoriteVideos.push(video);
      this.snackBar.open('Video agregado a favoritos', 'Cerrar', { duration: 2000 });
    }
    
    this.saveFavorites();
  }

  isFavorite(videoId: string): boolean {
    return this.favoriteVideos.some(fav => fav.id === videoId);
  }

  private loadFavorites() {
    const saved = localStorage.getItem('patient-education-favorites');
    if (saved) {
      this.favoriteVideos = JSON.parse(saved);
    }
  }

  private saveFavorites() {
    localStorage.setItem('patient-education-favorites', JSON.stringify(this.favoriteVideos));
  }
}
