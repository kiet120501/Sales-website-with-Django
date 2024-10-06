from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.dispatch import receiver
from django.contrib.auth.models import User
import json
import datetime
from django.db.models.signals import post_save
from django.db.models.signals import pre_save
from django.contrib.auth import login as auth_login, authenticate, logout as auth_logout
from django.core.paginator import Paginator
from .models import *
from .utils import cookieCart, guestOrder
from .forms import LoginForm, RegisterForm
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from decimal import Decimal, InvalidOperation
import decimal
from django.db import transaction
from decimal import Decimal, ROUND_HALF_UP
from decimal import InvalidOperation
from django.views.decorators.http import require_POST
from django.shortcuts import render, get_object_or_404

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)
    
#create a function that will update the quantity of the product when an order item is created
def store(request):
    categories = Category.objects.all()

    data = cookieCart(request)

    cart_data = data

    products = Product.objects.all().order_by('id')
    page_number = request.GET.get('page') or 1
    page_obj = Paginator(products, 8).get_page(page_number)
    print(page_obj.paginator.num_pages)
    context = {
        'page_data': page_obj,
        'cart': cart_data,
        'categories': categories,
        'page_range': range(1, page_obj.paginator.num_pages + 1),
        'current_page': int(page_number)
    }
    return render(request, 'store/store.html', context)



def cart(request):
    data = cookieCart(request)
    cartItems = data['cartItems']
    order = data['order']
    items = data['items']

    context = {'items': items, 'order': order, 'cartItems': cartItems}
    return render(request, 'store/cart.html', context)
#-----------------------------------------------------------------------------

@csrf_exempt
def search_ordered(request):
    if request.method == 'POST':
        jitems = []
        nItems = 0 
        context = {'items': {}, 'cart_items': 0, 'cart_total': 0}
        total = 0
        try:
            data = json.loads(request.body)
            orderid = data['form']['order']
            shippingAddress = ShippingAddress.objects.get(order=orderid)
            client = Client.objects.get(order =orderid)

            orderid = Order.objects.get(id =orderid)
            
            print("orderid: ",client.name, client.email, shippingAddress)
            shipping = {'customer': {'name': client.name, 'email': client.email}, 
                        'shippingAddress': {'adress': shippingAddress.address, 'city': shippingAddress.city, 'state': shippingAddress.state,
                                            'zipcode': shippingAddress.zipcode, 'date_added': shippingAddress.date_added.strftime('%F')}}
            items = OrderItem.objects.filter(order=orderid)
            # perform search logic
            for item in items:
                produce = item.product.name
                quantity = item.quantity
                price = item.get_total
                imageURL = item.product.imageURL
                j_item = {'product': {'name': produce, 'price': price, 'imageURL': imageURL}, 'quantity': quantity}
                jitems.append(j_item)
            total = sum([item['product']['price'] * item['quantity'] for item in jitems])
            nItems = len(jitems)
            context = {'items': jitems, 'cart_items': nItems, 'cart_total': total, 'shipping': shipping}
            #print("context: ", context)
            return JsonResponse(context) # send JSON response
        except json.decoder.JSONDecodeError:
            render(request, 'store/ordered.html')
        except Order.DoesNotExist:
            print("context is empty")
            return render(request, 'store/ordered.html',context)
    return render(request, 'store/ordered.html')
#-------------------------------------------------------------------------------
def checkout(request):
    data = cookieCart(request)
    return render(request, 'store/checkout.html', {'cart': data})

@csrf_exempt
def updateCart(request):
    data = json.loads(request.body)
    cart = cookieCart(request)['items']

    if data['action'] == 'REMOVE':
        cart = [item for item in cart if item['id'] != data['productId']]
    elif data['productId'] not in list(map(lambda item: item['id'], cart)):
        cart.append({
            'id': data['productId'],
            'quantity': 1
        })
    else:
        index = [i for i in range(len(cart)) if cart[i]['id'] == data['productId']][0]
        if data['action'] == 'ADD':
            cart[index]['quantity'] += 1
        else:
            cart[index]['quantity'] = data['quantity']

    print(cart)

    # Sử dụng DecimalEncoder để xử lý Decimal
    request.COOKIES['cart'] = json.dumps(cart, cls=DecimalEncoder)

    cart_data = cookieCart(request)
    print(cart_data)

    return JsonResponse(cart_data, safe=False, encoder=DecimalEncoder)


