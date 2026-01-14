# 🤖 PROMPT COMPLET POUR CHATGPT - Rédaction du Rapport AgriSmart

Copie-colle tout ce document dans ChatGPT pour qu'il comprenne parfaitement ton projet et puisse t'aider à rédiger ton rapport.

---

## DÉBUT DU PROMPT

```
Tu es un expert en rédaction de rapports techniques et en développement web full-stack. Je vais te fournir toutes les informations sur mon projet "AgriSmart" pour que tu puisses m'aider à rédiger un rapport de projet complet et professionnel.

═══════════════════════════════════════════════════════════════════
                    PRÉSENTATION DU PROJET
═══════════════════════════════════════════════════════════════════

## Nom du Projet
**AgriSmart** - Plateforme Agricole Intelligente

## Contexte et Problématique
AgriSmart est une plateforme web développée pour moderniser et digitaliser le secteur agricole en Tunisie. Elle répond aux problématiques suivantes :
- Difficulté pour les agriculteurs tunisiens de vendre leurs produits directement aux consommateurs
- Manque de plateformes numériques dédiées à l'agriculture tunisienne
- Besoin de consultations vétérinaires à distance pour les animaux d'élevage
- Absence d'outils de suivi des statistiques du marché agricole tunisien

## Objectifs du Projet
1. Faciliter la vente directe de produits agricoles (moutons et huile d'olive tunisienne)
2. Permettre les consultations vétérinaires à distance avec upload de vidéos
3. Créer un système de messagerie entre tous les acteurs
4. Gérer les réclamations des utilisateurs
5. Fournir des statistiques sur le marché agricole tunisien
6. Offrir une gestion administrative complète des utilisateurs

## Public Cible
- Agriculteurs tunisiens (éleveurs de moutons, producteurs d'huile d'olive)
- Consommateurs tunisiens cherchant des produits agricoles de qualité
- Vétérinaires souhaitant offrir des consultations à distance
- Administrateurs de la plateforme

═══════════════════════════════════════════════════════════════════
                    STACK TECHNIQUE COMPLET
═══════════════════════════════════════════════════════════════════

## Architecture Générale
Architecture **Client-Serveur** avec:
- Frontend: Application web multi-pages (HTML/CSS/JS)
- Backend: API RESTful Node.js/Express
- Base de données: MongoDB (NoSQL)
- Communication: HTTP/HTTPS avec Fetch API

## Backend (Serveur)

### Technologies Utilisées
| Technologie | Version | Rôle |
|-------------|---------|------|
| Node.js | LTS | Runtime JavaScript côté serveur |
| Express.js | 4.18.2 | Framework web pour création d'API REST |
| MongoDB | - | Base de données NoSQL orientée documents |
| Mongoose | 7.0.0 | ODM (Object Document Mapper) pour MongoDB |
| bcryptjs | 3.0.3 | Hachage sécurisé des mots de passe |
| Multer | 2.0.2 | Middleware pour upload de fichiers |
| CORS | 2.8.5 | Gestion des requêtes cross-origin |

### Configuration du Serveur
- **Port**: 3000
- **URI MongoDB**: mongodb://localhost:27017/Agri
- **Timeout connexion**: 10000ms

### Structure des Dossiers Backend
```
backend/
├── config/
│   ├── db.js              # Configuration connexion MongoDB
│   └── multer.js          # Configuration upload fichiers
├── models/
│   ├── User.js            # Modèle utilisateur
│   ├── Admin.js           # Modèle administrateur
│   ├── Product.js         # Modèle produit
│   ├── Consultation.js    # Modèle consultation vétérinaire
│   ├── Message.js         # Modèle message
│   ├── Reclamation.js     # Modèle réclamation
│   └── Statistic.js       # Modèle statistique
├── routes/
│   ├── auth.js            # Routes authentification
│   ├── users.js           # Routes gestion utilisateurs
│   ├── products.js        # Routes gestion produits
│   ├── consultations.js   # Routes consultations
│   ├── messages.js        # Routes messagerie
│   ├── reclamations.js    # Routes réclamations
│   └── statistics.js      # Routes statistiques
├── scripts/
│   ├── createAdmin.js     # Script création admin
│   ├── addUser.js         # Script ajout utilisateur
│   └── seedStatistics.js  # Script initialisation stats
├── uploads/               # Fichiers uploadés
│   ├── users/             # Photos de profil
│   └── [images, vidéos, PDFs]
├── server.js              # Point d'entrée du serveur
└── package.json           # Dépendances Node.js
```

## Frontend (Client)

### Technologies Utilisées
| Technologie | Version | Rôle |
|-------------|---------|------|
| HTML5 | - | Structure sémantique des pages |
| CSS3 | - | Styles avec variables CSS, Flexbox, Grid |
| JavaScript ES6+ | - | Logique frontend avec async/await |
| Font Awesome | 6.4.0 | Bibliothèque d'icônes vectorielles |
| Google Fonts | Inter | Typographie moderne |

### Structure des Dossiers Frontend
```
Front/
├── assets/
│   ├── css/
│   │   └── style.css      # Styles globaux
│   ├── img/               # Images statiques
│   │   ├── logo.PNG
│   │   ├── background.jpg
│   │   ├── fermier.png
│   │   ├── Consommateur.jpg
│   │   └── vetrenaire.png
│   └── js/
│       ├── api.js         # Client API (fetch)
│       ├── auth.js        # Authentification
│       ├── main.js        # Fonctions utilitaires
│       ├── admin.js       # Interface admin
│       ├── farmer.js      # Interface fermier
│       ├── consumer.js    # Interface consommateur
│       ├── vet.js         # Interface vétérinaire
│       ├── consultation.js # Gestion consultations
│       ├── messages.js    # Gestion messages
│       ├── products.js    # Gestion produits
│       ├── reclamations.js # Gestion réclamations
│       └── statistiques.js # Affichage statistiques
├── index.html             # Page d'accueil
├── login.html             # Page connexion
├── register.html          # Page inscription
├── admin.html             # Dashboard admin
├── farmer.html            # Espace agriculteur
├── consumer.html          # Espace consommateur
├── veterinarian.html      # Espace vétérinaire
├── consultation.html      # Consultations vétérinaires
├── messages.html          # Messagerie
├── reclamations.html      # Réclamations
├── statistiques.html      # Statistiques marché
├── marketplace.html       # Marché produits
└── product-details.html   # Détails d'un produit
```

═══════════════════════════════════════════════════════════════════
                    LES 4 TYPES D'UTILISATEURS
═══════════════════════════════════════════════════════════════════

## 1. ADMINISTRATEUR (Admin)

### Rôle
Supervise et gère l'ensemble de la plateforme, valide les inscriptions, modère les contenus.

### Fonctionnalités
- ✅ Voir le dashboard avec statistiques globales (nombre d'utilisateurs, produits, etc.)
- ✅ Gérer les utilisateurs en attente (accepter / rejeter)
- ✅ Suspendre temporairement un utilisateur (avec date de fin et raison)
- ✅ Réactiver un utilisateur suspendu
- ✅ Supprimer définitivement un utilisateur
- ✅ Voir et filtrer tous les utilisateurs par rôle et statut
- ✅ Gérer les réclamations (voir, répondre, changer statut/priorité)
- ✅ Ajouter des notes internes aux réclamations
- ✅ Gérer les statistiques (créer, modifier, supprimer)
- ✅ Accès à toutes les sections de la plateforme

### Pages Accessibles
- `admin.html` - Dashboard principal avec sections:
  - Statistiques globales
  - Utilisateurs en attente de validation
  - Utilisateurs acceptés
  - Tous les utilisateurs (avec filtres)
- `reclamations.html` - Gestion des réclamations
- `statistiques.html` - Gestion des statistiques
- `messages.html` - Messagerie

### Comment l'Admin Gère les Utilisateurs
1. **Validation initiale**: Nouveaux utilisateurs = statut "pending"
2. **Acceptation**: Admin clique "Accepter" → statut = "accepted"
3. **Rejet**: Admin clique "Rejeter" → statut = "rejected"
4. **Suspension**: Admin sélectionne durée + raison → statut = "suspended"
5. **Réactivation**: Admin clique "Réactiver" → statut = "accepted"

---

## 2. AGRICULTEUR / FERMIER (Farmer)

### Rôle
Producteur agricole qui vend ses produits (moutons, huile d'olive) et peut demander des consultations vétérinaires.

### Fonctionnalités
- ✅ Gérer ses produits (ajouter, modifier, supprimer)
- ✅ Ajouter des moutons avec: prix, poids, description, photo, certificat médical PDF
- ✅ Ajouter de l'huile avec: type (Chemlali, Chetoui, Oueslati, Extra Vierge), quantité
- ✅ Créer des consultations vétérinaires pour ses moutons
- ✅ Sélectionner plusieurs moutons pour une consultation
- ✅ Uploader une vidéo de l'animal pour la consultation
- ✅ Voir les réponses des vétérinaires
- ✅ Envoyer/recevoir des messages avec les consommateurs
- ✅ Voir les statistiques du marché
- ✅ Soumettre des réclamations
- ✅ Mettre à jour sa photo de profil

### Pages Accessibles
- `farmer.html` - Espace personnel avec liste de ses produits
- `consultation.html` - Création de consultations vétérinaires
- `messages.html` - Messagerie
- `statistiques.html` - Statistiques du marché
- `reclamations.html` - Mes réclamations

### Workflow Ajout de Produit (Mouton)
1. Fermier clique "Ajouter un mouton"
2. Remplit: prix (TND), poids (kg), description
3. Upload image du mouton
4. Option: certificat médical vétérinaire (PDF)
5. Soumission → Produit visible sur le marketplace

### Workflow Consultation Vétérinaire
1. Fermier accède à `consultation.html`
2. Sélectionne un vétérinaire dans la liste
3. Coche les moutons concernés (checkboxes)
4. Décrit le problème observé
5. Upload vidéo de l'animal (optionnel)
6. Soumet la demande → Statut "en_attente"
7. Vétérinaire répond → Statut "terminée"

---

## 3. CONSOMMATEUR (Consumer)

### Rôle
Acheteur qui parcourt les produits, contacte les agriculteurs et effectue des achats.

### Fonctionnalités
- ✅ Parcourir tous les produits disponibles (moutons et huiles)
- ✅ Voir les détails d'un produit (prix, poids, description, fermier)
- ✅ Filtrer les produits par type (mouton/huile)
- ✅ Contacter un agriculteur via messagerie (lié au produit)
- ✅ Voir ses messages reçus et envoyés
- ✅ Soumettre des réclamations (problème technique, produit, service)
- ✅ Voir les statistiques publiques
- ✅ Mettre à jour sa photo de profil

### Pages Accessibles
- `consumer.html` - Espace personnel
- `marketplace.html` - Liste des produits
- `product-details.html` - Détails d'un produit
- `messages.html` - Messagerie
- `reclamations.html` - Mes réclamations
- `statistiques.html` - Statistiques

### Workflow Contact Fermier
1. Consommateur voit un produit qui l'intéresse
2. Clique "Contacter le fermier"
3. Modal s'ouvre avec formulaire message
4. Remplit: sujet, message
5. Le message est lié au produit (productId)
6. Fermier reçoit le message avec contexte produit

---

## 4. VÉTÉRINAIRE (Vet)

### Rôle
Professionnel de santé animale qui répond aux consultations des agriculteurs.

### Fonctionnalités
- ✅ Voir les consultations en attente
- ✅ Voir les consultations qui lui sont assignées
- ✅ Consulter les détails: moutons concernés, description, vidéo
- ✅ Rédiger une réponse/diagnostic
- ✅ Changer le statut de la consultation (en_cours, terminée)
- ✅ Envoyer/recevoir des messages
- ✅ Soumettre des réclamations
- ✅ Voir les statistiques

### Pages Accessibles
- `veterinarian.html` - Espace personnel avec consultations
- `messages.html` - Messagerie
- `reclamations.html` - Mes réclamations
- `statistiques.html` - Statistiques

### Workflow Réponse Consultation
1. Vétérinaire voit notification nouvelle consultation
2. Ouvre les détails: description + moutons + vidéo
3. Analyse le cas
4. Rédige sa réponse/diagnostic dans le formulaire
5. Soumet → Statut passe à "terminée"
6. Fermier reçoit la réponse

═══════════════════════════════════════════════════════════════════
                    MODÈLES DE DONNÉES (MongoDB)
═══════════════════════════════════════════════════════════════════

## 1. User (Utilisateur) - Collection: "utilisateurs"

```javascript
{
  _id: ObjectId,
  username: String,        // Unique, min 3 caractères
  email: String,           // Unique, lowercase, format email validé
  password: String,        // Hashé avec bcrypt (salt 10)
  name: String,            // Nom complet
  role: String,            // "farmer" | "consumer" | "vet" | "admin"
  status: String,          // "pending" | "accepted" | "rejected" | "suspended"
  phone: String,           // Optionnel
  image: String,           // Chemin vers photo de profil
  isVerified: Boolean,     // Default: false
  suspensionEndDate: Date, // Date fin de suspension (si suspendu)
  suspensionReason: String,// Raison de la suspension
  createdAt: Date,
  updatedAt: Date
}
```

**Hooks Mongoose:**
- `pre('save')`: Hash automatique du mot de passe si modifié

**Méthodes:**
- `comparePassword(password)`: Compare mot de passe en clair avec hash

---

## 2. Admin (Administrateur) - Collection: "administrateurs"

```javascript
{
  _id: ObjectId,
  prenom: String,      // Prénom de l'admin
  nom: String,         // Nom de l'admin
  email: String,       // Unique, format email
  motdepasse: String,  // Mot de passe (non hashé dans ce modèle)
  createdAt: Date,
  updatedAt: Date
}
```

**Note:** Les admins sont stockés dans une collection séparée pour plus de sécurité.

---

## 3. Product (Produit) - Collection: "produits"

```javascript
{
  _id: ObjectId,
  type: String,            // "mouton" | "huile"
  farmerId: ObjectId,      // Référence vers User (fermier)
  
  // Champs pour MOUTON uniquement
  price: Number,           // Prix en TND
  weight: Number,          // Poids en kg
  hasMedicalCertificate: Boolean,
  medicalCertificatePDF: String,  // Chemin vers le PDF
  
  // Champs pour HUILE uniquement
  oilType: String,         // "la chemlali" | "la chetoui" | "oueslati" | "extra vierge"
  quantity: Number,        // Quantité en litres
  
  // Champs communs
  description: String,
  image: String,           // Chemin vers l'image
  status: String,          // "disponible" | "épuisé" | "suspendu"
  createdAt: Date,
  updatedAt: Date
}
```

**Validation conditionnelle:**
- Si type = "mouton": price et weight sont requis
- Si type = "huile": oilType et quantity sont requis

---

## 4. Consultation - Collection: "consultations"

```javascript
{
  _id: ObjectId,
  farmerId: ObjectId,      // Référence vers User (fermier)
  vetId: ObjectId,         // Référence vers User (vétérinaire)
  sheepIds: [ObjectId],    // Array de références vers Product (moutons)
  description: String,     // Description du problème
  video: String,           // Chemin vers la vidéo uploadée
  status: String,          // "en_attente" | "en_cours" | "terminée" | "annulée"
  vetResponse: String,     // Réponse du vétérinaire
  responseDate: Date,      // Date de la réponse
  createdAt: Date,
  updatedAt: Date
}
```

---

## 5. Message - Collection: "messages"

```javascript
{
  _id: ObjectId,
  senderId: ObjectId,      // Référence vers User (expéditeur)
  receiverId: ObjectId,    // Référence vers User (destinataire)
  subject: String,         // Sujet du message
  message: String,         // Contenu du message
  isRead: Boolean,         // Default: false
  productId: ObjectId,     // Optionnel - référence vers Product
  createdAt: Date,
  updatedAt: Date
}
```

---

## 6. Reclamation - Collection: "reclamations"

```javascript
{
  _id: ObjectId,
  numeroReference: String, // Unique, auto-généré: "REC-YYYYMMDD-XXXX"
  sujet: String,           // Max 200 caractères
  description: String,     // Max 2000 caractères
  type: String,            // "technique" | "produit" | "service" | "autre"
  statut: String,          // "en_attente" | "en_cours" | "resolue" | "fermee"
  priorite: String,        // "basse" | "normale" | "haute" | "urgente"
  createdBy: ObjectId,     // Référence vers User
  reponse: String,         // Réponse de l'admin
  resolvedBy: ObjectId,    // Référence vers Admin
  resolvedAt: Date,
  fichiers: [{             // Fichiers joints
    nom: String,
    chemin: String,
    type: String,
    taille: Number,
    uploadedAt: Date
  }],
  notesInternes: String,   // Notes admin (non visibles par utilisateur)
  lastStatusUpdate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Hooks Mongoose:**
- `pre('save')`: Génération automatique du numeroReference si absent

**Index pour performance:**
- `{ createdBy: 1, createdAt: -1 }`
- `{ statut: 1, createdAt: -1 }`
- `{ type: 1, statut: 1 }`
- `{ numeroReference: 1 }`

---

## 7. Statistic - Collection: "statistiques"

```javascript
{
  _id: ObjectId,
  category: String,        // Unique (ex: "production_huile")
  displayName: String,     // Nom affiché (ex: "Production d'Huile d'Olive")
  icon: String,            // Emoji (default: "📊")
  color: String,           // Couleur hex (default: "#3498db")
  parts: [{                // Parts du graphique pie
    label: String,         // Ex: "Chetoui"
    percentage: Number,    // 0-100
    color: String          // Couleur de la part
  }],
  isActive: Boolean,       // Default: true
  updatedBy: ObjectId,     // Référence vers Admin
  createdAt: Date,
  updatedAt: Date
}
```

═══════════════════════════════════════════════════════════════════
                    API ENDPOINTS (Routes REST)
═══════════════════════════════════════════════════════════════════

Base URL: `http://localhost:3000/api`

## Authentification (/api/auth)

| Méthode | Endpoint | Description | Corps Requête |
|---------|----------|-------------|---------------|
| POST | /register | Inscription | FormData: username, email, password, name, role, image |
| POST | /login | Connexion | { email, password } |

### Processus d'Inscription
1. Validation des champs requis
2. Vérification unicité email/username
3. Upload image de profil (si fournie)
4. Création utilisateur avec status="pending"
5. Hash automatique du mot de passe
6. Retour: success + infos utilisateur

### Processus de Connexion
1. Vérification email dans table Admin d'abord
2. Si admin: vérification mot de passe direct
3. Sinon: recherche dans table User
4. Vérification mot de passe (bcrypt compare)
5. Vérification statut (accepted, pending, rejected, suspended)
6. Si suspendu: vérification date fin suspension
7. Auto-désuspension si date dépassée
8. Retour: success + infos utilisateur

---

## Utilisateurs (/api/users)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| GET | / | Liste tous les utilisateurs | Admin |
| GET | /:id | Détails d'un utilisateur | Authentifié |
| PUT | /:id | Modifier un utilisateur | Admin/Propriétaire |
| PATCH | /:id | Modifier partiellement | Admin/Propriétaire |
| DELETE | /:id | Supprimer un utilisateur | Admin |

### Champs modifiables (PUT/PATCH)
- name, email, role, status
- suspensionEndDate, suspensionReason
- image (via FormData)

---

## Produits (/api/products)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| GET | / | Liste produits (filtres: type, status) | Public |
| GET | /:id | Détails d'un produit | Public |
| POST | / | Créer un produit | Farmer |
| PUT | /:id | Modifier un produit | Farmer/Propriétaire |
| DELETE | /:id | Supprimer un produit | Farmer/Propriétaire |

### Création Produit (POST)
- FormData avec champs selon le type
- Upload: image, medicalCertificatePDF (mouton uniquement)
- Validation conditionnelle selon type

### Filtrage GET /
- `?type=mouton` ou `?type=huile`
- `?status=disponible`
- Seuls les produits de fermiers "accepted" sont retournés

---

## Consultations (/api/consultations)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| GET | / | Liste consultations | Farmer/Vet |
| GET | /:id | Détails consultation | Farmer/Vet |
| POST | / | Créer consultation | Farmer |
| PUT | /:id | Modifier consultation | Farmer/Vet |
| PUT | /:id/respond | Répondre (vétérinaire) | Vet |

### Création Consultation (POST)
- FormData: farmerId, vetId, sheepIds[], description
- Upload: video (optionnel)
- Statut initial: "en_attente"

### Filtrage GET /
- `?farmerId=xxx` - Consultations d'un fermier
- `?vetId=xxx` - Consultations d'un vétérinaire

---

## Messages (/api/messages)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| GET | / | Liste messages | Authentifié |
| GET | /:id | Détails message | Authentifié |
| POST | / | Envoyer message | Authentifié |
| PUT | /:id | Modifier (marquer lu) | Authentifié |
| DELETE | /:id | Supprimer message | Propriétaire |

### Filtrage GET /
- `?userId=xxx` - Messages de/pour cet utilisateur
- `?type=sent` - Messages envoyés
- `?type=received` - Messages reçus

---

## Réclamations (/api/reclamations)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| GET | / | Liste réclamations | User/Admin |
| GET | /:id | Détails réclamation | User/Admin |
| POST | / | Créer réclamation | Authentifié |
| PUT | /:id | Modifier réclamation | User/Admin |
| PUT | /:id/respond | Répondre (admin) | Admin |
| DELETE | /:id | Supprimer | User/Admin |

### Filtrage GET /
- `?userId=xxx&role=xxx` - Si non admin, seulement ses réclamations

---

## Statistiques (/api/statistics)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| GET | / | Liste statistiques actives | Public |
| GET | /:id | Détails statistique | Public |
| POST | / | Créer statistique | Admin |
| PUT | /:id | Modifier statistique | Admin |
| DELETE | /:id | Supprimer statistique | Admin |

═══════════════════════════════════════════════════════════════════
                    SÉCURITÉ ET AUTHENTIFICATION
═══════════════════════════════════════════════════════════════════

## Hachage des Mots de Passe

### Algorithme: bcryptjs
- Salt rounds: 10
- Hook Mongoose `pre('save')` pour hash automatique
- Méthode `comparePassword()` pour vérification

### Code de Hachage
```javascript
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};
```

## Gestion des Sessions

### Stockage: LocalStorage
- Clé: `currentUser`
- Contenu: objet JSON avec id, username, email, name, role, status, image

### Headers Envoyés à Chaque Requête
```javascript
function getHeaders() {
    const user = getCurrentUser();
    return {
        'Content-Type': 'application/json',
        'X-User-Role': user?.role,
        'X-User-Id': user?.id,
        'X-User-Status': user?.status
    };
}
```

## Validation des Données

### Frontend
- Validation HTML5 (required, minlength, pattern)
- Validation JavaScript avant envoi

### Backend
- Validation Mongoose (schémas avec contraintes)
- Validation Express (vérification champs requis)

### Exemple Validation Mongoose
```javascript
email: {
    type: String,
    required: [true, "L'email est requis"],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Email invalide"]
}
```

## Upload Sécurisé (Multer)

### Configuration
```javascript
const fileFilter = (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const allowedVideoTypes = /mp4|avi|mov|wmv|flv|mkv/;
    const allowedPdfTypes = /pdf/;
    
    // Double vérification: extension ET MIME type
    const isImage = allowedImageTypes.test(ext) && file.mimetype.startsWith('image/');
    const isVideo = allowedVideoTypes.test(ext) && file.mimetype.startsWith('video/');
    const isPdf = allowedPdfTypes.test(ext) && file.mimetype === 'application/pdf';
};
```

### Limites
- Taille max fichier: 50 MB (vidéos), 5 MB (images)
- Types autorisés: JPEG, PNG, GIF, WEBP, MP4, AVI, MOV, PDF

### Nommage Fichiers
- Format: `{prefix}-{timestamp}-{random}.{ext}`
- Prefixes: `product-`, `video-`, `pdf-`, `user-`

## Système de Statuts Utilisateur

### Workflow
```
Inscription → pending → [Admin valide] → accepted
                     → [Admin rejette] → rejected
                     
accepted → [Admin suspend] → suspended (avec durée)
                          → [Durée expirée] → accepted (auto)
```

### Vérification à la Connexion
```javascript
if (user.status === 'suspended') {
    if (new Date() >= new Date(user.suspensionEndDate)) {
        // Auto-désuspension
        user.status = 'accepted';
        await user.save();
    } else {
        // Toujours suspendu - refuser connexion
        return res.status(403).json({
            message: `Suspendu jusqu'au ${endDate}. Raison: ${reason}`
        });
    }
}
```

═══════════════════════════════════════════════════════════════════
                    FLUX APPLICATIFS (WORKFLOWS)
═══════════════════════════════════════════════════════════════════

## 1. Inscription et Validation

```
[Utilisateur]                    [Système]                      [Admin]
     |                               |                              |
     |-- Remplit formulaire -------->|                              |
     |   (username, email, pwd,      |                              |
     |    name, role, image)         |                              |
     |                               |                              |
     |                               |-- Valide données             |
     |                               |-- Hash mot de passe          |
     |                               |-- Sauvegarde (status=pending)|
     |                               |                              |
     |<-- Message "En attente" ------|                              |
     |                               |                              |
     |                               |---------------- Notifie ---->|
     |                               |                              |
     |                               |<--- Accepte/Rejette ---------|
     |                               |                              |
     |<-- Peut se connecter ---------|                              |
