import React from 'react';

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
};

/**
 * A container component for page content that handles scrolling behavior
 * @param children - The page content
 * @param className - Additional CSS classes
 * @param scrollable - Whether the container should be scrollable (default: true)
 */
export default function PageContainer({ 
  children, 
  className = "", 
  scrollable = true 
}: PageContainerProps) {
  return (
    <div 
      className={`w-full h-full ${scrollable ? 'page-container' : 'fixed-container'} ${className}`}
    >
      {children}
    </div>
  );
} 