// AboutPage.jsx
import React from 'react';
import '../styles/aboutpage.css'; // Optional: Add CSS styling for the About page

const AboutPage = () => {
    return (
        <div className="about-page">
            <h1>About NardShop</h1>
            <p>
                Welcome to NardShop! We are a unique store offering a variety of specialty drinks,
                Italian ice, freeze pops, ready-to-drink (RTD) beverages, and loose tea.
                Our mission is to provide delicious, refreshing options for every customer,
                all made with high-quality ingredients.
            </p>
            <h2>Our Story</h2>
            <p>
                NardShop was founded with the goal of creating a fun, vibrant place where
                people can enjoy a variety of cool treats and drinks. Whether you're here for a
                refreshing Italian ice on a hot day or a creative, flavorful RTD beverage, our store
                is designed to make your experience as enjoyable as possible.
            </p>
            <h2>Our Values</h2>
            <ul>
                <li>Quality: We use only the best ingredients in all our products.</li>
                <li>Customer Happiness: Your satisfaction is our top priority.</li>
                <li>Innovation: We're always experimenting with new flavors and combinations.</li>
            </ul>
            <h2>Meet the Team</h2>
            <p>
                Our team is passionate about bringing great flavors and experiences to our customers.
                We're a family-run business, and we take pride in making everyone feel like a part of
                the NardShop family.
            </p>
        </div>
    );
};

export default AboutPage;
