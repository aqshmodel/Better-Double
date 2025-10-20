import React from 'react';
import type { View } from '../App';
import { HomeIcon } from './icons/HomeIcon';
import { GoalIcon } from './icons/GoalIcon';
import { AngerIcon } from './icons/AngerIcon';
import { PlannerIcon } from './icons/PlannerIcon';
import { SettingsIcon } from './icons/SettingsIcon';

interface BottomNavProps {
  currentView: View;
  setView: (view: View) => void;
}

const navItems: { view: View; label: string; icon: React.FC<{className?: string}> }[] = [
  { view: 'dashboard', label: 'ホーム', icon: HomeIcon },
  { view: 'goals', label: '目標', icon: GoalIcon },
  { view: 'anger', label: '気持ち', icon: AngerIcon },
  { view: 'planner', label: '計画', icon: PlannerIcon },
  { view: 'settings', label: '設定', icon: SettingsIcon },
];

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-t-md border-t border-gray-200">
      <div className="max-w-4xl mx-auto flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`flex flex-col items-center justify-center w-full pt-3 text-sm transition-colors duration-200 ${
              currentView === item.view ? 'text-primary-500' : 'text-gray-500 hover:text-primary-500'
            }`}
            style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
          >
            <item.icon className="h-6 w-6 mb-1" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};