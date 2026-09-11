import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface Props {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  activeColor?: string;
  name?: string;
}

const sizes = {
  sm: { icon: 'w-4 h-4', btn: 'p-0.5' },
  md: { icon: 'w-6 h-6', btn: 'p-1' },
  lg: { icon: 'w-8 h-8 sm:w-9 sm:h-9', btn: 'p-1.5' },
};

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  activeColor = 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]',
  name = 'Rating',
}: Props) {
  const [hover, setHover] = useState(0);
  const current = hover || value;
  const config = sizes[size] || sizes.md;

  return (
    <div
      role={readonly ? 'img' : 'radiogroup'}
      aria-label={`${name}: ${value} out of 5 stars`}
      className="inline-flex items-center gap-1 sm:gap-1.5"
    >
      {[1, 2, 3, 4, 5].map(star => {
        const isFilled = star <= current;
        return (
          <button
            key={star}
            type="button"
            role={readonly ? undefined : 'radio'}
            aria-checked={readonly ? undefined : value === star}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            disabled={readonly}
            className={`${config.btn} rounded-lg transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              readonly
                ? 'cursor-default'
                : 'cursor-pointer active:scale-90 hover:scale-110'
            }`}
          >
            <Star
              className={`${config.icon} transition-all duration-200 ${
                isFilled
                  ? activeColor
                  : 'fill-transparent text-indigo-400/40 stroke-[1.75]'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
