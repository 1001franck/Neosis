/**
 * COMPONENT TEMPLATE
 * 
 * Emplacement: src/presentation/components/[feature]/[FeatureName].tsx
 * 
 * Responsabilité:
 * - Afficher l'UI
 * - Gérer les interactions utilisateur
 * - Utiliser des hooks (useFeatures, useState)
 * - AUCUNE logique métier ici
 * 
 * Dépendances: Hooks, common components
 * 
 * Règles:
 * ✓ Composants fonctionnels uniquement
 * ✓ Props typées (interface)
 * ✓ Pas de logique métier
 * ✓ Composants réutilisables
 * ✓ Pas d'effets secondaires (sauf useEffect)
 * ✓ 200 lignes max (sinon split)
 */

import React, { useEffect } from 'react';
import { useFeatures } from '@application/[feature]/use[Feature]';
import { FeatureItem } from './FeatureItem';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import styles from './FeatureList.module.css';

/**
 * Props du composant
 */
interface FeatureListProps {
  /**
   * ID optionnel pour filtrer
   */
  filterId?: string;

  /**
   * Callback quand un item est sélectionné
   */
  onSelectItem?: (id: string) => void;

  /**
   * Nombre d'items par page
   */
  pageSize?: number;
}

/**
 * Liste des [features]
 * 
 * @example
 * <FeatureList onSelectItem={(id) => navigate(`/feature/${id}`)} />
 */
export const FeatureList: React.FC<FeatureListProps> = ({
  filterId,
  onSelectItem,
  pageSize = 20,
}) => {
  // ===== HOOKS =====
  const { items, isLoading, error, listFeatures } = useFeatures();

  // ===== EFFECTS =====
  useEffect(() => {
    listFeatures({ limit: pageSize });
  }, [pageSize, listFeatures]);

  // ===== FILTERS =====
  const filteredItems = filterId
    ? items.filter((item) => item.id === filterId)
    : items;

  // ===== RENDER =====
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className={styles.container}>
      {filteredItems.length === 0 ? (
        <div className={styles.empty}>No features found</div>
      ) : (
        <ul className={styles.list}>
          {filteredItems.map((item) => (
            <li key={item.id}>
              <FeatureItem
                item={item}
                onSelect={() => onSelectItem?.(item.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ===== PROPTYPES (optional) =====
// import PropTypes from 'prop-types';
// FeatureList.propTypes = {
//   filterId: PropTypes.string,
//   onSelectItem: PropTypes.func,
//   pageSize: PropTypes.number,
// };
