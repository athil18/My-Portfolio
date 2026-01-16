import React, { useState, useEffect, useRef } from 'react';

interface ResponsiveImageProps {
    src: string;
    sizes?: {
        thumbnail?: string;
        medium?: string;
        large?: string;
    };
    alt: string;
    className?: string;
    lazy?: boolean;
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
    src,
    sizes,
    alt,
    className = '',
    lazy = true,
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(!lazy);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!lazy || !imgRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '50px' }
        );

        observer.observe(imgRef.current);

        return () => observer.disconnect();
    }, [lazy]);

    const buildSrcSet = (): string | undefined => {
        if (!sizes) return undefined;

        const srcSetArray: string[] = [];

        if (sizes.thumbnail) srcSetArray.push(`${sizes.thumbnail} 200w`);
        if (sizes.medium) srcSetArray.push(`${sizes.medium} 800w`);
        if (sizes.large) srcSetArray.push(`${sizes.large} 1200w`);

        return srcSetArray.length > 0 ? srcSetArray.join(', ') : undefined;
    };

    return (
        <div className={`responsive-image-wrapper ${className}`} ref={imgRef}>
            {isInView && (
                <>
                    {/* Blur placeholder while loading */}
                    {!isLoaded && (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-pink-200 animate-pulse rounded" />
                    )}

                    <img
                        src={sizes?.large || src}
                        srcSet={buildSrcSet()}
                        sizes="(max-width: 640px) 200px, (max-width: 1024px) 800px, 1200px"
                        alt={alt}
                        onLoad={() => setIsLoaded(true)}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                        loading={lazy ? 'lazy' : 'eager'}
                    />
                </>
            )}
        </div>
    );
};

export default ResponsiveImage;
