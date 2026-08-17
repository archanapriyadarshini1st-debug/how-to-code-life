import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useMagnetic } from '../../lib/hooks';

type Variant = 'primary' | 'ghost' | 'ember';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  magnetic?: boolean;
  children: ReactNode;
}

/**
 * NOTE: variant classes are looked up from a static map, never built
 * as `btn-${variant}`. Tailwind scans source as plain text, so an
 * interpolated class name is never emitted into the stylesheet.
 */
const variants: Record<Variant, string> = {
  primary: 'btn-primary',
  ghost: 'btn-ghost',
  ember: 'btn-ember',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2.5 text-[0.68rem]',
  md: 'px-6 py-3.5 text-label',
  lg: 'px-8 py-4 text-[0.8rem]',
};

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', magnetic = true, className = '', children, ...rest },
  ref,
) {
  const mag = useMagnetic<HTMLSpanElement>(magnetic ? 0.3 : 0);

  return (
    <span ref={mag} className="inline-block will-change-transform">
      <button
        ref={ref}
        className={`btn ${variants[variant]} ${sizes[size]} group ${className}`}
        data-cursor="link"
        {...rest}
      >
        <span className="relative z-10 flex items-center gap-2.5">{children}</span>
      </button>
    </span>
  );
});

export default Button;
