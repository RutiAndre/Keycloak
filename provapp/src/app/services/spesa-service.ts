import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { Observable } from 'rxjs';

// Definiamo l'interfaccia per l'oggetto che arriva dal DB MySQL
export interface ShoppingItem {
  id: number;
  item: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpesaService {
  private http = inject(HttpClient);
  private keycloak = inject(Keycloak);

  // Cambia questo con l'URL del tuo server Flask (es: http://localhost:5000)
  private baseUrl = 'https://curly-palm-tree-g4994vpxp6x93x5r-5000.app.github.dev/'; 

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.keycloak.token}`,
    });
  }

  // Ritorna la lista di oggetti ShoppingItem
  getItems(): Observable<{ items: ShoppingItem[]; user: string }> {
    return this.http.get<{ items: ShoppingItem[]; user: string }>(
      `${this.baseUrl}/items`,
      { headers: this.getHeaders() }
    );
  }

  addItem(item: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/items`,
      { item },
      { headers: this.getHeaders() }
    );
  }

  // Metodo per eliminare (Esercizio 2)
  deleteItem(id: number): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/items/${id}`,
      { headers: this.getHeaders() }
    );
  }
}