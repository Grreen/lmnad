from django.urls import path
from ppvrnsflhs.views import ppvrnsflhs, ppvrnsflhs_about


urlpatterns = [
    path('ppvrnsflhs/', ppvrnsflhs, name='ppvrnsflhs'),
    path('ppvrnsflhs_about/', ppvrnsflhs_about, name='ppvrnsflhs_about')
]