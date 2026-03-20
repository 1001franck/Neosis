import express, { type Express } from "express";
import { intlayer, t, getDictionary, getIntlayer } from "express-intlayer";
import dictionaryExample from "./index.content.js";

const app: Express = express();

// Charger le gestionnaire de requêtes d'internationalisation
app.use(intlayer());

// Routes
app.get("/t_example", (_req, res) => {
  res.send(
    t({
      en: "Example of returned content in English",
      fr: "Exemple de contenu renvoyé en français",
      "es-ES": "Ejemplo de contenido devuelto en español (España)",
      "es-MX": "Ejemplo de contenido devuelto en español (México)",
    })
  );
});

app.get("/getIntlayer_example", (_req, res) => {
  res.send(getIntlayer("index").exampleOfContent);
});

app.get("/getDictionary_example", (_req, res) => {
  res.send(getDictionary(dictionaryExample).exampleOfContent);
});

// Démarrer le serveur
app.listen(3000, () => console.log(`Écoute sur le port 3000`));