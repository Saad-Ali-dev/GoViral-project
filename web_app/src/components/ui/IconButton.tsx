import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export default function IconButton({ children, className, ...props }: IconButtonProps) {
  return (
    <button
      className={`flex items-center justify-center p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}