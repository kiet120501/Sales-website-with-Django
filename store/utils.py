import json
from .models import *
from django.forms.models import model_to_dict

def cookieCart(request):
    # Create empty cart for now for non-logged in user
    try:
        cart = json.loads(request.COOKIES['cart'])
    except:
        cart = []

    items = []
    totalPrice = 0
    products = []

    for cart_item in cart:
        product = Product.objects.get(id=cart_item['id'])
        item = model_to_dict(product, fields=('id', 'name', 'price'))
        item['imageURL'] = product.imageURL
        item['quantity'] = cart_item['quantity']
        item['subTotal'] = float(item['price']) * float(cart_item['quantity'])
        items.append(item)
        totalPrice += item['subTotal']
        products.append(cart_item['id'])

    return {'items': items, 'totalPrice': totalPrice, 'products': products, 'count': len(items),  'tax': totalPrice * 0.1, 'afterTax': totalPrice * 1.1}

def getOrder(request, data):
    order = data['form']['order']
    print ('order: ', order)
    return order

def guestOrder(request, data):
    name = data['form']['name']
    email = data['form']['email']

    cookieData = cookieCart(request)
    items = cookieData['items']

    customer, created = Customer.objects.get_or_create(
        email=email,
    )
    customer.name = name
    customer.save()

    order = Order.objects.create(
        customer=customer,
        complete=False,
    )

    for item in items:
        product = Product.objects.get(id=item['id'])
        orderItem = OrderItem.objects.create(
            product=product,
            order=order,
            quantity=(item['quantity'] if item['quantity'] > 0 else -1 * item['quantity']),
            # negative quantity = freebies
        )
    return customer, order