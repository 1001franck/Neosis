/**
 * FOOTER COMPONENT
 * Composant footer réutilisable
 */

'use client';

import React from 'react';

interface FooterProps {
  compact?: boolean;
}

/**
 * Composant Footer
 *
 * @example
 * <Footer />
 * <Footer compact />
 */
export function Footer({ compact = false }: FooterProps): React.ReactNode {
  const currentYear = new Date().getFullYear();

  if (compact) {
    return (
      <footer className="bg-card border-t border-border py-4">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          © {currentYear} Chatbox. Tous droits réservés.
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-card border-t border-border text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Contenu */}
        <div className="grid grid-cols-4 gap-8 mb-8">
          {/* Colonne 1 */}
          <div>
            <h3 className="text-white font-semibold mb-4">Chatbox</h3>
            <p className="text-sm text-gray-400">
              Une plateforme de collaboration en temps réel construite avec Clean Architecture.
            </p>
          </div>

          {/* Colonne 2 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Produit</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-foreground transition-colors">
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-foreground transition-colors">
                  Tarification
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-foreground transition-colors">
                  Sécurité
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 3 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-foreground transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-foreground transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 4 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-foreground transition-colors">
                  Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-foreground transition-colors">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-foreground transition-colors">
                  Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Séparation */}
        <div className="border-t border-border pt-8 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            © {currentYear} Chatbox. Tous droits réservés.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-foreground transition-colors">
              Twitter
            </a>
            <a href="#" className="text-gray-400 hover:text-foreground transition-colors">
              GitHub
            </a>
            <a href="#" className="text-gray-400 hover:text-foreground transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

