import React, { useState } from 'react';
import '../styles/productgallery.css';

const ProductImageGallery = ({ product, className = '' }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Use gallery images from WordPress, fallback to main image
    const images = product.images && product.images.length > 0
        ? product.images
        : [product.image];

    const handlePrevImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex(prev =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    const handleNextImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex(prev =>
            prev === images.length - 1 ? 0 : prev + 1
        );
    };

    const handleThumbnailClick = (e, index) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex(index);
    };

    return (
        <div className={`product-image-gallery ${className}`}>
            {/* Main Image */}
            <img
                src={images[currentImageIndex]}
                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                className="product-image"
            />

            {/* Gallery Controls - Only show if multiple images */}
            {images.length > 1 && (
                <>
                    {/* Navigation Arrows */}
                    <button
                        className="gallery-nav gallery-nav-prev"
                        onClick={handlePrevImage}
                        aria-label="Previous image"
                    >
                        ‹
                    </button>
                    <button
                        className="gallery-nav gallery-nav-next"
                        onClick={handleNextImage}
                        aria-label="Next image"
                    >
                        ›
                    </button>

                    {/* Thumbnail Gallery - Shows on hover */}
                    <div className="gallery-thumbnails">
                        {images.map((img, index) => (
                            <button
                                key={index}
                                className={`gallery-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                onClick={(e) => handleThumbnailClick(e, index)}
                                aria-label={`View image ${index + 1}`}
                            >
                                <img src={img} alt={`Thumbnail ${index + 1}`} />
                            </button>
                        ))}
                    </div>

                    {/* Image Counter */}
                    <div className="gallery-counter">
                        {currentImageIndex + 1} / {images.length}
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductImageGallery;
