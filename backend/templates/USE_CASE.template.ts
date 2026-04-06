/**
 * =====================================================
 * TEMPLATE: Use Case
 * =====================================================
 * 
 * Copie ce fichier et remplace XXX par ton use case
 * 
 * Règles:
 *  Une responsabilité = un use case
 *  Reçoit un Request DTO, retourne un Response DTO
 *  Utilise les repositories pour accéder aux données
 *  Utilise les entités métier pour la logique
 *  Lance les erreurs métier (domain errors)
 */

import { IXXXRepository } from '@domain/xxx/repositories/IXXXRepository';
import { XXX } from '@domain/xxx/entities/XXX';
import { CreateXXXRequest } from '../dtos/CreateXXXRequest';
import { XXXResponseDTO } from '../dtos/XXXResponseDTO';
import { BaseUseCase } from '@application/shared/BaseUseCase';

/**
 * Use Case: Créer un nouveau XXX
 * 
 * Responsabilité: Orchestrer la création d'un XXX
 * 1. Valider les données d'entrée
 * 2. Vérifier les règles métier (pas de duplicatas, etc)
 * 3. Créer l'entité métier
 * 4. Persister via le repository
 * 5. Retourner la réponse
 * 
 * @example
 * const useCase = new CreateXXXUseCase(repository);
 * const result = await useCase.execute({ ... });
 */
export class CreateXXXUseCase extends BaseUseCase<CreateXXXRequest, XXXResponseDTO> {
  constructor(private xxxRepository: IXXXRepository) {
    super();
  }

  /**
   * Exécute le use case
   */
  async execute(request: CreateXXXRequest): Promise<XXXResponseDTO> {
    // 1. Valider les données d'entrée
    this.logger.info('Starting CreateXXXUseCase', { request });
    this.validateRequest(request);

    // 2. Vérifier les règles métier
    const existing = await this.xxxRepository.findById(request.id);
    if (existing) {
      throw new XXXAlreadyExistsError('XXX already exists');
    }

    // 3. Créer l'entité métier
    const newEntity = new XXX(
      request.id,
      new Date(),
      new Date(),
      // ... autres propriétés
    );

    // 4. Persister
    const savedEntity = await this.xxxRepository.create(newEntity);
    this.logger.info('XXX created successfully', { id: savedEntity.id });

    // 5. Retourner la réponse
    return this.mapToDTO(savedEntity);
  }

  /**
   * Valide les données d'entrée
   */
  private validateRequest(request: CreateXXXRequest): void {
    if (!request.id) {
      throw new ValidationError('ID is required');
    }
    // Ajoute tes validations métier
  }

  /**
   * Mappe l'entité vers le DTO de réponse
   */
  private mapToDTO(entity: XXX): XXXResponseDTO {
    return {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      // ... autres champs pour le client
    };
  }
}
