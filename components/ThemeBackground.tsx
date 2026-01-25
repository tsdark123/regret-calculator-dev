import React from 'react';
import { Theme } from '../types';
import { MatrixBackground } from './MatrixBackground';
import { OceanBackground } from './OceanBackground';
import { BackgroundTexture } from './BackgroundTexture';
import { NoiseFilter } from './NoiseFilter';

interface ThemeBackgroundProps {
  theme: Theme;
}

// Theme-aware background component for /calculate page
// Mobile only - desktop remains unchanged
export const ThemeBackground: React.FC<ThemeBackgroundProps> = ({ theme }) => {
  return (
    <>
      {/* SVG Noise Filter definitions (invisible, used by other components) */}
      <NoiseFilter />
      
      {/* Theme-specific background graphics */}
      {theme === 'green' && <MatrixBackground />}
      {theme === 'blue' && <OceanBackground />}
      
      {/* Global noise texture overlay for all themes */}
      <BackgroundTexture />
    </>
  );
};

export default ThemeBackground;
