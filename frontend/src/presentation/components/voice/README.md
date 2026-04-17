# 🎤 Système Voice - Documentation UI

## Vue d'ensemble

Le système voice a été conçu avec une UI moderne et intuitive inspirée de Discord, offrant une expérience utilisateur fluide et professionnelle.

---

## 🎨 Composants UI

### 1. **VoiceControls** - Barre de contrôle vocale

Barre fixée en bas de l'écran quand l'utilisateur est connecté à un voice channel.

**Fonctionnalités :**
-  Design moderne avec gradient et ombres
-  Indicateur de connexion animé (pulse vert)
-  Affichage du nom du channel vocal
-  Boutons Mute/Unmute avec icônes dynamiques
-  Boutons Deafen/Undeafen avec icônes dynamiques
-  Bouton Déconnecter avec hover rouge
-  Tooltips informatifs au survol
-  Animations de scale au hover (transform)
-  États visuels clairs (rouge quand muted/deafened)
-  Shadows colorées pour feedback visuel

**Design :**
```
┌────────────────────────────────────────────────────────────┐
│ [🎤] Voice Connected                    [🎙️] [🎧] │ [❌]│
│      nom-du-channel                                        │
└────────────────────────────────────────────────────────────┘
```

---

### 2. **ChannelItem** - Amélioration des Voice Channels

Liste des channels dans la sidebar avec design amélioré pour les voice channels.

**Fonctionnalités :**
-  Bouton "Rejoindre" avec gradient vert
-  Icône micro dans le bouton
-  Animation slide-in au hover
-  Shadow avec glow vert au hover
-  Transform scale pour feedback tactile
-  Badge vert montrant le nombre d'utilisateurs connectés
-  Animation pulse sur l'indicateur de connexion

**Design du badge utilisateurs :**
```
Channel Vocal    [●] 3 👥    [Rejoindre]
                 ↑   ↑  ↑         ↑
                 │   │  │         └─ Bouton gradient
                 │   │  └─────────── Icône users
                 │   └─────────────── Nombre
                 └─────────────────── Pulse animé
```

---

### 3. **VoiceUsersList** - Liste des utilisateurs connectés

Composant affichant tous les utilisateurs présents dans un voice channel.

**Fonctionnalités :**
-  Avatars avec initiales colorées (gradient)
-  Indicateur de connexion vert
-  Badges mute/deafen pour chaque user
-  Visualiseur audio animé (barres) quand actif
-  Animation slide-in pour nouveaux users
-  Hover state pour chaque user
-  État vide avec icône micro

**États visuels :**
- 🟢 **Actif** : Barres audio animées (4 barres vertes pulsantes)
- 🔴 **Muted** : Badge rouge avec icône micro barré
- 🔇 **Deafened** : Badge rouge avec icône casque barré

---

## 🎯 Interactions Utilisateur

### Rejoindre un Voice Channel

1. **Hover sur le channel** → Le bouton "Rejoindre" apparaît avec animation
2. **Click sur "Rejoindre"** → Connexion WebRTC + affichage VoiceControls
3. **Demande de permission micro** → Popup navigateur
4. **Connexion établie** → Barre de contrôle s'affiche en bas

### Contrôles Vocaux

| Action | Raccourci | Effet Visuel |
|--------|-----------|--------------|
| Mute | Click bouton 🎙️ | Fond rouge + shadow rouge |
| Deafen | Click bouton 🎧 | Fond rouge + shadow rouge (+ mute auto) |
| Disconnect | Click bouton ❌ | Quitte le channel + masque barre |

### Feedback Visuel

- **Hover bouton** : Scale 1.05 + shadow plus intense
- **Muted** : Bouton rouge avec glow rouge
- **Connected** : Pulse vert animé
- **Tooltip** : Apparaît 0.2s après hover

---

## 🎨 Palette de Couleurs

```css
/* Backgrounds */
--voice-bg-primary: #1e1f22;
--voice-bg-secondary: #232428;
--voice-bg-button: #3f4147;
--voice-bg-button-hover: #4a4d55;

/* States */
--voice-green: #22c55e;      /* Connected, Active */
--voice-green-glow: #22c55e30; /* Shadow effect */
--voice-red: #ef4444;         /* Muted, Deafened */
--voice-red-glow: #ef444430;  /* Shadow effect */

/* Text */
--voice-text-primary: #e5e7eb;
--voice-text-secondary: #9ca3af;
```

---

## 📐 Dimensions

```css
/* VoiceControls */
height: auto (padding 2.5)
position: fixed bottom-0
z-index: 50

/* Buttons */
button-size: 48px × 48px (p-3)
icon-size: 20px (w-5 h-5)
border-radius: 8px

/* Badge Users */
height: 24px
padding: 2px 8px
border-radius: 9999px (full)
```

---

## ✨ Animations

### Pulse (Connexion)
```css
@keyframes pulse {
  0%, 100% { opacity: 0.2 }
  50% { opacity: 0.8 }
}
animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
```

### Slide-in (Bouton Rejoindre)
```css
transform: translateX(-8px);
opacity: 0;

/* On hover */
transform: translateX(0);
opacity: 1;
transition: all 0.2s;
```

### Scale (Boutons)
```css
transform: scale(1);

/* On hover */
transform: scale(1.05);
transition: transform 0.2s;
```

---

## 🔧 Intégration

### Utilisation dans ServerPage

```tsx
import { VoiceControls } from '@presentation/components/voice/VoiceControls';

// Dans le composant
return (
  <ProtectedRoute>
    {/* Contenu de la page */}

    {/* Barre de contrôle vocale */}
    <VoiceControls />
  </ProtectedRoute>
);
```

### Props ChannelItem

```tsx
<ChannelItem
  id={channel.id}
  name={channel.name}
  type={ChannelType.VOICE}
  connectedUsers={3}        // Nombre d'users connectés
  onJoinVoice={handleJoin}  // Callback pour rejoindre
/>
```

---

## 🚀 Améliorations Futures

- [ ] Panneau déroulant montrant VoiceUsersList
- [ ] Indicateur de niveau audio (volume meter)
- [ ] Bouton Push-to-Talk avec raccourci clavier
- [ ] Mode Picture-in-Picture pour le voice panel
- [ ] Statistiques de connexion (latence, qualité)
- [ ] Support vidéo (webcam) pour les channels

---

## 📱 Responsive

| Breakpoint | Comportement |
|------------|--------------|
| Mobile (< 768px) | VoiceControls réduit, boutons plus petits |
| Tablet (768px-1024px) | UI standard |
| Desktop (> 1024px) | UI complète avec tooltips |

---

**Créé avec 💚 pour une expérience utilisateur premium**
