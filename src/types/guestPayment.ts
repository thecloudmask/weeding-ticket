export interface GuestPayment {
    id: string;
    name: string;
    location?: string;
    category: 'Family' | 'Friend' | 'Colleague' | 'VIP' | 'Other';
    paymentMethod: 'Cash' | 'ABA Bank' | 'ACLEDA Bank' | 'Wing' | 'Other';
    currency: 'USD' | 'KHR';
    amount: number;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
}

export const CATEGORIES = ['Family', 'Friend', 'Colleague', 'VIP', 'Other'] as const;
export const PAYMENT_METHODS = ['Cash', 'ABA Bank', 'ACLEDA Bank', 'Wing', 'Other'] as const;
export const CURRENCIES = ['USD', 'KHR'] as const;

// Exchange rate: 1 USD = 4000 KHR (you can adjust this)
export const EXCHANGE_RATE = 4000;

// Helper functions
export const convertToUSD = (amount: number, currency: 'USD' | 'KHR'): number => {
    return currency === 'KHR' ? amount / EXCHANGE_RATE : amount;
};

export const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
        Family: 'bg-gradient-to-r from-purple-500 to-purple-600',
        Friend: 'bg-gradient-to-r from-blue-500 to-blue-600',
        Colleague: 'bg-gradient-to-r from-green-500 to-green-600',
        VIP: 'bg-gradient-to-r from-amber-500 to-amber-600',
        Other: 'bg-gradient-to-r from-gray-500 to-gray-600',
    };
    return colors[category] || colors.Other;
};
