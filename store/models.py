from django.db import models
from django.contrib.auth.models import User
from django.db.models import Sum
from django.utils import timezone
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth, TruncYear
from django.utils.crypto import get_random_string
from django.core.validators import MinValueValidator, MaxValueValidator
import random
from django.db.models import JSONField
from django import forms
from django.contrib import admin
from django.utils.formats import number_format
import uuid



    #from django.db.models.signals import pre_save
    #from django.dispatch import receiver
    # Create your models here.
class Customer(models.Model):
        user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
        name = models.CharField(max_length=200, null=True)
        email = models.CharField(max_length=200, null=True)

        def __str__(self):
            return self.name
class Category(models.Model):
    name = models.CharField(max_length=100)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"
def generate_unique_id():
    return random.randint(1, 500)




class Product(models.Model):
        productId = models.IntegerField(
        unique=True, 
        default=generate_unique_id,
        validators=[MinValueValidator(1), MaxValueValidator(500)]
        )        
        name = models.CharField(max_length=200, null=False)
        category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)  # Liên kết với Category
        price = models.DecimalField(max_digits=10, decimal_places=0, null=True)
        quantity = models.IntegerField(default=0, null=True, blank=True)
        image = models.ImageField(null=True, blank=True)
        product_info = models.TextField(verbose_name="Edit product information", blank=True)
        technical_specs = models.TextField(verbose_name="Edit technical specifications", blank=True)


        def __str__(self):
            return f"{self.productId} - {self.name}"

        @property
        def imageURL(self):
            try:
                url = self.image.url
            except Exception as ex:
                print("ex url: ", ex)
                url = ''
            return url
        
        def formatted_price(self):
            return number_format(self.price, decimal_pos=0, use_l10n=True, force_grouping=True)

class Order(models.Model):
        customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True)
        date_order = models.DateTimeField(auto_now_add=True)
        complete = models.BooleanField(default=False, null=True, blank=True)
        transaction_id = models.CharField(max_length=200, null=True)

        def __str__(self):
            return str(self.id)

        @property
        def shipping(self):
            shipping = False
            orderitems = self.orderitem_set.all()
            for i in orderitems:
                if i.product.digital == False:
                    shipping = True
            return shipping


        @property
        def get_cart_total(self):
            orderitems = self.orderitem_set.all()
            total = sum([item.get_total for item in orderitems])
            return total

        @property
        def get_cart_items(self):
            orderitems = self.orderitem_set.all()
            total = sum([item.quantity for item in orderitems])
            return total

class OrderItem(models.Model):
        product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
        order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True)
        quantity = models.IntegerField(default=0, null=True, blank=True)
        date_added = models.DateTimeField(auto_now_add=True)

        @property
        def get_total(self):
            total = self.product.price * self.quantity
            return total


class ShippingAddress(models.Model):
        customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True)
        order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True)
        address = models.CharField(max_length=200, null=True)
        city = models.CharField(max_length=200, null=True)
        state = models.CharField(max_length=200, null=True)
        zipcode = models.CharField(max_length=200, null=True)
        date_added = models.DateTimeField(auto_now_add=True)

        def __str__(self):
            return self.address
        
class Client(models.Model):
        customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True)
        order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True)
        name = models.CharField(max_length=200, null=True)
        email = models.CharField(max_length=200, null=True)
        def __str__(self):
            return self.name
        
class Revenue(models.Model):
        date = models.DateTimeField(default=timezone.now)
        amount = models.DecimalField(max_digits=10, decimal_places=2)
        
        def __str__(self):
            return f"Revenue on {self.date}: {self.amount}"
        
        

        @classmethod
        def get_revenue_by_period(cls, period='day'):
            now = timezone.now()
            if period == 'day':
                start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
                trunc_func = TruncDay('date')
            elif period == 'week':
                start_date = now - timezone.timedelta(days=now.weekday())
                trunc_func = TruncWeek('date')
            elif period == 'month':
                start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                trunc_func = TruncMonth('date')
            elif period == 'year':
                start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
                trunc_func = TruncYear('date')
            else:
                raise ValueError("Invalid period. Choose 'day', 'week', 'month', or 'year'.")

            return cls.objects.filter(date__gte=start_date) \
                .annotate(period=trunc_func) \
                .values('period') \
                .annotate(total=Sum('amount')) \
                .order_by('period')
        
        #new
        @staticmethod
        def get_total_revenue():
            return Revenue.objects.aggregate(total=Sum('amount'))['total'] or 0
        
def generate_unique_transaction_id():
    import uuid
    return str(uuid.uuid4())
class Invoice(models.Model):

    product_id = models.IntegerField(null=True, blank=True)
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    invoice_number = models.CharField(max_length=50, unique=True)
    date_created = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=50)
    customer_name = models.CharField(max_length=200)
    customer_email = models.EmailField()
    shipping_address = models.TextField()
    product_name = models.CharField(max_length=200, blank=True)
    quantity = models.IntegerField(default=0)
    sub_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"Invoice {self.invoice_number} for Order {self.order.id}"