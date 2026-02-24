import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpesaService, ShoppingItem } from '../../services/spesa-service'; // Importa l'interfaccia

@Component({
  selector: 'app-lista-spesa',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './lista-spesa.html',
  styleUrl: './lista-spesa.css',
})
export class ListaSpesa implements OnInit {
  private spesaService = inject(SpesaService);

  // 1. Specifica che items contiene oggetti, non stringhe
  items = signal<ShoppingItem[]>([]);
  
  // 2. Assicurati che newItem sia un signal
  newItem = signal<string>(''); 
  error = signal<string>('');

  ngOnInit(): void {
    this.caricaLista();
  }

  caricaLista(): void {
    this.spesaService.getItems().subscribe({
      next: (res) => {
        // Ora res.items è ShoppingItem[], quindi compatibile con il signal
        this.items.set(res.items);
      },
      error: () => this.error.set('Errore nel caricamento della lista'),
    });
  }

  addItem(): void {
    // NOTA: devi usare le parentesi () per leggere il valore del signal!
    const testo = this.newItem().trim(); 

    if (!testo) return;

    this.spesaService.addItem(testo).subscribe({
      next: () => {
        this.newItem.set(''); // Pulisce il campo
        this.error.set('');
        this.caricaLista(); // Ricarica per avere il nuovo ID dal database
      },
      error: () => this.error.set("Errore durante l'aggiunta"),
    });
  }

  deleteItem(id: number): void {
    this.spesaService.deleteItem(id).subscribe({
      next: () => {
        // Rimuove l'elemento localmente senza ricaricare tutto
        this.items.update(prev => prev.filter(i => i.id !== id));
      },
      error: () => this.error.set("Errore durante l'eliminazione")
    });
  }
}