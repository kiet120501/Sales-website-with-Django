# Generated by Django 3.2.11 on 2024-09-02 11:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0009_product_technical_specs'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='technical_specs',
            field=models.TextField(blank=True, default=0, verbose_name='Thông số kỹ thuật'),
            preserve_default=False,
        ),
    ]
