from django.conf.urls import url, include
from rest_framework import routers
from igwatlas.views import igwatlas, RecordsViewSet

router = routers.DefaultRouter()
router.register(r'records', RecordsViewSet, base_name='records')

urlpatterns = [
    url(r'^api/v1/', include(router.urls)),
    url(r'^docs/', include('rest_framework_swagger.urls')),
    url(r'^igwatlas/$', igwatlas, name='igwatlas'),
]
