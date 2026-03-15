from django.contrib import admin
from .models import Subscription, Payment, Invoice
admin.site.register(Subscription)
admin.site.register(Payment)
admin.site.register(Invoice)
