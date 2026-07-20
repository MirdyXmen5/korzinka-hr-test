from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'tests', views.TestViewSet)
router.register(r'results', views.ResultViewSet)

urlpatterns = [
    path('tests/upload/', views.UploadTestView.as_view(), name='upload-test'),
    path('', include(router.urls)),
]
