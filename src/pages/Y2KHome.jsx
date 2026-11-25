import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import HomeDropTimeline from "../components/HomeDropTimeline";
import "../styles/spring-animations.css";
import "../styles/spring-particles.css";
import "../styles/world-particles.css";
import "../styles/y2k-effects.css";
import "../styles/y2k-home.css";
import "../styles/productgallery.css";
import "../styles/timeline-story.css";

const Y2KHome = ({ regularProducts }) => {
    const heroRef = useRef(null);
    const [particles, setParticles] = useState([]);

    // Generate spring particles (petals & orbs)
    useEffect(() => {
        const generateParticles = () => {
            const types = ['petal', 'orb'];
            const sizes = ['tiny', 'small', 'medium', 'large'];
            const newParticles = Array.from({ length: 10 }, (_, i) => ({
                id: i,
                type: types[Math.floor(Math.random() * types.length)],
                size: sizes[Math.floor(Math.random() * sizes.length)],
                left: `${8 + (i * 9.5)}%`
            }));
            setParticles(newParticles);
        };

        generateParticles();
    }, []);

    // Spring-inspired animation variants
    const springTransition = {
        type: "spring",
        stiffness: 100,
        damping: 15,
        mass: 0.5
    };

    const gentleTransition = {
        type: "spring",
        stiffness: 120,
        damping: 18
    };

    return (
        <div className="y2k-home">
            {/* HERO SECTION - Clean & Focused with Spring Particles */}
            <section
                ref={heroRef}
                className="hero-section-y2k"
            >
                {/* Floating Spring Particles */}
                <div className="particle-container">
                    {particles.map((particle) => (
                        <div
                            key={particle.id}
                            id={`particle-${particle.id}`}
                            className={`spring-particle ${particle.type} ${particle.size}`}
                            style={{ left: particle.left }}
                        />
                    ))}
                </div>

                <div className="hero-content">
                    {/* Main Title with Chrome Effect & Spring Breath */}
                    <motion.div
                        className="hero-title-wrapper"
                        initial={{ opacity: 0, y: 20, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={springTransition}
                    >
                        <h1
                            className="hero-title-y2k chrome-text spring-effect"
                        >
                            NARD
                        </h1>
                    </motion.div>

                    {/* Subtitle */}
                    <motion.p
                        className="hero-subtitle-y2k"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...gentleTransition, delay: 0.15 }}
                    >
                        TWIN SOULS · ONE VISION
                    </motion.p>

                    {/* Tagline */}
                    <motion.p
                        className="hero-tagline"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ ...gentleTransition, delay: 0.3 }}
                    >
                        WHERE IDENTITY MEETS REBELLION · EST. 2024
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        className="hero-cta-y2k"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...springTransition, delay: 0.45 }}
                    >
                        <Link to="/limited-time-collection">
                            <button className="cta-button-y2k spring-button">
                                <span className="button-text">ENTER THE VOID</span>
                            </button>
                        </Link>

                        <Link to="/about">
                            <button className="cta-button-y2k-outline spring-button">
                                <span className="button-text">THE ORIGIN</span>
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* FEATURED PRODUCTS - Timeline Story */}
            <section className="featured-section-y2k timeline-section">
                <motion.div
                    className="section-header-y2k"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="section-title-y2k chrome-text">
                        THE JOURNEY
                    </h2>
                    <p className="section-subtitle-y2k">
                        EVERY PIECE TELLS A CHAPTER · FOLLOW THE STORY
                    </p>
                </motion.div>

                {/* New editorial 100vw timeline / lookbook layout */}
                <HomeDropTimeline
                    drops={regularProducts.slice(0, 8).map((product, index) => ({
                        id: product.id,
                        name: product.name,
                        year: product.year ?? 2024,
                        collection: product.collection ?? "NARD ARCHIVE",
                        story: product.story ?? product.description,
                        image: product.image,
                        images: product.images,
                        details: product.details ?? [
                            `Drop ${String(index + 1).padStart(2, '0')}`,
                            product.price ? `$${product.price}` : null,
                        ].filter(Boolean)
                    }))}
                />

                {/* View All CTA */}
                <motion.div
                    className="section-footer-y2k"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <Link to="/limited-time-collection">
                        <button className="view-all-btn-y2k">
                            CONTINUE THE STORY →
                        </button>
                    </Link>
                </motion.div>
            </section>

            {/* BRAND STATEMENT - Clean & Direct */}
            <section className="brand-section-y2k">
                <motion.div
                    className="brand-content-y2k"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="brand-title-y2k chrome-text">
                        NOT A BRAND.
                        <br />
                        A MOVEMENT.
                    </h2>

                    <p className="brand-description-y2k">
                        Born from two minds, one vision. We create at the intersection of chaos and clarity, 
                        where the raw meets the refined. This is more than clothing—it's a reflection of who you are when no one's watching.
                    </p>

                    <Link to="/about">
                        <button className="brand-cta-y2k">
                            DISCOVER NARD
                        </button>
                    </Link>
                </motion.div>
            </section>
        </div>
    );
};

export default Y2KHome;

