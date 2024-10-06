from django.contrib import admin
from django import forms
from django.db.models import Sum
from django.utils.html import format_html
from django.contrib.admin.views.main import ChangeList
from django.utils.safestring import mark_safe
from django.contrib.admin import DateFieldListFilter
from django.utils import timezone
from rangefilter.filters import DateRangeFilter
from django.utils.formats import number_format 
from .models import *
from django.template.response import TemplateResponse
import logging
from django.utils.crypto import get_random_string
import json

logger = logging.getLogger(__name__)


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent')
    list_filter = ('parent',)
    search_fields = ('name',)
class RevenueAdminForm(forms.ModelForm):
    class Meta:
        model = Revenue
        widgets = {
            'date': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
        }
        fields = '__all__'
class RevenueChangeList(ChangeList):
    def get_results(self, request):
        super().get_results(request)
        self.total_revenue = self.queryset.aggregate(Sum('amount'))['amount__sum'] or 0


    def calculate_total_revenue(self, request):
        qs = self.queryset
        if 'date__year' in request.GET:
            year = request.GET['date__year']
            if 'date__month' in request.GET:
                month = request.GET['date__month']
                qs = qs.filter(date__year=year, date__month=month)
            else:
                qs = qs.filter(date__year=year)
        return qs.aggregate(Sum('amount'))['amount__sum'] or 0
class YearFilter(admin.SimpleListFilter):
    title = 'year'
    parameter_name = 'year'

    def lookups(self, request, model_admin):
        years = set([d.year for d in model_admin.model.objects.dates('date', 'year')])
        return [(str(year), str(year)) for year in years]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(date__year=self.value())
        return queryset

class MonthFilter(admin.SimpleListFilter):
    title = 'month'
    parameter_name = 'month'

    def lookups(self, request, model_admin):
        return [
            ('1', 'January'),
            ('2', 'February'),
            ('3', 'March'),
            ('4', 'April'),
            ('5', 'May'),
            ('6', 'June'),
            ('7', 'July'),
            ('8', 'August'),
            ('9', 'September'),
            ('10', 'October'),
            ('11', 'November'),
            ('12', 'December'),
        ]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(date__month=self.value())
        return queryset

class RevenueAdmin(admin.ModelAdmin):
    change_list_template = 'store/admin/store/revenue/change_list.html'

    list_display = ( 'date', 'amount')
    list_filter = (YearFilter, MonthFilter, 'date')
    date_hierarchy = 'date' 

    def detailed_date(self, obj):
        return obj.date.strftime("%Y-%m-%d %H:%M:%S")
    detailed_date.short_description = 'Detailed Date'

    def get_changelist(self, request, **kwargs):
        return RevenueChangeList



    def get_queryset(self, request):
        self.request = request
        return super().get_queryset(request)

    def total_revenue(self, obj):
        if not hasattr(self, '_total_revenue'):
            qs = self.get_queryset(self.request)
            self._total_revenue = qs.aggregate(Sum('amount'))['amount__sum'] or 0
        formatted_total = number_format(self._total_revenue, decimal_pos=2, use_l10n=True, force_grouping=True)
        return format_html('<strong>Tổng doanh thu: {}</strong>', formatted_total)

    total_revenue.short_description = ''


    def changelist_view(self, request, extra_context=None):
        response = super().changelist_view(request, extra_context)
        
        if hasattr(response, 'context_data'):
            queryset = response.context_data['cl'].queryset
            total_revenue = queryset.aggregate(Sum('amount'))['amount__sum'] or 0
            formatted_total = number_format(total_revenue, decimal_pos=2, use_l10n=True, force_grouping=True)
            
            response.context_data['total_revenue'] = formatted_total
            logger.debug(f"Total revenue: {formatted_total}")  # Thêm dòng này
        else:
            logger.debug("No context_data in response")  # Thêm dòng này
        
        return response

# admin.site.register(Revenue, RevenueAdmin,)  
# class RevenueAdmin(admin.ModelAdmin):
#     list_display = ('total_revenue', 'date', 'amount')
#     list_filter = ('date',)
#     date_hierarchy = 'date'
#     def get_queryset(self, request):
#         self.request = request  # Lưu request vào self
#         return super().get_queryset(request)
#     def get_changelist(self, request, **kwargs):
#         return RevenueChangeList

#     def changelist_view(self, request, extra_context=None):
#         response = super().changelist_view(request, extra_context)
#         try:
#             cl = response.context_data['cl']
#             total_revenue = cl.queryset.aggregate(Sum('amount'))['amount__sum'] or 0
#             response.context_data['cl'].total_revenue = total_revenue
#         except (AttributeError, KeyError):
#             pass
#         return response

#     def get_changelist_instance(self, request):
#         cl = super().get_changelist_instance(request)
#         cl.total_revenue = cl.queryset.aggregate(Sum('amount'))['amount__sum'] or 0
#         return cl

#     def total_revenue(self, obj):
#         if not hasattr(self, '_total_revenue'):
#             qs = self.get_queryset(self.request)
#             self._total_revenue = qs.aggregate(Sum('amount'))['amount__sum'] or 0
#         return format_html('<strong>Tổng doanh thu: {:,.2f}</strong>', self._total_revenue)

#     total_revenue.short_description = ''


class ProductAdminForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = '__all__'

    # def clean(self):
    #     cleaned_data = super().clean()
    #     technical_specs = cleaned_data.get('technical_specs')
    #     if technical_specs:
    #         try:
    #             json.loads(technical_specs)
    #         except json.JSONDecodeError:
    #             raise forms.ValidationError("Invalid JSON format for technical specifications")
    #     return cleaned_data

class ProductAdmin(admin.ModelAdmin):
    form = ProductAdminForm
    list_display = ('name', 'price', 'quantity', 'category')
    list_filter = ('category',)
    search_fields = ('name', 'category__name')
    readonly_fields = ('display_technical_specs',)
    fields = ('name', 'category', 'price', 'quantity', 'image', 'technical_specs', 'display_technical_specs')
    # def display_technical_specs(self, obj):
    #     if obj.technical_specs:
    #         if isinstance(obj.technical_specs, str):
    #             return json.dumps(json.loads(obj.technical_specs), indent=2)
    #         elif isinstance(obj.technical_specs, dict):
    #             return json.dumps(obj.technical_specs, indent=2)
    #     return "No technical specifications available"
    # display_technical_specs.short_description = "Technical Specifications"
    def display_technical_specs(self, obj):
        return obj.technical_specs or "Không có thông số kỹ thuật"
    display_technical_specs.short_description = "Thông số kỹ thuật"
    class Media:
        js = ('store/js/product_admin.js',)


# class ProductAdmin(admin.ModelAdmin):
#     form = ProductAdminForm
#     readonly_fields = ('product_id',)

#     def get_readonly_fields(self, request, obj=None):
#         if obj:
#             return self.readonly_fields + ('product_id',)
#         return self.readonly_fields
admin.site.register(Revenue, RevenueAdmin)
admin.site.register(Customer)
admin.site.register(Product, ProductAdmin)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(ShippingAddress)
admin.site.register(Client)
admin.site.register(Category, CategoryAdmin)

