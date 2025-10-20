import React from 'react';

interface HeaderProps {
  appTitle: string;
  viewTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ appTitle, viewTitle }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <span className="text-xl font-bold text-primary-600">{appTitle}</span>
        <h1 className="text-lg font-semibold text-gray-700">{viewTitle}</h1>
      </div>
    </header>
  );
};