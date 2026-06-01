import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  value: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onValueChange) {
        onValueChange([parseFloat(e.target.value)]);
      }
    };

    const currentValue = value[0] ?? min;

    // Calculate percentage for filled track styling
    const percent = ((currentValue - min) / (max - min)) * 100;

    return (
      <div className="relative flex w-full touch-none select-none items-center py-2">
        <div className="relative w-full">
          <input
            type="range"
            ref={ref}
            min={min}
            max={max}
            step={step}
            value={currentValue}
            onChange={handleChange}
            className={cn(
              'w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-400 accent-emerald-500',
              className
            )}
            style={{
              background: `linear-gradient(to right, rgb(16, 185, 129) ${percent}%, rgb(39, 39, 42) ${percent}%)`,
            }}
            {...props}
          />
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };
