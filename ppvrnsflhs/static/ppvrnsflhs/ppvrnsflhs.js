"use strict";

const MAIN_URL          = window.location.protocol + "//" + window.location.host + "/api/v1/";
const API_KEY           = 'd837d31970deb03ee35c416c5a66be1bba9f56d3';
const LOAD_FILE         = 'LOAD_FILE';
const CHECKING_FILE     = 'CHECKING_FILE';
const PROCESSING_FILE   = 'PROCESSING_FILE';
const CALCULATION_START = 'CALCULATION_START';
const RESULT            = 'RESULT';

var state = LOAD_FILE;

$('.dropdown-menu a').click(function(event) 
{
    event.preventDefault();
});

$('.carousel').carousel({
    inderval: false,
    loop: false,
})

function chooseTypeView(type, fieldName)
{
    console.log(`Set view: ${type} for ${fieldName}`);

    var rowSlider = $(`#row-slider-${fieldName}`);
    var rowAnimation = $(`#row-animation-${fieldName}`);

    var liSlider = $(`#view-type-slider-${fieldName}`);
    var liAnimation = $(`#view-type-animation-${fieldName}`);

    if (type == 'slides')
    {    
        if (rowAnimation)
            rowAnimation.hide()

        if (rowSlider)
            rowSlider.show();

            liAnimation.removeClass('disabled');
        liSlider.addClass('disabled');
    }
    else if (type == 'animation')
    {
        if (rowSlider)
            rowSlider.hide();

        if (rowAnimation)
            rowAnimation.show()

        liSlider.removeClass('disabled');
        liAnimation.addClass('disabled');
    }


    return false;
}

function createRowType(fieldName)
{
    return `<div class="row" id="row-types-${fieldName}"><div class="col-sm-12">` + 
                '<ul class="nav nav-tabs nav-justified">' +
                    `<li role="presentation" id="view-type-slider-${fieldName}" class="disabled"><a href="" onclick="return chooseTypeView('slides', '${fieldName}');">Slides</a></li>` +
                    `<li role="presentation" id="view-type-animation-${fieldName}"><a href="" onclick="return chooseTypeView('animation', '${fieldName}');">Animation</a></li>` +
                '</ul>' +
            '</div></div>';
}

function createFieldSlider(fieldName, fieldPath, fileCounts)
{
    var items = ''

    for (var index = 1; index < fileCounts + 1; ++index)
        items += `<div class="item${index == 1 ? ' active' : ''}"}><img src="${fieldPath}/${fieldName}-${index}.png"/></div>`

    return `<div id="row-slider-${fieldName}"><div class="col-sm-12">` + 
                `<div id="slider-field-${fieldName}" class="carousel" data-ride="carousel" data-interval="false">` +
                    '<div class="carousel-inner" role="listbox">' +
                        items +
                    '</div>' + 
                '</div>' +
                `<a href="#slider-field-${fieldName}" class="left carousel-control" role="button" data-slide="prev">` + 
                    '<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>' +
                    '<span class="sr-only">Previous</span>' +
                '</a>' +
                `<a href="#slider-field-${fieldName}" class="right carousel-control" role="button" data-slide="next">` + 
                    '<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>' +
                    '<span class="sr-only">Next</span>' +
                '</a>' +
            '</div></div>';
}

function createFieldAnimation(fieldName, fieldPath)
{
    return `<div class="row" id="row-animation-${fieldName}" style="display:none;"><div class="col-sm-12">` + 
                `<img src="${fieldPath}/animation.gif"/>`+
            '</div></div>';
}

function disactiveField()
{
    var currentFormField = $('.active-form-field');

    if (currentFormField)
    {
        currentFormField.hide()
        currentFormField.removeClass('.active-form-field');
    }
}

function chooseField(fieldName)
{
    console.log('Field selected: ' + fieldName)

    disactiveField();

    var formField = $(`#form-field-${fieldName}`);

    if (formField)
    {
        formField.addClass('active-form-field');
        formField.show();
    }

    return false;
}

function createFormField(fieldName, fieldPath, fileCounts)
{
    var rowTypes = createRowType(fieldName);
    var fieldSlider = createFieldSlider(fieldName, fieldPath, fileCounts);
    var fieldAnimation = createFieldAnimation(fieldName, fieldPath);

    return `<div class="form-horizontal" id="form-field-${fieldName}" style="display:none;">` +
                rowTypes + 
                fieldSlider + 
                fieldAnimation +
            '</div>';
}

function createDropdown(data)
{
    var resultRow = $('#data-results-row');

    var buttonDropdown = $(document.createElement('div'));
    buttonDropdown.addClass('form-horizontal');
    buttonDropdown.role = 'form';

    var buttonsValue = ''

    var fieldDiv = $(document.createElement('div'));
    fieldDiv.addClass('form-horizontal');
    fieldDiv.role = 'form';

    for (var index = 0; index < data.length; ++index)
    {
        var fieldName = String(data[index][0]);

        buttonsValue += `<li><a href="" onclick="return chooseField('${fieldName}');">${data[index][0]}</a></li>`;
        
        fieldDiv.append(createFormField(data[index][0], data[index][1], data[index][2]))
    }

    var temp = '<div class="btn-group">' + 
                    '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">' + 
                        'Choose field' + 
                        '<span class="caret"></span>' +
                    '</button>' +
                    '<ul class="dropdown-menu">' +
                        buttonsValue + 
                    '</ul>' + 
                '</div>';

    buttonDropdown.append(temp);

    resultRow.append(buttonDropdown);
    resultRow.append(fieldDiv);
}

