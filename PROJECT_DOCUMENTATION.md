# 📋 Documentation Complète du Projet AgriSmart

## 🎯 Vue d'Ensemble

**AgriSmart** est une plateforme web complète et moderne dédiée à l'agriculture tunisienne. Elle connecte trois types d'acteurs principaux : les **agriculteurs (fermiers)**, les **consommateurs**, et les **vétérinaires**, facilitant les échanges commerciaux, les consultations vétérinaires, et la gestion des produits agricoles.

### Objectif Principal
Créer un écosystème numérique pour l'agriculture tunisienne permettant :
- La vente directe de produits agricoles (moutons, huile d'olive)
- Les consultations vétérinaires à distance
- La gestion administrative des utilisateurs
- Le suivi des statistiques du marché
- La communication entre tous les acteurs

---

## 🏗️ Architecture du Projet

### Structure des Dossiers

```
Agri/
├── backend/                    # Serveur Node.js/Express
│   ├── config/                 # Configuration
│   │   ├── db.js              # Configuration MongoDB
│   │   └── multer.js          # Configuration upload fichiers
│   ├── models/                # Modèles Mongoose
│   │   ├── User.js            # Modèle utilisateur
│   │   ├── Product.js         # Modèle produit
│   │   ├── Consultation.js    # Modèle consultation vétérinaire
│   │   ├── Message.js         # Modèle message
│   │   ├── Reclamation.js     # Modèle réclamation
│   │   ├── Statistic.js       # Modèle statistique
│   │   └── Admin.js           # Modèle administrateur
│   ├── routes/                 # Routes API
│   │   ├── auth.js            # Authentification
│   │   ├── users.js           # Gestion utilisateurs
│   │   ├── products.js        # Gestion produits
│   │   ├── consultations.js   # Gestion consultations
│   │   ├── messages.js        # Gestion messages
│   │   ├── reclamations.js    # Gestion réclamations
│   │   └── statistics.js      # Gestion statistiques
│   ├── scripts/               # Scripts utilitaires
│   │   ├── createAdmin.js     # Créer un admin
│   │   ├── addUser.js         # Ajouter un utilisateur
│   │   ├── seedStatistics.js   # Initialiser statistiques
│   │   └── checkReclamations.js # Vérifier réclamations
│   ├── uploads/               # Fichiers uploadés
│   │   ├── users/             # Images de profil
│   │   └── [produits, vidéos, PDFs]
│   ├── server.js              # Point d'entrée serveur
│   └── package.json           # Dépendances Node.js
│
└── Front/                     # Interface frontend
    ├── assets/
    │   ├── css/
    │   │   └── style.css      # Styles principaux
    │   ├── img/                # Images statiques
    │   └── js/                 # JavaScript frontend
    │       ├── api.js          # Client API
    │       ├── auth.js         # Gestion authentification
    │       ├── main.js         # Fonctions utilitaires
    │       ├── admin.js       # Interface admin
    │       ├── farmer.js      # Interface fermier
    │       ├── consumer.js     # Interface consommateur
    │       ├── vet.js         # Interface vétérinaire
    │       ├── consultation.js # Gestion consultations
    │       ├── messages.js    # Gestion messages
    │       ├── products.js    # Gestion produits
    │       ├── reclamations.js # Gestion réclamations
    │       └── statistiques.js # Affichage statistiques
    ├── *.html                  # Pages HTML
    │   ├── index.html         # Page d'accueil
    │   ├── login.html         # Connexion
    │   ├── register.html      # Inscription
    │   ├── admin.html         # Dashboard admin
    │   ├── farmer.html        # Espace fermier
    │   ├── consumer.html      # Espace consommateur
    │   ├── veterinarian.html  # Espace vétérinaire
    │   ├── consultation.html  # Consultations
    │   ├── messages.html      # Module messages
    │   ├── reclamations.html  # Réclamations
    │   ├── statistiques.html  # Statistiques
    │   ├── marketplace.html   # Marché
    │   └── product-details.html # Détails produit
```

---

## 🛠️ Stack Technique

### Backend

#### **Runtime & Framework**
- **Node.js** : Runtime JavaScript côté serveur
- **Express.js 4.18.2** : Framework web minimaliste et flexible
  - Gestion des routes RESTful
  - Middleware pour parsing JSON/URL-encoded
  - Gestion des erreurs
  - Servir les fichiers statiques

#### **Base de Données**
- **MongoDB** : Base de données NoSQL orientée documents
  - Stockage flexible des données
  - Collections : `utilisateurs`, `produits`, `consultations`, `messages`, `reclamations`, `statistiques`
- **Mongoose 7.0.0** : ODM (Object Document Mapper) pour MongoDB
  - Schémas avec validation
  - Middleware (pre/post hooks)
  - Population de références
  - Index pour performance

#### **Authentification & Sécurité**
- **bcryptjs 3.0.3** : Hachage des mots de passe
  - Salt rounds : 10
  - Hash automatique avant sauvegarde (pre-save hook)
  - Méthode `comparePassword()` pour vérification

#### **Gestion des Fichiers**
- **Multer 2.0.2** : Middleware pour upload de fichiers
  - **Storage** : `diskStorage` (stockage sur disque)
  - **Limites** : 50MB max par fichier
  - **Types supportés** :
    - Images : JPEG, JPG, PNG, GIF, WEBP
    - Vidéos : MP4, AVI, MOV, WMV, FLV, MKV
    - PDF : Application/pdf
  - **Organisation** :
    - Produits : `/uploads/product-{timestamp}-{random}.{ext}`
    - Utilisateurs : `/uploads/users/user-{timestamp}.{ext}`
    - Vidéos : `/uploads/video-{timestamp}-{random}.{ext}`
    - PDF : `/uploads/pdf-{timestamp}-{random}.{ext}`

#### **CORS & Communication**
- **CORS 2.8.5** : Cross-Origin Resource Sharing
  - Permet les requêtes depuis le frontend
  - Configuration pour développement local

### Frontend

#### **Technologies Web Standards**
- **HTML5** : Structure sémantique
- **CSS3** : Styles modernes avec :
  - Variables CSS (custom properties)
  - Flexbox & Grid Layout
  - Media queries (responsive design)
  - Animations & transitions
  - Backdrop filters
- **JavaScript (ES6+)** : 
  - Async/await
  - Fetch API
  - Modules ES6
  - LocalStorage pour session

#### **Bibliothèques Externes**
- **Font Awesome 6.4.0** : Icônes vectorielles
- **Google Fonts (Inter)** : Typographie moderne

#### **Architecture Frontend**
- **SPA-like** : Navigation entre pages HTML
- **API Client** : Communication REST avec backend
- **State Management** : LocalStorage pour session utilisateur
- **Responsive Design** : Mobile-first approach

---

## 📊 Modèles de Données (Mongoose Schemas)

### 1. **User** (Utilisateur)
```javascript
{
  username: String (unique, required, min: 3)
  email: String (unique, required, lowercase)
  password: String (required, min: 6, hashed)
  name: String (required)
  role: Enum ['farmer', 'consumer', 'vet', 'admin']
  status: Enum ['pending', 'accepted', 'rejected', 'suspended']
  phone: String (optional)
  isVerified: Boolean (default: false)
  image: String (path to image)
  suspensionEndDate: Date (optional)
  suspensionReason: String (optional)
  timestamps: createdAt, updatedAt
}
```

**Fonctionnalités** :
- Hash automatique du mot de passe (pre-save hook)
- Méthode `comparePassword()` pour authentification
- Collection : `utilisateurs`

### 2. **Product** (Produit)
```javascript
{
  type: Enum ['mouton', 'huile']
  farmerId: ObjectId (ref: User, required)
  
  // Champs MOUTON
  price: Number (required if type='mouton', min: 0)
  weight: Number (required if type='mouton', min: 0)
  hasMedicalCertificate: Boolean
  medicalCertificatePDF: String (path)
  
  // Champs HUILE
  oilType: Enum ['la chemlali', 'la chetoui', 'oueslati', 'extra vierge']
  quantity: Number (required if type='huile', min: 0)
  
  // Champs communs
  description: String (required)
  image: String (path)
  status: Enum ['disponible', 'épuisé', 'suspendu']
  timestamps: createdAt, updatedAt
}
```

**Fonctionnalités** :
- Validation conditionnelle selon le type
- Population du `farmerId` pour récupérer les infos du fermier
- Collection : `produits`

### 3. **Consultation** (Consultation Vétérinaire)
```javascript
{
  farmerId: ObjectId (ref: User, required)
  vetId: ObjectId (ref: User, required)
  sheepIds: [ObjectId] (ref: Product, required, min: 1)
  description: String (required)
  video: String (path to video file)
  status: Enum ['en_attente', 'en_cours', 'terminée', 'annulée']
  vetResponse: String (optional)
  responseDate: Date (optional)
  timestamps: createdAt, updatedAt
}
```

**Fonctionnalités** :
- Support vidéo pour consultations
- Suivi de l'état de la consultation
- Collection : `consultations`

### 4. **Message** (Message entre Utilisateurs)
```javascript
{
  senderId: ObjectId (ref: User, required)
  receiverId: ObjectId (ref: User, required)
  subject: String (required)
  message: String (required)
  isRead: Boolean (default: false)
  productId: ObjectId (ref: Product, optional)
  timestamps: createdAt, updatedAt
}
```

**Fonctionnalités** :
- Lien optionnel avec un produit
- Marquage lu/non lu
- Population des expéditeurs/destinataires
- Collection : `messages`

### 5. **Reclamation** (Réclamation/Support)
```javascript
{
  numeroReference: String (unique, auto-generated: REC-YYYYMMDD-XXXX)
  sujet: String (required, max: 200)
  description: String (required, max: 2000)
  type: Enum ['technique', 'produit', 'service', 'autre']
  statut: Enum ['en_attente', 'en_cours', 'resolue', 'fermee']
  priorite: Enum ['basse', 'normale', 'haute', 'urgente']
  createdBy: ObjectId (ref: User, required)
  reponse: String (optional, max: 2000)
  resolvedBy: ObjectId (ref: Admin, optional)
  resolvedAt: Date (optional)
  fichiers: [{
    nom: String
    chemin: String
    type: String
    taille: Number
    uploadedAt: Date
  }]
  notesInternes: String (admin only)
  lastStatusUpdate: Date
  timestamps: createdAt, updatedAt
}
```

**Fonctionnalités** :
- Génération automatique du numéro de référence (pre-save hook)
- Support fichiers joints (multiples)
- Notes internes pour admins
- Index pour performance
- Collection : `reclamations`

### 6. **Statistic** (Statistique)
```javascript
{
  category: String (unique, required)
  displayName: String (required)
  icon: String (default: '📊')
  color: String (default: '#3498db')
  parts: [{
    label: String (required)
    percentage: Number (required, min: 0, max: 100)
    color: String
  }]
  isActive: Boolean (default: true)
  updatedBy: ObjectId (ref: Admin, optional)
  timestamps: createdAt, updatedAt
}
```

**Fonctionnalités** :
- Statistiques configurables par admin
- Support graphiques (pie charts)
- Collection : `statistiques`

### 7. **Admin** (Administrateur)
```javascript
{
  // Modèle séparé pour les administrateurs
  // Utilisé pour tracking des actions admin
}
```

---

## 🔌 API Endpoints (Routes REST)

### Base URL : `http://localhost:3000/api`

### **Authentification** (`/api/auth`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/register` | Inscription utilisateur | Non |
| POST | `/login` | Connexion | Non |
| GET | `/me` | Profil utilisateur actuel | Oui |
| PUT | `/profile` | Mettre à jour le profil | Oui |

**Détails** :
- `/register` : Upload image de profil (Multer)
- `/login` : Retourne token + infos utilisateur
- Validation des champs requis
- Vérification unicité email/username

### **Utilisateurs** (`/api/users`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/` | Liste tous les utilisateurs | Admin |
| GET | `/:id` | Détails utilisateur | Oui |
| PUT | `/:id` | Modifier utilisateur | Admin/Owner |
| DELETE | `/:id` | Supprimer utilisateur | Admin |
| PUT | `/:id/status` | Changer statut (accept/reject/suspend) | Admin |

**Fonctionnalités** :
- Filtrage par rôle
- Filtrage par statut
- Population des relations
- Validation des permissions

### **Produits** (`/api/products`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/` | Liste produits (filtres: type, status) | Public |
| GET | `/:id` | Détails produit | Public |
| POST | `/` | Créer produit (upload image/PDF) | Farmer |
| PUT | `/:id` | Modifier produit | Farmer/Owner |
| DELETE | `/:id` | Supprimer produit | Farmer/Owner |

**Fonctionnalités** :
- Upload multiple : image + certificat médical PDF
- Validation selon type (mouton/huile)
- Filtrage par fermier accepté uniquement
- Population du `farmerId`

### **Consultations** (`/api/consultations`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/` | Liste consultations | Farmer/Vet |
| GET | `/:id` | Détails consultation | Farmer/Vet |
| POST | `/` | Créer consultation (upload vidéo) | Farmer |
| PUT | `/:id` | Modifier consultation | Farmer/Vet |
| PUT | `/:id/respond` | Répondre à consultation | Vet |

**Fonctionnalités** :
- Upload vidéo pour consultation
- Sélection multiple de moutons
- Changement de statut
- Réponse vétérinaire

### **Messages** (`/api/messages`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/` | Liste messages (filtres: userId, type) | User |
| GET | `/:id` | Détails message | User |
| POST | `/` | Envoyer message | User |
| PUT | `/:id` | Modifier message (marquer lu) | User |
| DELETE | `/:id` | Supprimer message | User/Owner |

**Fonctionnalités** :
- Filtrage par type : `sent`, `received`, ou tous
- Lien optionnel avec produit (`productId`)
- Marquage lu/non lu
- Population expéditeur/destinataire/produit

### **Réclamations** (`/api/reclamations`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/` | Liste réclamations | User/Admin |
| GET | `/:id` | Détails réclamation | User/Admin |
| POST | `/` | Créer réclamation (upload fichiers) | User |
| PUT | `/:id` | Modifier réclamation | User/Admin |
| PUT | `/:id/respond` | Répondre à réclamation | Admin |
| DELETE | `/:id` | Supprimer réclamation | User/Admin |

**Fonctionnalités** :
- Upload multiple de fichiers
- Génération auto numéro référence
- Gestion statut et priorité
- Notes internes (admin only)

### **Statistiques** (`/api/statistics`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/` | Liste statistiques | Public |
| GET | `/:id` | Détails statistique | Public |
| POST | `/` | Créer statistique | Admin |
| PUT | `/:id` | Modifier statistique | Admin |
| DELETE | `/:id` | Supprimer statistique | Admin |

---

## 👥 Rôles & Permissions

### **1. Admin (Administrateur)**
- ✅ Gestion complète des utilisateurs (accepter, rejeter, suspendre)
- ✅ Gestion des réclamations (répondre, modifier statut)
- ✅ Gestion des statistiques (CRUD complet)
- ✅ Accès dashboard avec statistiques globales
- ✅ Voir tous les messages (modération)
- ✅ Supprimer n'importe quel contenu

### **2. Farmer (Fermier/Agriculteur)**
- ✅ Gérer ses produits (CRUD)
- ✅ Créer consultations vétérinaires
- ✅ Voir et répondre aux messages
- ✅ Voir ses statistiques de vente
- ✅ Contacter consommateurs
- ❌ Pas d'accès admin

### **3. Consumer (Consommateur)**
- ✅ Parcourir les produits disponibles
- ✅ Contacter les fermiers (messages)
- ✅ Voir et répondre aux messages
- ✅ Créer des réclamations
- ✅ Voir les statistiques publiques
- ❌ Pas de création de produits

### **4. Vet (Vétérinaire)**
- ✅ Voir les consultations en attente
- ✅ Répondre aux consultations
- ✅ Voir et répondre aux messages
- ✅ Voir les produits (pour analyses)
- ❌ Pas de création de produits

---

## 🎨 Interface Utilisateur

### **Pages Principales**

#### **1. Page d'Accueil (`index.html`)**
- Hero section avec CTA
- Présentation des services
- Guide "Comment ça marche"
- Footer avec liens

#### **2. Authentification**
- **Login** (`login.html`) : Connexion avec email/password
- **Register** (`register.html`) : Inscription avec upload photo profil

#### **3. Dashboard Admin (`admin.html`)**
- **Sidebar** : Navigation latérale
- **Sections** :
  - Statistiques globales
  - Utilisateurs en attente (approbation)
  - Utilisateurs acceptés
  - Tous les utilisateurs (filtres)
- **Actions** : Accepter, Rejeter, Suspendre, Réactiver, Supprimer

#### **4. Espace Fermier (`farmer.html`)**
- **Gestion Produits** :
  - Liste des produits
  - Ajouter/Modifier/Supprimer
  - Upload image + certificat médical
- **Messages Reçus** : Liste avec réponse
- **Actions Rapides** : Consultation vétérinaire

#### **5. Espace Consommateur (`consumer.html`)**
- **Animaux Disponibles** : Grille de produits
- **Messages Reçus** : Liste avec réponse
- **Mes Commandes** : Historique
- **Actions** : Contacter fermier, Plainte

#### **6. Espace Vétérinaire (`veterinarian.html`)**
- **Consultations** : Liste en attente/terminées
- **Répondre** : Formulaire de réponse
- **Messages** : Communication

#### **7. Consultations (`consultation.html`)**
- **Liste Vétérinaires** : Cartes avec infos
- **Nouvelle Consultation** : Modal avec :
  - Sélection vétérinaire
  - Sélection moutons (checkboxes)
  - Description
  - Upload vidéo

#### **8. Messages (`messages.html`)**
- **Onglets** : Reçus / Envoyés
- **Filtres** : Tous, Non lus, Lus, Avec produit
- **Recherche** : Par sujet/message/expéditeur
- **Détails** : Modal avec réponse
- **Badges** : Nombre de non lus

#### **9. Réclamations (`reclamations.html`)**
- **Liste** : Cartes avec statut/priorité
- **Nouvelle** : Formulaire avec upload fichiers
- **Détails** : Réponse admin visible

#### **10. Statistiques (`statistiques.html`)**
- **Graphiques** : Pie charts
- **Catégories** : Configurables par admin
- **Couleurs** : Personnalisables

---

## 🔐 Sécurité & Authentification

### **Gestion des Sessions**
- **LocalStorage** : Stockage token + infos utilisateur
- **Headers** : Envoi `X-User-Role`, `X-User-Id`, `X-User-Status`
- **Vérification** : Middleware backend pour routes protégées

### **Validation**
- **Frontend** : Validation HTML5 + JavaScript
- **Backend** : Validation Mongoose + Express
- **Mots de passe** : Min 6 caractères, hash bcrypt

### **Upload Sécurisé**
- **Types autorisés** : Vérification MIME type + extension
- **Taille limite** : 50MB (vidéos), 5MB (images)
- **Noms uniques** : Timestamp + random pour éviter collisions

---

## 📱 Responsive Design

### **Breakpoints**
- **Mobile** : < 768px
- **Tablet** : 768px - 1024px
- **Desktop** : > 1024px

### **Adaptations**
- Navbar hamburger sur mobile
- Grilles flexibles (grid-auto-fit)
- Modals fullscreen sur mobile
- Touch-friendly buttons

---

## 🚀 Déploiement & Configuration

### **Variables d'Environnement**
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/Agri
```

### **Démarrage**
```bash
# Backend
cd backend
npm install
npm start

# Frontend servi automatiquement par Express
```

### **Scripts Utilitaires**
- `scripts/createAdmin.js` : Créer un administrateur
- `scripts/addUser.js` : Ajouter un utilisateur
- `scripts/seedStatistics.js` : Initialiser statistiques

---

## 📈 Fonctionnalités Avancées

### **1. Système d'Approbation**
- Nouveaux utilisateurs : statut `pending`
- Admin peut : accepter, rejeter, suspendre
- Suspension temporaire avec date de fin

### **2. Messagerie Bidirectionnelle**
- Fermier ↔ Consommateur
- Lien avec produit (contexte)
- Marquage lu/non lu
- Recherche et filtres

### **3. Consultations Vétérinaires**
- Upload vidéo
- Sélection multiple de moutons
- Suivi de statut
- Réponse vétérinaire

### **4. Système de Réclamations**
- Numéro de référence unique
- Priorités (basse, normale, haute, urgente)
- Fichiers joints multiples
- Notes internes admin

### **5. Statistiques Dynamiques**
- Configurables par admin
- Graphiques pie charts
- Couleurs personnalisables
- Activation/désactivation

---

## 🎯 Points Forts du Projet

1. **Architecture Moderne** : RESTful API, séparation frontend/backend
2. **Sécurité** : Hash mots de passe, validation, permissions
3. **UX/UI** : Design moderne, responsive, animations
4. **Scalabilité** : MongoDB, structure modulaire
5. **Fonctionnalités Complètes** : Messagerie, consultations, réclamations
6. **Gestion Fichiers** : Multer avec organisation claire
7. **Multi-rôles** : 4 types d'utilisateurs avec permissions

---

## 🔮 Technologies & Outils Utilisés

### **Backend**
- Node.js
- Express.js 4.18.2
- MongoDB
- Mongoose 7.0.0
- bcryptjs 3.0.3
- Multer 2.0.2
- CORS 2.8.5

### **Frontend**
- HTML5
- CSS3 (Variables, Grid, Flexbox)
- JavaScript ES6+
- Font Awesome 6.4.0
- Google Fonts (Inter)

### **Outils de Développement**
- Git (version control)
- npm (gestion packages)
- MongoDB Compass (gestion BDD)

---

## 📝 Notes Finales

Ce projet représente une solution complète pour l'agriculture digitale en Tunisie, avec une architecture solide, une interface moderne, et des fonctionnalités avancées pour faciliter les échanges entre agriculteurs, consommateurs et vétérinaires.

**Version** : 1.0.0  
**Licence** : MIT  
**Auteur** : AgriSmart Team
