# Transistor Clicker - Android Build Instructions

Ce projet a été configuré avec **Capacitor** pour permettre de transformer le jeu web en une application Android native prête pour le Google Play Store.

## Prérequis

1.  **Android Studio** installé sur votre machine.
2.  **Node.js** et **npm** installés.

## Structure du projet

*   `www/` : Dossier contenant les fichiers web optimisés pour l'application mobile.
*   `android/` : Projet Android natif (ouvrable dans Android Studio).
*   `capacitor.config.json` : Configuration de Capacitor.

## Commandes utiles

### 1. Préparer les fichiers web
Chaque fois que vous modifiez le code JavaScript, CSS ou HTML, vous devez mettre à jour le dossier `www` :
```bash
npm run build
```

### 2. Synchroniser avec Android
Après avoir mis à jour `www`, synchronisez les fichiers avec le projet Android :
```bash
npx cap sync android
```

### 3. Ouvrir dans Android Studio
Pour compiler l'APK ou l'App Bundle (AAB) :
```bash
npx cap open android
```

## Étapes pour le Google Play Store

### 1. Icônes et Splash Screen
Les icônes par défaut de Capacitor sont installées. Pour les remplacer :
1.  Préparez une icône de 1024x1024px.
2.  Remplacez manuellement les fichiers dans `android/app/src/main/res/mipmap-*` ou utilisez un générateur d'icônes Android en ligne.

### 2. Nom de l'application et ID
*   **Nom** : Modifiable dans `android/app/src/main/res/values/strings.xml`.
*   **ID (Package Name)** : Actuellement `com.tarah.transistor`. Modifiable dans `capacitor.config.json` et `android/app/build.gradle`.

### 3. Générer le fichier signé (AAB)
Dans Android Studio :
1.  Allez dans **Build > Generate Signed Bundle / APK...**
2.  Choisissez **Android App Bundle** (requis pour le Play Store).
3.  Créez ou utilisez une **KeyStore** existante.
4.  Remplissez les informations de signature.
5.  Le fichier `.aab` sera généré dans `android/app/release/`.

### 4. Publication
1.  Créez un compte sur la [Google Play Console](https://play.google.com/console/).
2.  Créez une nouvelle application.
3.  Importez le fichier `.aab`.
4.  Remplissez les fiches descriptives et les questionnaires (contenu, confidentialité).

## Notes techniques
*   Le jeu utilise le stockage local (`localStorage`) qui est persisté par la WebView d'Android.
*   L'application tourne en plein écran (configuré dans `manifest.json` et géré par Capacitor).
