import React, { useState } from 'react';
import '../styles/contact.css';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitStatus, setSubmitStatus] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically handle form submission to a backend
        setSubmitStatus('success');
        // Reset form
        setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
        });
        // Clear success message after 3 seconds
        setTimeout(() => setSubmitStatus(''), 3000);
    };

    return (
        <div className="contact-page">
            <div className="contact-container">
                <h1>Contact Us</h1>
                <p className="contact-intro">
                    Have a question or feedback? We'd love to hear from you. Fill out the form below
                    and we'll get back to you as soon as possible.
                </p>

                <div className="contact-info">
                    <div className="info-item">
                        <h3>📍 Address</h3>
                        <p>123 Fashion Street<br />New York, NY 10001</p>
                    </div>
                    <div className="info-item">
                        <h3>📞 Phone</h3>
                        <p>(555) 123-4567</p>
                    </div>
                    <div className="info-item">
                        <h3>✉️ Email</h3>
                        <p>support@nardshop.com</p>
                    </div>
                </div>

                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="subject">Subject</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="message">Message</label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            required
                            rows="5"
                        ></textarea>
                    </div>

                    <button type="submit" className="submit-btn">
                        Send Message
                    </button>

                    {submitStatus === 'success' && (
                        <div className="success-message">
                            Thank you for your message! We'll get back to you soon.
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ContactPage;