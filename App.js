import React, { useState } from 'react';
import EmailService from './EmailService'
import { MockEmailProviderA, MockEmailProviderB } from './MockEmail';

function App() {
    const emailService = new EmailService(new MockEmailProviderA(), new MockEmailProviderB());
    const [email, setEmail] = useState({ id: '', to: '', subject: '', body: '' });

    const handleChange = (e) => {
        setEmail({
            ...email,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const status = await emailService.sendEmail(email);
        alert(`Email status: ${status}`);
    };

    return (
        <div className="App">
            <h1>Send Email</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="id">Email ID:</label>
                    <input type="text" id="id" name="id" value={email.id} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="to">To:</label>
                    <input type="email" id="to" name="to" value={email.to} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="subject">Subject:</label>
                    <input type="text" id="subject" name="subject" value={email.subject} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="body">Body:</label>
                    <textarea id="body" name="body" value={email.body} onChange={handleChange} required />
                </div>
                <button type="submit">Send Email</button>
            </form>
        </div>
    );
}

export default App;
