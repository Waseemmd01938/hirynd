from django.urls import path
from . import views

urlpatterns = [
    path('', views.global_audit_logs, name='global_audit_logs'),
    path('<uuid:candidate_id>/', views.candidate_audit_logs, name='candidate_audit_logs'),
]
