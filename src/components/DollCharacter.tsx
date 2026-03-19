import React from 'react';
import SkiaCharacter from './SkiaCharacter';
// import LottieDollCharacter from './LottieDollCharacter';

interface DollCharacterProps {
  scale?: number;
}

const DollCharacter: React.FC<DollCharacterProps> = ({ scale = 1 }) => {
  // return <LottieDollCharacter scale={scale} />;
  return <SkiaCharacter />;
};

export default DollCharacter;
