from django.urls import path
from . import views

urlpatterns = [
    path('', views.store, name = "store"),
    path('cart/', views.cart, name="cart"),
    path('checkout/', views.checkout, name="checkout"),
    path('search_ordered/', views.search_ordered, name="search_ordered"),
    path('update_cart/', views.updateCart, name="update_cart"),
    path('process_order/', views.processOrder, name="process_order"),
    path('login', views.login, name = "login"),
    path('sign-up', views.signUp, name = "register"),
    path('logout/', views.logout, name = "logout"),
        path('all-products/', views.all_products, name='all_products'),
    path('popular-items/', views.popular_items, name='popular_items'),
    path('new-arrivals/', views.new_arrivals, name='new_arrivals'),
        path('update_item/', views.updateItem, name="update_item"),
    path('category/<int:category_id>/', views.category_products, name='category_products'),
        

    #them moi
    
]