function clearActiveTab() 
{
    var loadTab             = $('#load-file-tab');
    var processingFileRow   = $('#data-processing-tab');
    var resultsTab          = $('#data-results-tab');

    loadTab.removeClass("active");
    processingFileRow.removeClass("active");
    resultsTab.removeClass("active");

    console.log('clear active tab');
}

function setActiveTab(tab) 
{
    tab.removeClass("disabled");
    tab.addClass("active");
    console.log('set active');
}

function update_page(current_state, data) 
{
    var loadFileRow        = $('#load-file-row');
    var processingFileRow  = $('#data-processing-row');
    var resultRow          = $('#data-results-row');
    var inputFile          = $('#load-file-input');
    var name               = $('#name-calculation');
    var spinner            = $('#spinner');

    spinner.hide();

    if (current_state == LOAD_FILE) 
    {
         // load file to server
        loadFileRow.show();
        processingFileRow.hide();  
        resultRow.hide();

        setActiveTab($('#load-file-tab'));

        $("#submit-load-file").click(function(event) 
        {
            var loadFileForm = $('#load-file-form');

            loadFileForm.removeClass('has-error');

            if (inputFile[0].files.length > 0)
            {
                state = CHECKING_FILE;
                update_page(state);
            }
            else
            {
                loadFileForm.addClass('has-error');
            }

            event.preventDefault();
        });
    }
    else if (CHECKING_FILE == current_state)
    {
        loadFileRow.show();
        spinner.show();
        processingFileRow.hide();  
        resultRow.hide();

        var files = inputFile[0].files;
        // Create a new FormData object.
        console.log(files[0]);
        var formData = new FormData();
        formData.append('file', files[0]);
        formData.append('name', name.val());
        formData.append('api_key', API_KEY);
        if (formData) 
        {
            $.ajax({
                url: MAIN_URL + 'postprocessing/check_file/',
                method: 'post',
                processData: false,
                contentType: false,
                cache: false,
                data: formData,
                enctype: 'multipart/form-data',
                success: function(response)
                {
                    console.log(response);
                    if (response['success'])
                    {
                        state = PROCESSING_FILE;
                        console.log(response);
                        update_page(state, response);
                    }
                    else
                    {
                        console.log(response);
                        alert(response['message']);
                        state = LOAD_FILE;
                        update_page(state);
                    }

                }, error: function(response)
                {
                    alert("INTERNAL SERVER ERROR: please write to arybin93@gmail.com");
                    console.log(response);
                    state = LOAD_FILE;
                    update_page(state);
                }
            });
        }
    }
    else if (PROCESSING_FILE == current_state)
    {
        clearActiveTab();
        setActiveTab($('#data-processing-tab'));

        loadFileRow.hide();
        processingFileRow.show();
        resultRow.hide();

        // var calculation_id = data['calculation_id'];

        // update calculation
        var formData = new FormData();
        formData.append('calculation_id', data['calculation_id']);
        formData.append('api_key', API_KEY);

        $.ajax({
            url: MAIN_URL + 'postprocessing/post_processing_data/',
            method: 'post',
            processData: false,
            contentType: false,
            cache: false,
            data: formData,
            enctype: 'multipart/form-data',
            success: function(response)
            {
                if (response['success'])
                {
                    console.log(response);
                    state = RESULT;
                    update_page(state, response['data']); 
                }
                else
                {
                    console.log(response);
                    state = LOAD_FILE;
                    update_page(state); 
                }

            }, error: function(response)
            {
                console.log(response);
                alert("INTERNAL SERVER ERROR: please write to arybin93@gmail.com");
                state = LOAD_FILE;
                update_page(state); 
            }
        });

        console.log('Processing file');
    }
    else if (RESULT == current_state)
    {
        clearActiveTab();
        setActiveTab($('#data-results-tab'));

        loadFileRow.hide();
        processingFileRow.hide();
        resultRow.show();

        console.log('Results');

        createDropdown(data);

        console.log(data)
    }
}

// using jQuery
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

$(document).ready(function() 
{
    console.log('ready');

    var loadTab     = $('#submit-load-file');
    var csrftoken   = getCookie('csrftoken');

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

    loadTab.click(function(event) 
    {
        event.preventDefault();
        console.log('Load file');
    });

    update_page(state);
});

(function ($) 
{
    var spinnerVal = $('.spinner input');
    var spinnerPlusBtn = $('.input-group-btn:last-of-type .btn');
    var spinnerMinusBtn = $('.input-group-btn:first-of-type .btn');
    
    spinnerMinusBtn.on( "click", function() {
        var spinnerContainerIndex = $(this).parents('.spinner').get(0);
        var spinnerInput = $(spinnerContainerIndex).find('input');
        
      //If Spinner Value is equal to zero
        if (spinnerInput.val() > '0') {
          //Subtract one from input value
          $(spinnerInput).val( parseInt($(spinnerInput).val(), 10) - 1);
        };
    });
    
    spinnerPlusBtn.on( "click", function() {
         var spinnerContainerIndex = $(this).parents(".spinner").get(0);
         var spinnerInput = $(spinnerContainerIndex).find('input');
           
      //If Spinner Value is less than 6
      if (spinnerInput.val() < '5') {
        //Add one to input value
      $(spinnerInput).val( parseInt($(spinnerInput).val(), 10) + 1);
      }
    });
    
  })(jQuery);