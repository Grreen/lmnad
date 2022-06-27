from celery.result import AsyncResult
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ppvrnsflhs.api_serializers import CommonSerializer
from ppvrnsflhs.models import Calculation
from lmnad.models import Page

from constance import config

from ppvrnsflhs.ppf import *

import time

# -*- coding: utf-8 -*-

class PostProcessingViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def check_file(self, request):
        api_key = request.POST.get('api_key', None)
        name = request.POST.get('name', None)
        file = request.FILES['file']

        if api_key and api_key == config.API_KEY_IGWATLAS:
            if file:
                if CheckZip(file):
                    calculation = Calculation.objects.create(name = name, 
                                                             source_file = file)

                    calculation.source_dir = GetSourceDirectory(calculation.source_file.path)
                    calculation.save()

                    UnpackFile(calculation.source_file.path, calculation.source_dir)

                    return Response({'success':            True,
                                    'calculation_name':    name,
                                    'calculation_id':      calculation.id})
                else:
                    return Response(CommonSerializer({'success':    False,
                                                      'reason':     'NOT_ZIP_FILE',
                                                      'message':    'Файл не является архивом'}).data) 
            else:
                return Response(CommonSerializer({'success':    False,
                                                  'reason':     'NOT_ENOUGH_PARAMS',
                                                  'message':    'Недостаточно параметров'}).data) 
        else:
            return Response(CommonSerializer({'success':    False,
                                              'reason':     'WRONG_API_KEY',
                                              'message':    'Неправильный API KEY'}).data)
    
    @action(detail=False, methods=['post'])
    def post_processing_data(self, request):
        
        api_key         = request.POST.get('api_key', None)
        calculation_id  = request.POST.get('calculation_id', None)

        if api_key:
            if calculation_id:
                try:
                    calculation = Calculation.objects.get(id=calculation_id)
                except Calculation.DoesNotExist:
                    return Response(CommonSerializer({"success": False,
                                                      "reason": 'CALCULATION_NOT_FOUND',
                                                      'message': 'Расчёт не найден'}).data)

                dataResult = []

                for field in GetFields(calculation.source_dir):
                    result_directory, count_slides = SaveDataField(calculation.source_dir, field)

                    dataResult.append([field, result_directory, count_slides])

                    if 'T' == field:
                        calculation.dir_result_T = result_directory
                    elif 'U' == field:
                        calculation.dir_result_U = result_directory
                    elif 'V' == field:
                        calculation.dir_result_V = result_directory
                    elif 'W' == field:
                        calculation.dir_result_W = result_directory
                    elif 'PNH' == field:
                        calculation.dir_result_W = result_directory

                    calculation.save()

                return Response({'success': True, 'data' : dataResult})
            else:
                return Response(CommonSerializer({'success':    False,
                                                  'reason':     'NOT_ENOUGH_PARAMS',
                                                  'message':    'Недостаточно параметров'}).data) 
        else:
            return Response(CommonSerializer({'success':    False,
                                              'reason':     'WRONG_API_KEY',
                                              'message':    'Неправильный API KEY'}).data)



def ppvrnsflhs(request):
    """ Main page """
    context = {}

    return render(request, 'ppvrnsflhs/ppvrnsflhs.html', context)


def ppvrnsflhs_about(request):
    """ About page """
    context = {}
    try:
        about_text = Page.objects.get(name='ppvrnsflhs_about')
    except Page.DoesNotExist:
        pass
    else:
        context['about_text'] = about_text
    return render(request, 'ppvrnsflhs/about.html', context)

