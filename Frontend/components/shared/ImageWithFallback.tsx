'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { User, ImageOff } from 'lucide-react'; 

interface ImageWithFallbackProps extends ImageProps {
  fallbackType?: 'user' | 'course' | 'generic';
}

export function ImageWithFallback({
  src,
  alt,
  fallbackType = 'generic',
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (error || !src) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted text-muted-foreground border border-border ${props.className}`}
        style={{ width: props.width, height: props.height }}
      >
        {fallbackType === 'user' ? (
          <User className="w-1/2 h-1/2 opacity-45" />
        ) : (
          <ImageOff className="w-1/2 h-1/2 opacity-50" />
        )}
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      onError={() => setError(true)}
    />
  );
}
