import React from 'react';

// SVG Noise Filter Component using feTurbulence
// More performant than heavy NPM libraries, higher quality output
export const NoiseFilter: React.FC = () => {
  return (
    <svg className="fixed w-0 h-0" aria-hidden="true">
      <defs>
        {/* High-frequency digital grain filter */}
        <filter id="digitalGrain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            seed="15"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            type="saturate"
            values="0"
            in="noise"
            result="monoNoise"
          />
          <feBlend
            in="SourceGraphic"
            in2="monoNoise"
            mode="multiply"
            result="blend"
          />
        </filter>

        {/* Water caustic noise filter for Ocean theme */}
        <filter id="causticNoise" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.02"
            numOctaves="3"
            seed="5"
            result="turbulence"
          >
            <animate
              attributeName="baseFrequency"
              dur="30s"
              values="0.02;0.03;0.02"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale="8"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Soft overlay noise for global texture */}
        <filter id="overlayNoise" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            seed="42"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 0.03 0"
            in="noise"
            result="coloredNoise"
          />
        </filter>
      </defs>
    </svg>
  );
};

export default NoiseFilter;
