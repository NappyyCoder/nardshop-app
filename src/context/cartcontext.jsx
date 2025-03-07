import React, { createContext, useState, useContext } from "react";

export const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const addToCart = (product) => {
        setCart(prevCart => {
            const existingItemIndex = prevCart.findIndex(
                item => item.id === product.id && item.selectedSize === product.selectedSize
            );

            if (existingItemIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity += 1;
                return newCart;
            }

            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    return (
        <CartContext.Provider value={{ cart, addToCart }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartProvider;
