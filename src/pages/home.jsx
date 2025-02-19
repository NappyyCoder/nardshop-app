import React from "react";
import { useCart } from "../context/cartcontext";

const Home = ({ regularProducts }) => {
    const { addToCart } = useCart(); // Access addToCart from context

    return (
        <div>
            {regularProducts.map((product) => (
                <div key={product.id}>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <p>${product.price}</p>
                    <button onClick={() => addToCart(product)}>Add to Cart</button>
                </div>
            ))}
        </div>
    );
};

export default Home;
