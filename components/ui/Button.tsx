
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  ...props
}) => {
  const baseStyles = "font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out inline-flex items-center justify-center";
  
  const variantStyles = {
    primary: 'bg-brand-primary text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-sky-300 disabled:text-sky-600',
    secondary: 'bg-brand-secondary text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-sky-300 disabled:text-sky-600',
    danger: 'bg-brand-danger text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-sky-300 disabled:text-sky-600',
    outline: 'border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white focus:ring-blue-500 disabled:border-sky-400 disabled:text-sky-500',
    ghost: 'text-brand-primary hover:bg-blue-100 focus:ring-blue-500 disabled:text-sky-400',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {icon && !isLoading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;