@transaction.atomic
def processOrder(request):
    transaction_id = datetime.datetime.now().timestamp()
    data = json.loads(request.body)

    if request.user.is_authenticated:
        customer = request.user.customer
        order, created = Order.objects.get_or_create(customer=customer, complete=False)
    else:
        customer, order = guestOrder(request, data)

    cart_data = cookieCart(request)
    
    total_price = Decimal(str(cart_data['totalPrice'])).quantize(Decimal('.01'), rounding=ROUND_HALF_UP)
    tax = Decimal(str(cart_data['tax'])).quantize(Decimal('.01'), rounding=ROUND_HALF_UP)

    order.transaction_id = transaction_id
    order.complete = True
    order.save()

    product_details = []
    for item in cart_data['items']:
        product_details.append(f"{item['name']} (ID: {item['id']}, Số lượng: {item['quantity']}, Tổng phụ: {item['subTotal']})")
    
    product_names = ", ".join(product_details)

    shipping_address = f"{data['shipping']['address']}, {data['shipping']['city']}"
    if 'state' in data['shipping']:
        shipping_address += f", {data['shipping']['state']}"
    shipping_address += f", {data['shipping']['zipcode']}"

    customer_email = customer.email if hasattr(customer, 'email') and customer.email else data['client']['email']

    if not Invoice.objects.filter(order=order).exists():
        Invoice.objects.create(
            order=order,
            invoice_number=f"INV-{order.id}-{transaction_id}",
            total_amount=total_price,
            tax=tax,
            payment_method="Thanh toán trực tuyến",
            customer_name=customer.name,
            customer_email=customer_email,
            shipping_address=shipping_address,
            product_name=product_names
        )

    if not request.user.is_authenticated:
        request.session['cart'] = '{}'

    return JsonResponse({'status': 'success', 'message': 'Đơn hàng đã được xử lý thành công'}, safe=False)

def login(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)

        if not form.is_valid():
            return render(request, 'store/login.html', {'form': form})

        user = authenticate(username=form.cleaned_data['username'], password=form.cleaned_data['password'])

        if user is not None:
            auth_login(request, user)
            return redirect('/' if user.is_superuser == 0 else '/admin')
        else:
            form.add_error('username', 'Tên đăng nhập hoặc mật khẩu không chính xác')
            return render(request, 'store/login.html', {'form': form})
    return render(request, 'store/login.html', {'form': LoginForm()})

def signUp(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)

        if not form.is_valid():
            return render(request, 'store/register.html', {'form': form})

        user = authenticate(username = form.cleaned_data['username'], password = form.cleaned_data['password'])

        if user is not None:
            form.add_error('username', 'Tên đăng nhập đã được sử dụng')
            return render(request, 'store/register.html', {'form': form})
        
        user = User(username = form.cleaned_data['username'], is_staff=1)
        user.set_password(form.cleaned_data['password'])

        user.save()
        Customer.objects.create(user=user, name=user.username)
        return redirect('/login')
    return render(request, 'store/register.html', {'form': RegisterForm()})

def logout(request):
    if request.method == 'POST':
        auth_logout(request)
        return redirect('/login')
    

@receiver(post_save, sender=User)
def create_customer(sender, instance, created, **kwargs):
    if created:
        Customer.objects.create(user=instance, name=instance.username)

@receiver(post_save, sender=User)
def save_customer(sender, instance, **kwargs):
    instance.customer.save()

def revenue_statistics(request):
    period = request.GET.get('period', 'day')
    total_revenue = Revenue.get_total_revenue(period)
    revenue_by_period = Revenue.get_revenue_by_period(period)
    
    if period == 'day':
        hourly_revenue = Revenue.get_hourly_revenue()
    else:
        hourly_revenue = None

    context = {
        'total_revenue': total_revenue,
        'revenue_by_period': revenue_by_period,
        'hourly_revenue': hourly_revenue,
        'period': period,
    }
    return render(request, 'store/revenue_statistics.html', context)
def revenue_view(request):
    daily_revenue = Revenue.get_revenue_by_period('day')
    context = {'daily_revenue': daily_revenue}
    return render(request, 'revenue_statistics.html', context)  

#3 sp 
def all_products(request):
    products = Product.objects.all()
    return render(request, 'store/all_products.html', {'products': products})

def popular_items(request):
    popular_products = Product.objects.order_by('-sales')[:10]  # Giả sử có trường 'sales'
    return render(request, 'store/popular_items.html', {'products': popular_products})

def new_arrivals(request):
    new_products = Product.objects.order_by('-created_at')[:10]  # Giả sử có trường 'created_at'
    return render(request, 'store/new_arrivals.html', {'products': new_products})

@require_POST
def updateItem(request):
    try:
        data = json.loads(request.body)
        productId = data['productId']
        action = data['action']
        # Xử lý logic cập nhật giỏ hàng ở đây
        return JsonResponse({'status': 'success', 'message': 'Item was updated'})
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)
    except KeyError as e:
        return JsonResponse({'status': 'error', 'message': f'Missing key: {str(e)}'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    

def category_products(request, category_id):
    category = Category.objects.get(id=category_id)
    products = Product.objects.filter(category=category)
    return render(request, 'store/category_products.html', {'category': category, 'products': products})
