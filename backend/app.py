from flask import Flask, request, jsonify, g
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from auth import require_auth, require_role

app = Flask(__name__)
CORS(app)

# --- CONFIGURAZIONE DATABASE AIVEN (MySQL) ---
# Inserisci i tuoi dati di Aiven qui sotto
USERNAME = 'avnadmin'
PASSWORD = 'AVNS_v5ZY1LueloCJza2Bkdd'
HOST = 'mysql-221cedb1-iisgalvanimi-9701.j.aivencloud.com'
PORT = '17424'
DB_NAME = 'keycloak'

app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{USERNAME}:{PASSWORD}@{HOST}:{PORT}/{DB_NAME}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- MODELLO TABELLA ---
# Nota: Non serve la colonna 'username' se la lista è globale e anonima,
# ma puoi tenerla se vuoi sapere "chi" ha aggiunto cosa (anche se tutti vedono tutto).
class SharedItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), nullable=False)

# Crea la tabella su MySQL se non esiste
with app.app_context():
    db.create_all()

# --- ROTTE ---

@app.route("/items", methods=["GET"])
@require_auth
def get_items():
    # LISTA CONDIVISA: Prendiamo TUTTI gli elementi dal DB, senza filtri
    rows = SharedItem.query.all()
    # Trasformiamo i record in una lista di dizionari
    items_list = [{"id": r.id, "nome": r.nome} for r in rows]
    return jsonify({"items": items_list})

@app.route("/items", methods=["POST"])
@require_auth
@require_role("user_plus") # Solo chi ha il ruolo user_plus può aggiungere
def add_item():
    data = request.get_json()
    testo = data.get("item", "").strip()

    if not testo:
        return jsonify({"error": "Item non può essere vuoto"}), 400

    # Aggiungiamo al database
    nuovo_item = SharedItem(nome=testo)
    db.session.add(nuovo_item)
    db.session.commit()

    # Restituiamo la lista aggiornata (opzionale, o solo conferma)
    return jsonify({"message": "Aggiunto"}), 201

@app.route("/items/<int:item_id>", methods=["DELETE"])
@require_auth
@require_role("user_plus") # Solo chi ha il ruolo user_plus può eliminare
def delete_item(item_id):
    # Cerchiamo l'elemento per ID
    item = SharedItem.query.get(item_id)
    
    if not item:
        return jsonify({"error": "Elemento non trovato"}), 404

    db.session.delete(item)
    db.session.commit()
    return '', 204

if __name__ == "__main__":
    app.run(debug=True)