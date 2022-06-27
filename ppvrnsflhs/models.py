from django.db import models

class TimeStampedModel(models.Model):
    """
    An abstract base class model that provides self-updating
    ``created`` and ``modified`` fields.
    """
    created = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    modified = models.DateTimeField(auto_now=True, blank=True, null=True)

    class Meta:
        abstract = True

class Calculation(TimeStampedModel):
    name        = models.CharField(max_length=255, verbose_name='Название расчёта')
    
    source_file = models.FileField(upload_to='uploads/ppvrnsflhs/sources', max_length=255, verbose_name='Файл с исходными данными')
    source_dir  = models.CharField(max_length=255, verbose_name='Каталог с исходными данными')

    dir_result_T    = models.CharField(max_length=255, verbose_name='Каталог с полученными данными потенциальной температуры')
    dir_result_U    = models.CharField(max_length=255, verbose_name='Каталог с полученными данными зональной составляющей поля скоростей')
    dir_result_V    = models.CharField(max_length=255, verbose_name='Каталог с полученными данными меридиальной составляющей поля скоростей')
    dir_result_W    = models.CharField(max_length=255, verbose_name='Каталог с полученными данными вертикальной составляющей поля скоростей')
    dir_result_UV   = models.CharField(max_length=255, verbose_name='Каталог с полученными данными скорости')
    dir_result_PNH  = models.CharField(max_length=255, verbose_name='Каталог с полученными данными гидростатического давления')

    def __str__(self):
        return self.name
