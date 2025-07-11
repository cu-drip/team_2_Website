import { useContext } from 'react';
import { CustomNavigateContext } from './CustomNavigateProvider';

export function useCustomNavigate() {
  return useContext(CustomNavigateContext);
} 