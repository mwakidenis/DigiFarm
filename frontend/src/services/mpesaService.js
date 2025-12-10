import api from './api'

export const mpesaService = {
  initiateSTKPush: async (orderId, phone) => {
    // Format phone number to +254 format
    let formattedPhone = phone
    if (phone.startsWith('0')) {
      formattedPhone = '+254' + phone.substring(1)
    } else if (!phone.startsWith('+')) {
      formattedPhone = '+' + phone
    }
    
    const response = await api.post('/payments/mpesa/initiate/', {
      order_id: orderId,
      phone: formattedPhone,
    })
    return response.data
  },

  simulateWebhook: async (checkoutRequestId, resultCode = 0, receiptNumber = 'QLTEST123') => {
    const response = await api.post('/payments/mpesa/confirmation_sim/', {
      checkout_request_id: checkoutRequestId,
      result_code: resultCode,
      mpesa_receipt_number: receiptNumber,
    })
    return response.data
  },

  getTransactions: async () => {
    const response = await api.get('/payments/transactions/')
    return response.data
  },
}