```

## 2. Ajout de Produit (Mouton)

```
[Fermier]                        [Système]                      [Base de Données]
    |                                |                                  |
    |-- Clique "Ajouter mouton" ---->|                                  |
    |                                |                                  |
    |<-- Affiche formulaire ---------|                                  |
    |                                |                                  |
    |-- Remplit: prix, poids,        |                                  |
    |   description, image, PDF ---->|                                  |
    |                                |                                  |
    |                                |-- Valide données                 |
    |                                |-- Upload fichiers                |
    |                                |                                  |
    |                                |-- Sauvegarde produit ----------->|
    |                                |                                  |
    |<-- Confirmation ----------------|                                  |
    |                                |                                  |
    [Produit visible sur marketplace]
```

## 3. Consultation Vétérinaire

```
[Fermier]              [Système]              [Vétérinaire]
    |                      |                       |
    |-- Sélectionne vet -->|                       |
    |-- Coche moutons ---->|                       |
    |-- Décrit problème -->|                       |
    |-- Upload vidéo ----->|                       |
    |                      |                       |
    |                      |-- Crée consultation   |
    |                      |   (status=en_attente) |
    |                      |                       |
    |                      |-------- Notifie ----->|
    |                      |                       |
    |                      |<-- Voit détails ------|
    |                      |<-- Regarde vidéo -----|
    |                      |<-- Rédige réponse ----|
    |                      |                       |
    |                      |-- Update consultation |
    |                      |   (status=terminée)   |
    |                      |                       |
    |<-- Reçoit réponse ---|                       |
