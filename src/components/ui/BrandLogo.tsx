import Image from 'next/image';

interface BrandLogoProps {
  name: string;
  logo?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-10 w-10 text-lg',
  md: 'h-16 w-16 text-xl',
  lg: 'h-20 w-20 text-2xl',
};

export function BrandLogo({ name, logo, size = 'md', className = '' }: BrandLogoProps) {
  if (logo) {
    return (
      <div className={`relative shrink-0 overflow-hidden rounded-full ${sizeClasses[size]} ${className}`}>
        <Image
          src={logo}
          alt={`Logo ${name}`}
          fill
          className="object-contain p-1"
          sizes="64px"
        />
      </div>
    );
  }

  // Fallback: initial letter
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand-50 font-bold text-brand-700 ${sizeClasses[size]} ${className}`}
      aria-label={name}
    >
      {name.charAt(0)}
    </div>
  );
}
