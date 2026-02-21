import axios from 'axios';
import { format } from 'date-fns';

const getEnvironment = () => process.env.MPESA_ENVIRONMENT || 'sandbox';

const getBaseUrl = () => {
    return getEnvironment() === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';
};

/**
 * Generate an OAuth access token for Daraja API
 */
export const generateToken = async () => {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
        throw new Error('M-Pesa credentials not configured');
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const url = `${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`;

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });
        return response.data.access_token;
    } catch (error) {
        console.error('M-Pesa token generation failed:', error.response?.data || error.message);
        throw new Error('Failed to authenticate with M-Pesa');
    }
};

/**
 * Initiate STK Push (Lipa na M-Pesa Online)
 */
export const initiateSTKPush = async (phoneNumber, amount, accountReference, transactionDesc = 'School Fees Payment') => {
    const token = await generateToken();
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;

    // Safaricom expects the phone number in the format 2547XXXXXXXX
    let formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('0')) {
        formattedPhone = `254${formattedPhone.substring(1)}`;
    } else if (formattedPhone.startsWith('+')) {
        formattedPhone = formattedPhone.substring(1);
    }

    const timestamp = format(new Date(), 'yyyyMMddHHmmss');
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const url = `${getBaseUrl()}/mpesa/stkpush/v1/processrequest`;

    const payload = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.ceil(amount),
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl,
        AccountReference: accountReference.substring(0, 12), // Max 12 chars
        TransactionDesc: transactionDesc.substring(0, 13) // Max 13 chars
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('STK Push failed:', error.response?.data || error.message);
        throw new Error(`Failed to initiate STK Push: ${error.response?.data?.errorMessage || error.message}`);
    }
};

/**
 * Handle STK Push Callback Payload
 */
export const parseCallback = (callbackData) => {
    try {
        const body = callbackData.Body.stkCallback;
        const resultCode = body.ResultCode;
        const resultDesc = body.ResultDesc;
        const merchantRequestID = body.MerchantRequestID;
        const checkoutRequestID = body.CheckoutRequestID;

        if (resultCode !== 0) {
            return {
                success: false,
                resultCode,
                resultDesc,
                merchantRequestID,
                checkoutRequestID
            };
        }

        // Success - Parse payment details
        const items = body.CallbackMetadata.Item;
        let amount = 0;
        let mpesaReceiptNumber = '';
        let phoneNumber = '';
        let transactionDate = '';

        items.forEach(item => {
            switch (item.Name) {
                case 'Amount': amount = item.Value; break;
                case 'MpesaReceiptNumber': mpesaReceiptNumber = item.Value; break;
                case 'PhoneNumber': phoneNumber = item.Value; break;
                case 'TransactionDate': transactionDate = item.Value; break;
            }
        });

        return {
            success: true,
            resultCode,
            resultDesc,
            amount,
            mpesaReceiptNumber,
            phoneNumber,
            transactionDate,
            merchantRequestID,
            checkoutRequestID
        };
    } catch (error) {
        throw new Error('Invalid callback payload format');
    }
};
