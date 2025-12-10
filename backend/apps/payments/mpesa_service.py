"""
M-Pesa Daraja API integration service.
"""
import os
import base64
import requests
import json
from datetime import datetime
from django.conf import settings
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


class MPesaService:
    """Service class for M-Pesa Daraja API operations."""
    
    def __init__(self):
        self.consumer_key = settings.MPESA_CONSUMER_KEY
        self.consumer_secret = settings.MPESA_CONSUMER_SECRET
        self.shortcode = settings.MPESA_SHORTCODE
        self.passkey = settings.MPESA_PASSKEY
        self.env = settings.MPESA_ENV
        self.callback_url = settings.MPESA_CALLBACK_URL
        self.lnm_expiry = settings.MPESA_LNM_EXPIRY
        
        # Base URLs
        if self.env == 'sandbox':
            self.base_url = 'https://sandbox.safaricom.co.ke'
        else:
            self.base_url = 'https://api.safaricom.co.ke'
        
        self.access_token = None
        self.token_expiry = None
    
    def get_access_token(self):
        """
        Get OAuth access token from M-Pesa.
        Returns: access_token string
        """
        # Check if we have a valid cached token
        if self.access_token and self.token_expiry and timezone.now() < self.token_expiry:
            return self.access_token
        
        url = f'{self.base_url}/oauth/v1/generate?grant_type=client_credentials'
        
        # Basic authentication
        auth_string = f'{self.consumer_key}:{self.consumer_secret}'
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        
        headers = {
            'Authorization': f'Basic {auth_b64}'
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            self.access_token = data.get('access_token')
            # Token expires in ~3600 seconds, cache for 3500 seconds
            from datetime import timedelta
            self.token_expiry = timezone.now() + timedelta(seconds=3500)
            
            logger.info('M-Pesa access token obtained successfully')
            return self.access_token
        
        except requests.exceptions.RequestException as e:
            logger.error(f'Failed to get M-Pesa access token: {str(e)}')
            raise Exception(f'Failed to get M-Pesa access token: {str(e)}')
    
    def generate_password(self):
        """
        Generate password for STK Push request.
        Format: base64(Shortcode + Passkey + Timestamp)
        """
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password_string = f'{self.shortcode}{self.passkey}{timestamp}'
        password_bytes = password_string.encode('ascii')
        password_b64 = base64.b64encode(password_bytes).decode('ascii')
        return password_b64, timestamp
    
    def initiate_stk_push(self, phone_number, amount, account_reference, transaction_desc):
        """
        Initiate STK Push payment request.
        
        Args:
            phone_number: Customer phone number (format: +2547XXXXXXXX)
            amount: Amount to charge
            account_reference: Account reference (e.g., order ID)
            transaction_desc: Transaction description
        
        Returns:
            dict with checkout_request_id and response_code
        """
        access_token = self.get_access_token()
        
        # Remove + from phone number for M-Pesa API
        phone = phone_number.replace('+', '')
        
        url = f'{self.base_url}/mpesa/stkpush/v1/processrequest'
        
        password, timestamp = self.generate_password()
        
        payload = {
            'BusinessShortCode': self.shortcode,
            'Password': password,
            'Timestamp': timestamp,
            'TransactionType': 'CustomerPayBillOnline',
            'Amount': int(amount),
            'PartyA': phone,
            'PartyB': self.shortcode,
            'PhoneNumber': phone,
            'CallBackURL': self.callback_url,
            'AccountReference': str(account_reference),
            'TransactionDesc': transaction_desc
        }
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            logger.info(f'STK Push initiated: {data}')
            
            return {
                'checkout_request_id': data.get('CheckoutRequestID'),
                'response_code': data.get('ResponseCode'),
                'customer_message': data.get('CustomerMessage'),
                'merchant_request_id': data.get('MerchantRequestID'),
                'raw_response': data
            }
        
        except requests.exceptions.RequestException as e:
            logger.error(f'Failed to initiate STK Push: {str(e)}')
            error_msg = str(e)
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_data = e.response.json()
                    error_msg = error_data.get('errorMessage', str(e))
                except:
                    error_msg = e.response.text
            raise Exception(f'Failed to initiate STK Push: {error_msg}')
    
    def query_stk_status(self, checkout_request_id):
        """
        Query STK Push transaction status.
        
        Args:
            checkout_request_id: Checkout request ID from STK Push initiation
        
        Returns:
            dict with transaction status
        """
        access_token = self.get_access_token()
        
        url = f'{self.base_url}/mpesa/stkpushquery/v1/query'
        
        password, timestamp = self.generate_password()
        
        payload = {
            'BusinessShortCode': self.shortcode,
            'Password': password,
            'Timestamp': timestamp,
            'CheckoutRequestID': checkout_request_id
        }
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            return {
                'response_code': data.get('ResponseCode'),
                'result_code': data.get('ResultCode'),
                'result_desc': data.get('ResultDesc'),
                'raw_response': data
            }
        
        except requests.exceptions.RequestException as e:
            logger.error(f'Failed to query STK status: {str(e)}')
            raise Exception(f'Failed to query STK status: {str(e)}')


def parse_mpesa_callback(data):
    """
    Parse M-Pesa callback/webhook data.
    
    Args:
        data: JSON data from M-Pesa webhook
    
    Returns:
        dict with parsed transaction data
    """
    body = data.get('Body', {})
    stk_callback = body.get('stkCallback', {})
    
    result_code = stk_callback.get('ResultCode')
    result_desc = stk_callback.get('ResultDesc')
    checkout_request_id = stk_callback.get('CheckoutRequestID')
    merchant_request_id = stk_callback.get('MerchantRequestID')
    
    callback_metadata = stk_callback.get('CallbackMetadata', {})
    items = callback_metadata.get('Item', [])
    
    # Extract transaction details
    transaction_data = {}
    for item in items:
        name = item.get('Name')
        value = item.get('Value')
        transaction_data[name] = value
    
    return {
        'result_code': result_code,
        'result_desc': result_desc,
        'checkout_request_id': checkout_request_id,
        'merchant_request_id': merchant_request_id,
        'mpesa_receipt_number': transaction_data.get('MpesaReceiptNumber'),
        'transaction_date': transaction_data.get('TransactionDate'),
        'amount': transaction_data.get('Amount'),
        'phone_number': transaction_data.get('PhoneNumber'),
        'raw_data': data
    }

