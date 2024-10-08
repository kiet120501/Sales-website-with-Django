# Generated by Django 3.2.11 on 2024-08-23 04:59

import django.core.validators
from django.db import migrations, models
import store.models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0007_auto_20240823_1152'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='productId',
            field=models.IntegerField(default=store.models.generate_unique_id, unique=True, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(500)]),
        ),
    ]
