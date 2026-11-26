import React from 'react';
import {
  Tag,
  Waves,
  Flame,
  Zap,
  Crown,
  Sparkles,
  Sprout,
  Hand,
  Drama,
  Shield,
  Mic,
  Trophy
} from 'lucide-react';
import { NameTagIconId, PlayerClassIconId } from '../data/customizationCatalog';

export const NameTagIcon: React.FC<{
  iconId: NameTagIconId;
  className?: string;
}> = ({ iconId, className = 'w-4 h-4' }) => {
  switch (iconId) {
    case 'waves':
      return <Waves className={className} />;
    case 'flame':
      return <Flame className={className} />;
    case 'zap':
      return <Zap className={className} />;
    case 'crown':
      return <Crown className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'tag':
    default:
      return <Tag className={className} />;
  }
};

export const PlayerClassIcon: React.FC<{
  iconId: PlayerClassIconId;
  className?: string;
}> = ({ iconId, className = 'w-3.5 h-3.5' }) => {
  switch (iconId) {
    case 'hand':
      return <Hand className={className} />;
    case 'drama':
      return <Drama className={className} />;
    case 'shield':
      return <Shield className={className} />;
    case 'mic':
      return <Mic className={className} />;
    case 'trophy':
      return <Trophy className={className} />;
    case 'sprout':
    default:
      return <Sprout className={className} />;
  }
};
