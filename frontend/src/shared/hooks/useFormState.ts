/**
 * HOOK: useFormState
 * Gestion unifiée de l'état des formulaires avec useReducer
 * 
 * Réutilisable pour tous les formulaires d'authentification
 */

import { useReducer, useCallback } from 'react';

interface FormState<T = Record<string, string>> {
  fields: T;
  error: string | null;
  isLoading: boolean;
}

type FormAction<T = Record<string, string>> =
  | { type: 'SET_FIELD'; field: keyof T; value: string }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'RESET'; initialFields: T };

function createFormReducer<T = Record<string, string>>() {
  return function formReducer(state: FormState<T>, action: FormAction<T>): FormState<T> {
    switch (action.type) {
      case 'SET_FIELD':
        return {
          ...state,
          fields: {
            ...state.fields,
            [action.field]: action.value,
          },
        };
      
      case 'SET_ERROR':
        return { ...state, error: action.error };
      
      case 'SET_LOADING':
        return { ...state, isLoading: action.isLoading };
      
      case 'RESET':
        return {
          fields: action.initialFields,
          error: null,
          isLoading: false,
        };
      
      default:
        return state;
    }
  };
}

interface UseFormStateReturn<T = Record<string, string>> {
  fields: T;
  error: string | null;
  isLoading: boolean;
  setField: (field: keyof T, value: string) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

export function useFormState<T extends Record<string, string>>(
  initialFields: T
): UseFormStateReturn<T> {
  const formReducer = createFormReducer<T>();
  const [state, dispatch] = useReducer(formReducer, {
    fields: initialFields,
    error: null,
    isLoading: false,
  });

  const setField = useCallback((field: keyof T, value: string) => {
    dispatch({ type: 'SET_FIELD', field, value });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', error });
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: 'SET_LOADING', isLoading });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET', initialFields });
  }, [initialFields]);

  return {
    fields: state.fields,
    error: state.error,
    isLoading: state.isLoading,
    setField,
    setError,
    setLoading,
    reset,
  };
}
