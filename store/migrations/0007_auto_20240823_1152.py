# Generated by Django 3.2.11 on 2024-08-23 04:52

from django.db import migrations, models
import store.models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0006_auto_20240823_1059'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='product',
            name='digital',
        ),
        migrations.AlterField(
            model_name='product',
            name='productId',
            field=models.CharField(default=store.models.generate_unique_id, max_length=20, unique=True),
        ),
    ]