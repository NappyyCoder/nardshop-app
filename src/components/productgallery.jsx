import React from 'react';
import '../styles/productgallery.css';

const ProductGallery = ({ products }) => {
    return (
        <div className="product-gallery">
            {products.map((product) => (
                <div key={product.id} className="product-card">
                    <img src={product.image} alt={product.name} className="product-image" />
                    <div className="product-info">
                        <h3 className="product-name">{product.name}</h3>
                        <p className="product-description">{product.description}</p>
                        <span className="product-price">${product.price}</span>
                        <button className="add-to-cart-btn">Add to Cart</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductGallery;
