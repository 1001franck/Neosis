/**
 * EMPTY STATE COMPONENT
 * État vide avec illustration Wumpus
 * 
 * Responsabilités:
 * - Afficher l'illustration Wumpus
 * - Message d'invitation
 */

'use client';



interface EmptyStateProps {
  title?: string;
  description?: string;
}

/**
 * Composant EmptyState
 * Empty state Discord avec Wumpus
 */
export function EmptyState({ 
  title = "Wumpus attend que vous choisissiez une conversation.",
  description
}: EmptyStateProps): React.ReactNode {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-background px-8">
      {/* Wumpus Illustration */}
      <div className="mb-8">
        <svg
          width="433"
          height="232"
          viewBox="0 0 433 232"
          className="text-muted"
          fill="currentColor"
        >
          {/* Simplified Wumpus illustration */}
          <g>
            {/* Background elements */}
            <path d="M337.5 104.5C337.5 104.5 337.5 104.5 337.5 104.5Z" opacity="0.15" />
            
            {/* Wumpus body */}
            <ellipse cx="216" cy="150" rx="60" ry="50" opacity="0.3" />
            
            {/* Wumpus head */}
            <ellipse cx="216" cy="100" rx="45" ry="40" opacity="0.3" />
            
            {/* Eyes */}
            <circle cx="200" cy="95" r="8" fill="#2f3136" />
            <circle cx="232" cy="95" r="8" fill="#2f3136" />
            
            {/* Nose/snout */}
            <ellipse cx="216" cy="108" rx="12" ry="8" opacity="0.4" />
            
            {/* Ears */}
            <ellipse cx="185" cy="75" rx="10" ry="18" opacity="0.3" transform="rotate(-20 185 75)" />
            <ellipse cx="247" cy="75" rx="10" ry="18" opacity="0.3" transform="rotate(20 247 75)" />
            
            {/* Legs */}
            <rect x="190" y="180" width="15" height="30" rx="7" opacity="0.3" />
            <rect x="227" y="180" width="15" height="30" rx="7" opacity="0.3" />
            
            {/* Decorative elements - plants */}
            <path d="M100 200 Q90 180 100 160 L105 200 Z" opacity="0.2" />
            <path d="M110 200 Q120 175 110 155 L105 200 Z" opacity="0.2" />
            <path d="M320 200 Q310 180 320 160 L325 200 Z" opacity="0.2" />
            <path d="M330 200 Q340 175 330 155 L325 200 Z" opacity="0.2" />
            
            {/* Sign post */}
            <rect x="350" y="120" width="8" height="80" rx="2" opacity="0.25" />
            <rect x="335" y="130" width="38" height="20" rx="3" opacity="0.25" />
            
            {/* Trees/mountains in background */}
            <path d="M50 140 L70 100 L90 140 Z" opacity="0.15" />
            <path d="M370 140 L390 100 L410 140 Z" opacity="0.15" />
          </g>
        </svg>
      </div>

      {/* Text */}
      <p className="text-base text-muted-foreground font-normal text-center max-w-md">
        {title}
      </p>
      
      {description && (
        <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
          {description}
        </p>
      )}
    </div>
  );
}