```

## 4. Contact Fermier (Consommateur)

```
[Consommateur]          [Système]              [Fermier]
    |                       |                      |
    |-- Parcourt produits ->|                      |
    |-- Clique "Contacter"->|                      |
    |                       |                      |
    |<-- Modal message -----|                      |
    |                       |                      |
    |-- Remplit sujet/msg ->|                      |
    |                       |                      |
    |                       |-- Crée message       |
    |                       |   (lié au produit)   |
    |                       |                      |
    |                       |-------- Notifie ---->|
    |                       |                      |
    |                       |<-- Voit message -----|
    |                       |<-- Répond ----------|
    |                       |                      |
    |<-- Reçoit réponse ----|                      |
```

## 5. Réclamation

```
[Utilisateur]           [Système]              [Admin]
    |                       |                      |
    |-- Soumet réclamation->|                      |
    |   (type, sujet,       |                      |
    |    description,       |                      |
    |    fichiers)          |                      |
    |                       |                      |
    |                       |-- Génère référence   |
    |                       |   REC-YYYYMMDD-XXXX  |
    |                       |-- Sauvegarde         |
    |                       |   (statut=en_attente)|
    |                       |                      |
    |<-- Confirmation ------|                      |
    |                       |                      |
    |                       |-------- Notifie ---->|
    |                       |                      |
    |                       |<-- Traite réclamation|
    |                       |<-- Ajoute réponse ---|
    |                       |<-- Change statut ----|
    |                       |                      |
    |<-- Voit réponse ------|                      |
