/**
 * SEARCH BAR COMPONENT
 * Barre de recherche générique
 */

'use client';

import { memo } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const SearchBarComponent = ({
  value,
  onChange,
  placeholder,
}: SearchBarProps): React.ReactElement => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 pl-9 bg-secondary text-white text-sm rounded focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <svg 
        className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M21.707 20.293L16.314 14.9C17.403 13.504 18 11.799 18 10C18 7.863 17.167 5.854 15.656 4.344C14.146 2.832 12.137 2 10 2C7.863 2 5.854 2.832 4.344 4.344C2.833 5.854 2 7.863 2 10C2 12.137 2.833 14.146 4.344 15.656C5.854 17.168 7.863 18 10 18C11.799 18 13.504 17.404 14.9 16.314L20.293 21.706L21.707 20.293ZM10 16C8.397 16 6.891 15.376 5.758 14.243C4.624 13.11 4 11.603 4 10C4 8.397 4.624 6.891 5.758 5.758C6.891 4.624 8.397 4 10 4C11.603 4 13.109 4.624 14.242 5.758C15.376 6.891 16 8.397 16 10C16 11.603 15.376 13.11 14.242 14.243C13.109 15.376 11.603 16 10 16Z" />
      </svg>
    </div>
  );
};

export const SearchBar = memo(SearchBarComponent);