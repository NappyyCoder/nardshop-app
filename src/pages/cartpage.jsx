import React from "react";
import { useCart } from "../context/cartcontext";
const CartPage = () => {
    const { cartItems } = useCart();

    return (
        <div>
            <h1>Your Cart</h1>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                cartItems.map((item) => (
                    <div key={item.id}>
                        <h3>{item.name}</h3>
                        <p>Price: ${item.price}</p>
                        <p>Quantity: {item.quantity}</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default CartPage;
