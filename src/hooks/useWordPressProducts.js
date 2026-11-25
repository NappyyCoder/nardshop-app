import { useState, useEffect } from 'react';
import wordpressApi from '../services/wordpressApi';

export const useWordPressProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const fetchedProducts = await wordpressApi.getProducts();
                setProducts(fetchedProducts);
            } catch (err) {
                console.error('Failed to fetch products:', err);
                setError(err.message);
                // Fallback to empty array or cached data
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const refetch = async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedProducts = await wordpressApi.getProducts();
            setProducts(fetchedProducts);
        } catch (err) {
            console.error('Failed to refetch products:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Separate products into regular and limited time
    const regularProducts = products.filter(product => !product.isLimitedTime);
    const limitedTimeProducts = products.filter(product => product.isLimitedTime);

    return {
        products,
        regularProducts,
        limitedTimeProducts,
        loading,
        error,
        refetch
    };
};

export default useWordPressProducts;