```

═══════════════════════════════════════════════════════════════════
                    INTERFACE UTILISATEUR
═══════════════════════════════════════════════════════════════════

## Design et Style

### Palette de Couleurs
- Primary: #4CAF50 (vert agricole)
- Secondary: #2c3e50 (bleu foncé)
- Accent: #27ae60 (vert accent)
- Background: #f5f6fa (gris clair)
- Text: #2c3e50 (gris foncé)

### Typographie
- Police principale: "Inter" (Google Fonts)
- Tailles: 16px base, 24px-32px titres, 14px sous-textes

### Composants UI
- Cards avec ombres et border-radius
- Boutons avec hover effects
- Modals pour formulaires
- Tableaux responsives
- Badges colorés pour statuts

## Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Adaptations Mobile
- Menu hamburger
- Grilles single-column
- Modals fullscreen
- Boutons plus grands (touch-friendly)

═══════════════════════════════════════════════════════════════════
                    INSTRUCTIONS POUR CHATGPT
═══════════════════════════════════════════════════════════════════

Maintenant que tu as toutes les informations sur mon projet AgriSmart, tu peux m'aider à :

1. **Rédiger l'introduction du rapport** (contexte, problématique, objectifs)
2. **Décrire l'architecture technique** (diagrammes, stack, choix techniques)
3. **Expliquer les modèles de données** (schémas, relations)
4. **Documenter les fonctionnalités** par type d'utilisateur
5. **Décrire la sécurité** (authentification, validation, upload)
6. **Créer des diagrammes** (cas d'utilisation, séquence, classes)
7. **Rédiger la conclusion** (bilan, perspectives)

Quand je te demande d'écrire une section, utilise un langage professionnel et technique adapté à un rapport de projet universitaire/professionnel.

Je suis prêt à te poser des questions spécifiques sur les sections du rapport.
```

---

## FIN DU PROMPT

---

## 📋 Comment Utiliser ce Prompt

1. **Copie** tout le contenu entre "DÉBUT DU PROMPT" et "FIN DU PROMPT"
2. **Colle** dans une nouvelle conversation ChatGPT
3. **Envoie** le message
4. **Demande** ensuite les sections spécifiques de ton rapport:

### Exemples de Questions à Poser

```
Rédige-moi l'introduction du rapport avec le contexte, la problématique et les objectifs.
```

```
Écris la section "Architecture Technique" avec un tableau des technologies utilisées.
```

```
Génère un diagramme de cas d'utilisation en format textuel pour le rôle Agriculteur.
```

```
Rédige la section sur la sécurité et l'authentification.
```

```
Écris la conclusion du rapport avec un bilan et des perspectives d'amélioration.
```

```
Crée un diagramme de séquence pour le workflow de consultation vétérinaire.
```

---

Bonne rédaction de ton rapport ! 🎓
