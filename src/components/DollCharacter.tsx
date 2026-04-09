import React from 'react';
import SkiaCharacter from './SkiaCharacter';
// import Demo from './Demo';
// import LottieDollCharacter from './LottieDollCharacter';

interface DollCharacterProps {
  config?: any;
  selectedOutfits?: Record<string, string>;
}

const DollCharacter: React.FC<DollCharacterProps> = ({ config, selectedOutfits }) => {
  // return <LottieDollCharacter scale={scale} />;
  return <SkiaCharacter config={config} selectedOutfits={selectedOutfits} />;
  // return <Demo />;
};

export default DollCharacter;
