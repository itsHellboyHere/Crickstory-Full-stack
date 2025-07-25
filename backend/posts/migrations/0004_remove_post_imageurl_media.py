# Generated by Django 5.2.1 on 2025-06-30 17:55

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0003_post_location_post_tags'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='post',
            name='imageUrl',
        ),
        migrations.CreateModel(
            name='Media',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('media_type', models.CharField(choices=[('image', 'Image'), ('video', 'Video')], max_length=10)),
                ('url', models.URLField()),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='media', to='posts.post')),
            ],
        ),
    ]
