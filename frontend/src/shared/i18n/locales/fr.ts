export const fr = {
  settings: {
    title: 'Profil',
    generalInfo: 'Informations Générales',
    customStatus: 'Statut Personnalisé',
    username: "Nom d'utilisateur",
    usernamePlaceholder: "Votre nom d'utilisateur",
    bio: 'Bio',
    bioPlaceholder: 'Décrivez-vous...',
    statusText: 'Texte du statut',
    statusPlaceholder: 'Ex: En train de jouer...',
    emoji: 'Emoji',
    save: 'Enregistrer les modifications',
    saving: 'Enregistrement...',
    editBanner: 'Modifier',
    uploadingBanner: 'Envoi...',
    addBanner: 'Ajouter une bannière',
    profileUpdated: 'Profil mis à jour !',
    avatarUpdated: 'Avatar mis à jour !',
    bannerUpdated: 'Bannière mise à jour !',
    errorAvatar: "Erreur lors de la mise à jour de l'avatar",
    errorBanner: 'Erreur lors de la mise à jour de la bannière',
    errorProfile: 'Erreur lors de la mise à jour du profil',
    errorImageOnly: 'Le fichier doit être une image',
    errorImageSize: "L'image ne doit pas dépasser 10 Mo",
  },
  theme: {
    light: 'Clair',
    dark: 'Sombre',
  },
  language: {
    label: 'Langue',
    fr: 'Français',
    en: 'English',
  },
} as const;

export type Translations = typeof fr;