// On importe Vitest
import { describe, it, expect, vi } from "vitest";

// On teste d'abord quelque chose de simple : le runner TS fonctionne
describe("Test du runner TSX et du middleware", () => {

  it("TSX doit compiler et exécuter ce test", () => {
    const message: string = "Hello TSX!";
    // On vérifie que la variable contient bien ce qu'on attend
    expect(message).toBe("Hello TSX!");
  });

  it("On peut importer le middleware JWT correctement", async () => {
    // Set JWT_SECRET env var for the import to succeed
    process.env.JWT_SECRET = 'test-secret';
    // import dynamique ESM
    const { authMiddleware } = await import("../src/presentation/http/middlewares/auth.middleware.js");
    // Vérification que c'est bien une fonction
    expect(typeof authMiddleware).toBe("function");
  });

});
