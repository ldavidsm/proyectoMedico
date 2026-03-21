'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { User, ImageOff } from 'lucide-react';

interface ImageWithFallbackProps extends ImageProps {
  fallbackType?: 'user' | 'course' | 'generic';
  courseTitle?: string;
  defaultBannerUrl?: string;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackType = 'generic',
  courseTitle,
  defaultBannerUrl,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [defaultError, setDefaultError] = useState(false);

  useEffect(() => {
    setError(false);
    setDefaultError(false);
  }, [src]);

  // If primary image fails but there's a default banner, use it
  if ((error || !src) && defaultBannerUrl && !defaultError) {
    return (
      <Image
        {...props}
        src={defaultBannerUrl}
        alt={alt}
        width={props.width || 800}
        height={props.height || 450}
        onError={() => setDefaultError(true)}
        className={props.className}
      />
    );
  }

  // Final fallback for courses: gradient with title
  if ((error || !src) && fallbackType === 'course') {
    return (
      <div
        className={`flex items-end bg-gradient-to-br from-teal-500 to-teal-700 ${props.className}`}
        style={{ width: props.width, height: props.height }}
      >
        {courseTitle && (
          <p className="text-white font-semibold text-sm p-3 line-clamp-2 drop-shadow-sm w-full bg-gradient-to-t from-black/40 to-transparent">
            {courseTitle}
          </p>
        )}
      </div>
    );
  }

  // Generic fallback
  if (error || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-muted text-muted-foreground border border-border ${props.className}`}
        style={{ width: props.width, height: props.height }}
      >
        {fallbackType === 'user' ? (
          <User className="w-1/2 h-1/2 opacity-50" />
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
      width={props.width || 800}
      height={props.height || 450}
      onError={() => setError(true)}
    />
  );
}
