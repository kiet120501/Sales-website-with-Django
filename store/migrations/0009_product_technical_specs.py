# Generated by Django 3.2.11 on 2024-08-23 06:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0008_alter_product_productid'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='technical_specs',
            field=models.JSONField(blank=True, null=True),
        ),
    ]
