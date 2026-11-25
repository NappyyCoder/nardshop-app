const COMPANY_ID = import.meta.env.VITE_KLAVIYO_COMPANY_ID;
const LIST_ID = import.meta.env.VITE_KLAVIYO_LIST_ID;

export const toE164 = (digits) => {
    const clean = String(digits || '').replace(/\D/g, '');
    if (clean.length === 10) return `+1${clean}`;
    if (clean.length === 11 && clean.startsWith('1')) return `+${clean}`;
    if (clean.startsWith('+')) return clean;
    return `+${clean}`;
};

export const subscribeKlaviyoSms = async (digits) => {
    if (!COMPANY_ID || !LIST_ID) {
        throw new Error('Klaviyo SMS list is not configured');
    }

    const response = await fetch(
        `https://a.klaviyo.com/client/subscriptions/?company_id=${encodeURIComponent(COMPANY_ID)}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/vnd.api+json',
                Accept: 'application/vnd.api+json',
                revision: '2026-10-15',
            },
            body: JSON.stringify({
                data: {
                    type: 'subscription',
                    attributes: {
                        custom_source: 'NARD Static Drop',
                        profile: {
                            data: {
                                type: 'profile',
                                attributes: {
                                    phone_number: toE164(digits),
                                    subscriptions: {
                                        sms: {
                                            marketing: { consent: 'SUBSCRIBED' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    relationships: {
                        list: { data: { type: 'list', id: LIST_ID } },
                    },
                },
            }),
        },
    );

    if (response.status !== 202) {
        throw new Error('Klaviyo signup failed');
    }
    return true;
};

export const subscribeKlaviyoEmail = async (email) => {
    const listId = import.meta.env.VITE_KLAVIYO_EMAIL_LIST_ID || LIST_ID;
    if (!COMPANY_ID || !listId) {
        throw new Error('Klaviyo email list is not configured');
    }

    const response = await fetch(
        `https://a.klaviyo.com/client/subscriptions/?company_id=${encodeURIComponent(COMPANY_ID)}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/vnd.api+json',
                Accept: 'application/vnd.api+json',
                revision: '2026-10-15',
            },
            body: JSON.stringify({
                data: {
                    type: 'subscription',
                    attributes: {
                        custom_source: 'Find the cat',
                        profile: {
                            data: {
                                type: 'profile',
                                attributes: {
                                    email,
                                    subscriptions: {
                                        email: {
                                            marketing: { consent: 'SUBSCRIBED' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    relationships: {
                        list: { data: { type: 'list', id: listId } },
                    },
                },
            }),
        },
    );

    if (response.status !== 202) {
        throw new Error('Klaviyo signup failed');
    }
    return true;
};
