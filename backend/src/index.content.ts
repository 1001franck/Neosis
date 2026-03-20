import { t, type Dictionary } from "intlayer";

const indexContent = {
  key: "index",
  content: {
    exampleOfContent: t({
      en: "Example of content",
      fr: "Exemple de contenu",
    }),
  },
} satisfies Dictionary;

export default indexContent;