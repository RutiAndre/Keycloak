import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpesaService } from '../../services/spesa-service';
import { AuthService } from '../../core/auth.service';

export interface ElementoSpesa {
  id: number;
  nome: string;
}

@Component({
  selector: 'app-lista-spesa',
  standalone: true, // Aggiunto se usi Angular moderno
  imports: [FormsModule],
  templateUrl: './lista-spesa.html',
  styleUrl: './lista-spesa.css',
})
export class ListaSpesa implements OnInit {
  private spesaService = inject(SpesaService);
  public authService = inject(AuthService); // public per usarlo nell'HTML

  items = signal<ElementoSpesa[]>([]);
  newItem = signal('');
  error = signal('');

  ngOnInit(): void {
    this.caricaLista();
  }

  // Creiamo un metodo a parte per caricare la lista, così lo usiamo più volte
  caricaLista(): void {
    this.spesaService.getItems().subscribe({
      next: (res) => this.items.set(res.items),
      error: () => this.error.set('Errore nel caricamento della lista'),
    });
  }

  addItem(): void {
    const testo = this.newItem().trim();
    if (!testo) return;

    this.spesaService.addItem(testo).subscribe({
      next: (res) => {
        // Se il backend restituisce la lista aggiornata:
        if (res.items) {
          this.items.set(res.items);
        } else {
          // Altrimenti ricarichiamo manualmente
          this.caricaLista();
        }
        this.newItem.set('');
        this.error.set('');
      },
      error: () => this.error.set("Errore nell'aggiunta (controlla i tuoi ruoli)"),
    });
  }

  deleteItem(id: number): void {
this.spesaService.deleteItem(id).subscribe({
next: () => this.items.update(items => items.filter(i => i.id !== id)),
error: () => this.error.set("Errore durante l'eliminazione"),
});
}
}