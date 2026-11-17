import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

/**
 * Reusable Button component that accepts as={Link} or native <button> / <a>.
 * Supports Lumos primary color (#31747d) and secondary light/dark variants.
 */
export const LumosButton = ({
  as: Component = 'button',
  to,
  href,
  onClick,
  children,
  variant = 'primary', // 'primary' | 'white' | 'dark' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  disabled = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-sans font-medium transition-all select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2f767f] focus-visible:ring-offset-2';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-2 rounded-full gap-1.5',
    md: 'text-sm px-5 py-3 rounded-full gap-2',
    lg: 'text-base px-7 py-3.5 rounded-full gap-2.5'
  };

  const variantStyles = {
    primary: 'bg-[#2f767f] hover:bg-[#255f67] text-white shadow-[0_8px_24px_-6px_rgba(47,118,127,0.45)] hover:shadow-[0_12px_28px_-6px_rgba(47,118,127,0.55)] active:scale-[0.98]',
    white: 'bg-white hover:bg-gray-50 text-[#1b1d26] border border-gray-200/80 shadow-[0_4px_16px_-4px_rgba(20,25,35,0.08)] active:scale-[0.98]',
    dark: 'bg-[#1b1d26] hover:bg-[#252834] text-white shadow-[0_6px_20px_-4px_rgba(10,12,18,0.3)] active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-black/5 text-[#1b1d26]'
  };

  const combinedClasses = clsx(
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
    className
  );

  if (to) {
    return (
      <Link to={to} className={combinedClasses} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedClasses} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Component onClick={onClick} disabled={disabled} className={combinedClasses} {...props}>
      {children}
    </Component>
  );
};

export default LumosButton;
