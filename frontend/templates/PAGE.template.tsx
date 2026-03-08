/**
 * PAGE TEMPLATE (Next.js)
 * 
 * Emplacement: src/app/[feature]/page.tsx
 * 
 * Responsabilité:
 * - Point d'entrée pour une route
 * - Composer les composants
 * - Gérer la navigation
 * - Layout et structure générale
 * 
 * Dépendances: Composants, hooks
 * 
 * Règles:
 * ✓ 'use client' si hooks utilisés (React 19)
 * ✓ Pas de logique métier (utiliser hooks)
 * ✓ Peut être serveur si juste affichage
 * ✓ Types depuis domain
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useFeatures } from '@application/[feature]/use[Feature]';
import { FeatureList } from '@presentation/components/[feature]/FeatureList';
import { CreateFeatureModal } from '@presentation/components/[feature]/CreateFeatureModal';
import { MainLayout } from '@presentation/components/layout/MainLayout';
import styles from './page.module.css';

/**
 * Page: [Features]
 * 
 * URL: /[features]
 * 
 * État: Liste des features
 */
export default function FeaturesPage() {
  // ===== ROUTER =====
  const router = useRouter();
  const params = useParams<{ id?: string }>();

  // ===== STATE =====
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ===== HOOKS =====
  const { listFeatures, createFeature, deleteFeature, currentItem } =
    useFeatures();

  // ===== EFFECTS =====
  useEffect(() => {
    listFeatures();
  }, [listFeatures]);

  // ===== HANDLERS =====
  const handleSelectItem = (id: string) => {
    router.push(`/[features]/${id}`);
  };

  const handleCreateFeature = async (data: CreateFeatureRequest) => {
    try {
      await createFeature(data);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create feature:', error);
    }
  };

  const handleDeleteFeature = async (id: string) => {
    if (confirm('Are you sure?')) {
      await deleteFeature(id);
    }
  };

  // ===== RENDER =====
  return (
    <MainLayout>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <h1>[Features]</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className={styles.createBtn}
          >
            + Create
          </button>
        </div>

        {/* Main Content */}
        <div className={styles.content}>
          <FeatureList
            filterId={params?.id}
            onSelectItem={handleSelectItem}
          />
        </div>

        {/* Modals */}
        {isCreateModalOpen && (
          <CreateFeatureModal
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={handleCreateFeature}
          />
        )}
      </div>
    </MainLayout>
  );
}
