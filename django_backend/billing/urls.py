from django.urls import path
from . import views

urlpatterns = [
    path('<uuid:candidate_id>/subscription/', views.subscription_detail, name='subscription_detail'),
    path('<uuid:candidate_id>/subscription/create/', views.create_subscription, name='create_subscription'),
    path('<uuid:candidate_id>/subscription/update/', views.update_subscription, name='update_subscription'),
    path('<uuid:candidate_id>/payments/', views.payments, name='payments'),
    path('<uuid:candidate_id>/payments/record/', views.record_payment, name='record_payment'),
    path('<uuid:candidate_id>/invoices/', views.invoices, name='invoices'),
]
