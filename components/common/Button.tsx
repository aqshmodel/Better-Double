import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, ...props }) => {
  const baseClasses = "px-6 py-2 rounded-full font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";
  
  const variantClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600 focus:ring-primary-500 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-500 text-white',
    danger: 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-500 text-white',
    outline: 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 focus:ring-primary-500',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};