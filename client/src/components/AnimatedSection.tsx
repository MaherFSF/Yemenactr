import { ReactNode } from 'react';
import { useScrollAnimation, animationVariants, AnimationVariant } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface AnimatedSectionProps {
  children: ReactNode;
  animation?: AnimationVariant;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
}

export function AnimatedSection({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration = 600,
  className = '',
  threshold = 0.1,
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold });
  const variant = animationVariants[animation];

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all',
        isVisible ? variant.visible : variant.hidden,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </div>
  );
}

// Staggered children animation wrapper
interface StaggeredContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggeredContainer({
  children,
  staggerDelay = 100,
  className = '',
}: StaggeredContainerProps) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div
              key={index}
              className={cn(
                'transition-all duration-500',
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              )}
              style={{
                transitionDelay: isVisible ? `${index * staggerDelay}ms` : '0ms',
              }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}

export default AnimatedSection;
