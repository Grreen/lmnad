"use strict";

const MAIN_URL = window.location.protocol + "//" + window.location.host + "/api/v1/";
const KEY = 'd837d31970deb03ee35c416c5a66be1bba9f56d3';
const LOAD_FILE = 'LOAD_FILE';
const PARSE_FILE = 'PARSE_FILE';
const CALCULATION_START = 'CALCULATION_START';
const RESULT = 'RESULT';

var state = LOAD_FILE;

function generate_parse_form(data) {
    var loadedDataTable = $('#loaded-data-table');
    var mappingFields = $('#mapping-data-table');
    var maxRow = $('#max_row');

    var first_row = '';
    $.each(data['result'], function(index, value) {
        if (index == 0) {
            first_row = value;
        }
        var tr = $(document.createElement('tr'));
        $.each(value, function(index, value) {
            tr.append('<th scope="row">' + value +'</th>');
        });
        loadedDataTable.append(tr);
    });
    maxRow.html('Всего строк: ' + data['max_row']);

    // mappingFields
    $.each(first_row, function(index, value) {
        var tr = $(document.createElement('tr'));
        tr.append('<td scope="row"><h4>' + value +'</h4></td>');
        var id = 'field-' + index;
        tr.append('<td scope="row"><div class="form-group">' +
            '<div class="form-group">' +
            '<select class="form-control" name="mapping" id='+ id + '>' +
            '<option value="---">---</option>' +
            '<option value="lon">Longitude</option>' +
            '<option value="lat">Latitude</option>' +
            '<option value="max_depth">Max depth</option>' +
            '<option value="depth">Depth</option>' +
            '<option value="temperature">Temperature</option>' +
            '<option value="salinity">Salinity</option>' +
            '<option value="density">Density</option>' +
            '<option value="bvf">Brant-Vaisala Frequency</option>' +
            '</select></div></div></td>');
        mappingFields.append(tr);
    });
}

function send(job_id) {
    var resultRow = $('#result-row');
    $.ajax({
        url: MAIN_URL + 'calculation/status/',
        type: "get",
        data: {
            job_id: job_id,
            api_key: KEY
        },
        success:function(data)
        {
            console.log(data);
            if (data['success']) {
                // show link for load result file
                resultRow.append('<a href="'+ data['result']+ '">Файл с результатом</a>');
            }
            //Send another request in 5 seconds.
            setTimeout(function(){
                send(job_id);
            }, 5000);
        }
    });
}

function clearActiveTab() {
    var loadTab = $('#load-file-tab');
    var parseTab = $('#parse-file-tab');
    var startTab = $('#start-tab');
    var resultsTab = $('#results-tab');
    loadTab.removeClass("active");
    parseTab.removeClass("active");
    startTab.removeClass("active");
    resultsTab.removeClass("active");
    console.log('clear active tab');
}

function setActiveTab(tab) {
    tab.removeClass("disabled");
    tab.addClass("active");
    console.log('set active');
}

