import React from 'react';

class EmailService {
    constructor(providerA, providerB) {
        this.providers = [providerA, providerB];
        this.currentProviderIndex = 0;
        this.sentEmails = new Map(); // Tracks email status for idempotency
        this.rateLimit = 5; // Max emails per minute
        this.emailQueue = [];
        this.retryDelays = [1000, 2000, 4000]; // Exponential backoff in milliseconds
        this.rateLimitWindow = 60000; // 1 minute
        this.emailsSentInWindow = 0;
        this.circuitBreakerThreshold = 3;
        this.failures = 0;
    }

    async sendEmail(email) {
        // Idempotency check
        if (this.sentEmails.has(email.id)) {
            return this.sentEmails.get(email.id);
        }

        // Rate limiting
        if (this.emailsSentInWindow >= this.rateLimit) {
            this.emailQueue.push(email);
            return 'RATE_LIMITED';
        }

        let status = await this._sendWithRetry(email);
        this.sentEmails.set(email.id, status);
        this.emailsSentInWindow++;
        this._resetRateLimitCounter();

        return status;
    }

    async _sendWithRetry(email) {
        for (let attempt = 0; attempt < this.retryDelays.length; attempt++) {
            if (this.failures >= this.circuitBreakerThreshold) {
                console.log("Circuit breaker activated. Skipping email send.");
                return 'FAILED_CIRCUIT_BREAKER';
            }

            try {
                const success = await this._sendWithCurrentProvider(email);
                if (success) {
                    console.log(`Email sent successfully with provider ${this.currentProviderIndex + 1}`);
                    this.failures = 0; // Reset failures on success
                    return 'SENT';
                } else {
                    this._switchProvider();
                }
            } catch (error) {
                console.log(`Error on attempt ${attempt + 1}:`, error);
                if (attempt === this.retryDelays.length - 1) {
                    this.failures++;
                    return 'FAILED';
                }
                await this._delay(this.retryDelays[attempt]);
            }
        }

        return 'FAILED';
    }

    async _sendWithCurrentProvider(email) {
        return this.providers[this.currentProviderIndex].send(email);
    }

    _switchProvider() {
        this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
        console.log(`Switched to provider ${this.currentProviderIndex + 1}`);
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    _resetRateLimitCounter() {
        setTimeout(() => {
            this.emailsSentInWindow = 0;
            console.log('Rate limit window reset.');
            this._processQueue();
        }, this.rateLimitWindow);
    }

    async _processQueue() {
        while (this.emailQueue.length > 0 && this.emailsSentInWindow < this.rateLimit) {
            const email = this.emailQueue.shift();
            await this.sendEmail(email);
        }
    }
}

export default EmailService;
