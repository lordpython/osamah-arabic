import React from 'react';

interface IconButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  label: string;
}

export function IconButton({ icon, onClick, className, label }: IconButtonProps) {
  const cn = (defaultClass: string, additionalClass?: string): string => {
    return additionalClass ? `${defaultClass} ${additionalClass}` : defaultClass;
  };

  return (
    <button 
      onClick={onClick}
      className={cn("p-2 rounded-full hover:bg-gray-100", className)}
      aria-label={label}
    >
      {icon}
    </button>
  );
} 