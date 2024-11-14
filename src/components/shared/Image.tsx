import NextImage from 'next/image';

interface ImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

export function Image({ src, alt, priority = false, className, width, height }: ImageProps) {
  return (
    <NextImage
      src={src}
      alt={alt}
      priority={priority}
      className={className}
      width={width}
      height={height}
    />
  );
} 