import React from 'react';

class MockEmailProviderA {
    async send(email) {
        // Simulate a 50% success rate
        return Math.random() > 0.5;
    }
}

class MockEmailProviderB {
    async send(email) {
        // Simulate a 50% success rate
        return Math.random() > 0.5;
    }
}

export { MockEmailProviderA, MockEmailProviderB };
