import React from 'react';
import { Zap } from 'lucide-react';
import { Switch } from './ui/switch';

/**
 * Reusable Premium Mode toggle card used across all AI tool pages.
 */
const EmergentModeCard = ({ emergentMode, onToggle, testId }) => (
  <div className="flex items-center justify-between glass-effect rounded-lg p-4 border border-white/10">
    <div className="flex items-center space-x-3">
      <Zap className="w-5 h-5 text-amber-400" />
      <div>
        <div className="text-white font-medium">Premium Mode</div>
        <div className="text-sm text-slate-400">Priority processing (+30% credits)</div>
      </div>
    </div>
    <Switch checked={emergentMode} onCheckedChange={onToggle} data-testid={testId} />
  </div>
);

export default EmergentModeCard;
