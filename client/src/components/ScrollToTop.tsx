import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ScrollToTopProps {
  showAfter?: number;
  className?: string;
}

export function ScrollToTop({ showAfter = 400, className = '' }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > showAfter);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showAfter]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Button
      onClick={scrollToTop}
      className={cn(
        'fixed bottom-6 right-6 z-50 rounded-full w-12 h-12 p-0',
        'bg-[#107040] hover:bg-[#0D5A34] text-white shadow-lg',
        'transition-all duration-300 transform',
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4 pointer-events-none',
        className
      )}
      aria-label="Scroll to top"
    >
      <ChevronUp className="h-6 w-6" />
    </Button>
  );
}

export default ScrollToTop;
