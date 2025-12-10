from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    path('mpesa/initiate/', views.initiate_stk_push, name='initiate_stk_push'),
    path('mpesa/webhook/', views.mpesa_webhook, name='mpesa_webhook'),
    path('mpesa/confirmation_sim/', views.simulate_webhook, name='simulate_webhook'),
    path('transactions/', views.transaction_list, name='transaction_list'),
]

