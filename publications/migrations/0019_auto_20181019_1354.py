# Generated by Django 2.0 on 2018-10-19 10:54

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('publications', '0018_auto_20181004_1132'),
    ]

    operations = [
        migrations.AlterField(
            model_name='author',
            name='user',
            field=models.ForeignKey(blank=True, help_text='Если есть аккаунт', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='author', to='lmnad.Account', verbose_name='Пользователь'),
        ),
        migrations.AlterField(
            model_name='publication',
            name='journal',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='publications.Journal', verbose_name='Журнал, конференция'),
        ),
    ]