function update_page(current_state, data) {
    var loadFileRow = $('#load-file-row');
    var parseFileRow = $('#parse-file-row');
    var startRow = $('#start-row');
    var resultRow = $('#result-row');
    var inputFile = $('#load-file-input');
    var separator = $('#separator');
    var name = $('#name-calculation');
    var maxRow = $('#max_row');
    var startFrom = $('#start-from');
    var mode = $('#mode');
    var email = $('#email');

    if (current_state == LOAD_FILE) {
         // load file to server
        loadFileRow.show();
        parseFileRow.hide();
        startRow.hide();
        resultRow.hide();
        $('#load-file-tab').addClass("active");

        $("#submit-load-file").click(function(event) {
            clearActiveTab();
            setActiveTab($('#parse-file-tab'));
            event.preventDefault();
            // Get the selected files from the input.
            var files = inputFile[0].files;
            // Create a new FormData object.
            var formData = new FormData();
            formData.append('file', files[0]);
            formData.append('separator', separator.val());
            formData.append('name', name.val());
            formData.append('api_key', KEY);
            if (formData) {
                $.ajax({
                    url: MAIN_URL + 'calculation/load_file/',
                    method: 'post',
                    processData: false,
                    contentType: false,
                    cache: false,
                    data: formData,
                    enctype: 'multipart/form-data',
                    success: function(response){
                        state = PARSE_FILE;
                        update_page(state, response);
                    }, error: function(){
                        alert("INTERNAL SERVER ERROR: please write to arybin93@gmail.com");
                    }
                });
            }
        });
    } else if (current_state == PARSE_FILE) {
        console.log('Parse file');
        loadFileRow.hide();
        parseFileRow.show();
        startRow.hide();

        if (data['success'] == true) {
            generate_parse_form(data);
            var calculation_id = data['id'];
            $("#submit-parse-file").click(function(event) {
                clearActiveTab();
                setActiveTab($('#start-tab'));
                event.preventDefault();
                loadFileRow.hide();
                parseFileRow.hide();

                // parse mapping fields
                var mapping_fields = $('select[name=mapping]');
                var mapping = [];
                $.each(mapping_fields, function(index, value) {
                    mapping[index] = $(this).val();
                });

                // update calculation
                var formData = new FormData();
                formData.append('parse_from', startFrom.val());
                formData.append('parse_field', mapping);
                formData.append('calc_id', calculation_id);
                formData.append('api_key', KEY);
                if (formData) {
                    $.ajax({
                        url: MAIN_URL + 'calculation/parse_file/',
                        method: 'post',
                        processData: false,
                        contentType: false,
                        cache: false,
                        data: formData,
                        enctype: 'multipart/form-data',
                        success: function(response) {
                            state = CALCULATION_START;
                            update_page(state, response);
                        }, error: function(){
                            alert("INTERNAL SERVER ERROR: please write to arybin93@gmail.com");
                        }
                    });
                }
            });
        } else {
            maxRow.html(data['max_row']);
        }
    } else if (current_state == CALCULATION_START) {
        startRow.show();
        if (data['success'] == true) {
            calculation_id = data['id'];

            $("#submit-start").click(function(event) {
                clearActiveTab();
                setActiveTab($('#results-tab'));
                startRow.hide();
                resultRow.show();
                event.preventDefault();

                // update and start calculation
                var formData = new FormData();
                formData.append('email', email.val());
                formData.append('mode', mode.val());
                formData.append('calc_id', calculation_id);
                formData.append('api_key', KEY);
                if (formData) {
                    $.ajax({
                        url: MAIN_URL + 'calculation/start_calculation/',
                        method: 'post',
                        processData: false,
                        contentType: false,
                        cache: false,
                        data: formData,
                        enctype: 'multipart/form-data',
                        success: function(response) {
                            state = RESULT;
                            update_page(state, response);
                        }, error: function(){
                            alert("INTERNAL SERVER ERROR: please write to arybin93@gmail.com");
                        }
                    });
                }
            });
        } else {
            alert(data['message']);
        }
    } else if (state == RESULT) {
        if (data['success'] == true) {
            console.log(data['result']);
            $('#in_process').hide();
            // check result by job_id
            send(data['job_id']);
        } else {
            alert(data['message']);
        }
    }
}


$(document).ready(function() {
    console.log('ready');
    // class = "active"
    // class = "disable"
    var loadTab = $('#load-file-tab');
    var parseTab = $('#parse-file-tab');
    var startTab = $('#start-tab');
    var resultsTab = $('#results-tab');

    var loadFileRow = $('#load-file-row');
    var parseFileRow = $('#parse-file-row');

    loadTab.click(function(event) {
        event.preventDefault();
        console.log('Load tab');

        if (state == PARSE_FILE) {
            parseTab.removeClass("active");
            loadTab.addClass("active");
        }
    });
    parseTab.click(function(event) {
        event.preventDefault();
        console.log('Parse tab');
    });
    startTab.click(function(event) {
        event.preventDefault();
        console.log('Start tab');
    });
    resultsTab.click(function(event) {
        event.preventDefault();
        console.log('Result tab');
    });

    update_page(state);
});