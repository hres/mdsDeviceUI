var limit = 25;
var termsTag = "#terms";
var EMPTY_RESULT = ""; //in case need to add dash for empty cell (accessibility)
var MAX_RESULTS=10000;
var illegal = ["of", "&", "and", "?", "!", "or", "+", "-", "no.","|",",","."];

$(document).ready(function() {
    initTableWet();
});

// This must be a hyperlink
$('#linkExcel').on('click', function (event) {
    ExportTableToCSV.apply(this, [$('#results-table'), 'mdi_result.csv']);
});

/**
 * Creates the url for the search functionality
 * @returns {string}
 */
function getURL() {
    var url = "";
    var term_query = "";
    var q = window.location.search.substr(3);
    _uiSetTermsDisplay(decodeURIComponent(q));
    q=q.split(" ");
    for(var count=0;count<illegal.length;count++){
        var illegal_index = $.inArray(illegal[count], q);
        if (illegal_index  > -1){
            q.splice(illegal_index , 1);
            //reset term search, more than one
            count=count-1;
        }
    }
    q=q.join("%20");
    if(q) {
        term_query = "search=plfts." + "%22"+ q  +"%22"+ "&select=incident&order=incident_id.desc";
    }else{
        term_query="select=incident&order=incident_id.desc";
    }
    url = window.MDI.END_POINT + "?"+term_query+"&limit="+MAX_RESULTS;
    return url;
}

/**
 * Sets the terms UI with the terms values
 * @param q
 * @private
 */
function _uiSetTermsDisplay(q) {
    if (!q) return;
    $(termsTag).text(q);
}


/***
 * Categorizes the term types. Allows to construct query
 * @param termArray
 * @returns {string}
 * @private
 */
function _collectTermTypes(termArray) {
    if (!termArray) return "";
    var result = {};
    //TODO make into a map? or maps for each type
    result.company = [];
    result.type = [];
    result.device = [];
    result.none = [];
    for (var i = 0; i < termArray.length; i++) {
        var terms = (termArray[i]).split("[");

        if (terms && terms.length > 1) {
            var value = $.trim(terms[0]);
            switch ($.trim(terms[1])) {
                case _MDI_DEVICE_TYPE:
                    result.device.push(value);
                    break;
                case _MDI_COMPANY_TYPE:

                    result.company.push(value);
                    break;
                case _MDI_REPORT_TYPE:
                    result.type.push(value);
                    break;
                default:
                   result.none.push(value);
                    break;
            }
        } else {
            if (terms[0].length) {
                result.none.push(terms[0]);
            }
        }
    }
    return result;
}

/**
 * "columnDefs": [
 { "width": "5%"},{ "width": "15%"},{ "width": "15%"},{ "width": "15%"},{ "width": "5%"},{ "width": "10%"},{ "width": "10%"},{ "width": "25%"}],
 */
function initTableWet() {
    //TODO update initialization?
    window['wb-tables'] = {
        "processing": true,
        "autoWidth": false,
        "columnDefs": [
            {"width": "9%", "targets": 7}
        ],
        "ajax": {
            "url": getURL(),
            "dataSrc": '',

            "searching": false,
            "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, 'All']],
            "cache": true
        },
        'bStateSave': true,
        'columns': [
            {data: 'incident.incident_id',
                'render': function (data, type, full, meta) {
                    //4.0.21 wet bug, with nu
                    return ""+data+"";

                }
            },
            {
                'data': 'incident.trade_name',
                'render': function (data, type, full, meta) {
                    return arrayNameDisplay(data);

                }
            },
            {
                'data': 'incident.device_desc_e',
                'render': function (data, type, full, meta) {
                    return deviceDescriptionDisplay(data,full);

                }
            },
            {
                'data': 'incident.company_name',
                'render': function (data, type, full, meta) {
                    return arrayNameDisplay(data);
                }
            },
            {
                'data': 'incident.hazard_severity_code_e',
                'render': function (data, type, full, meta) {
                    return hazardDisplay(data, full);

                }
            },
           /* {
                'data': 'risk_classification',
                'render': function (data, type, full, meta) {

                    return riskNameDisplay(data, full);
                }
            },
            {
                'data': 'incident_type_e',
                'render': function (data, type, full, meta) {
                    return incidentTypeDisplay(data, full);

                }
            },*/
            {
                'data': 'incident.problem_detail',
                'render': function (data, type, full, meta) {
                    return problemDetailDisplay(data, full);

                }
            },
            {
                'data': 'incident.problem_detail',
                'render': function (data, type, full, meta) {
                    return problemDetailCodeTypeDisplay(data, full);

                }
            },
            //code_type_e
            {
                'data': 'incident.receipt_date',
                'render': function (data, type, full, meta) {
                    return '<span>' + trimString(data) + "</span>";

                }
            }
        ]
    }
}
function deviceDescriptionDisplay(data, full) {
    var displayValue = "";

    if (isFrench()) {
        displayValue = full.incident.device_desc_f;//wrong is an arraywerwerwerw
    } else {
        displayValue = full.incident.device_desc_e;
    }
    return (trimString(displayValue));
}



function problemDetailCodeTypeDisplay(data,full){
    var displayName = "";
    var unique = {};
            for (var i = 0; i < full.incident.problem_detail.length; i++) {
                var code=full.incident.problem_detail[i].code_type_e;
                if (isFrench()) code=full.incident.problem_detail[i].code_type_f;
                if (!unique.hasOwnProperty(code)){
                    displayName += code + "<br>";
                    unique[code]=1;
                }
            }

    displayName = displayName.substring(0, displayName.length - 4);
    return ((displayName));
}


function isEnglish() {
    return document.documentElement.lang === "en"
}

function isFrench() {
    return !isEnglish();
}

/**
 * If data is empty ensures it is replaced with an empty string
 * @param data
 * @returns {*}
 */
function trimString(data) {
    if (!data) return EMPTY_RESULT;
    var result = $.trim(data);
    if (!result) result = "-";
    return result

}

//TODO remove, no longer showing the colummn
function riskNameDisplay(data, full) {
    //full.incident.device_detail
    //detail.risk_classification
    if (!full.incident || !full.incident.device_detail) {
        return EMPTY_RESULT;
    }
    var displayName = "";
    var devices = full.incident.device_detail;

    for (var i = 0; i < devices.length; i++) {
        displayName += devices[i].risk_classification + "<br>"
    }
    displayName = displayName.substring(0, displayName.length - 4);

    return displayName;
}

function hazardDisplay(data, full) {
    var displayValue = "";
    if (isFrench()) {
        displayValue = full.incident.hazard_severity_code_f;
    } else {
        displayValue = full.incident.hazard_severity_code_e;
    }
    return (trimString(displayValue));
}

//TO DO delete this as not uses
function incidentTypeDisplay(data, full) {
    var displayValue = "";
    if (isFrench()) {
        displayValue = full.incident.incident_type_f;
    } else {
        displayValue = full.incident.incident_type_e;
    }
    return (trimString(displayValue));
}

function problemDetailDisplay(data, full) {
    var displayName = "";
    var unique = {};
    if (!data || data.length == 0) return "";
    if (isFrench()) {
        for (var i = 0; i < data.length; i++) {
            var code=data[i].desc_f;
            if (!unique.hasOwnProperty(code)){
                displayName += code + "<br>";
                unique[code]=1;
            }
        }
    } else {
        //todo fix replace with map?
        for (var i = 0; i < data.length; i++) {
            var code=data[i].desc_e;
            if (!unique.hasOwnProperty(code)){
                displayName += code + "<br>";
                unique[code]=1;
            }
        }
    }
    displayName = displayName.substring(0, displayName.length - 4);
    return (trimString(displayName));
}

function arrayNameDisplay(data) {
    var displayName = "";
    if (!data) return EMPTY_RESULT;
    if (!Array.isArray(data)) return $.trim(data)
    for (var i = 0; i < data.length; i++) {
        displayName += data[i] + "<br>"
    }
    displayName = displayName.substring(0, displayName.length - 4);
    return displayName;
}

/**
 * Exports table data to a csv
 * @param $table
 * @param filename
 * @constructor
 */
function ExportTableToCSV($table, filename) {

    var $rows = $table.find('tr:has(td),tr:has(th)'),
        tmpColDelim = String.fromCharCode(11), // vertical tab character
        tmpRowDelim = String.fromCharCode(0), // null character

        // actual delimiter characters for CSV format
        colDelim = '","',
        rowDelim = '"\r\n"',

        // Grab text from table into CSV formatted string
        csv = '"' + $rows.map(function (i, row) {
            var $row = $(row), $cols = $row.find('td,th');

            return $cols.map(function (j, col) {
                var $col = $(col), text = $col.text();
                return text.replace(/"/g, '""'); // escape double quotes

            }).get().join(tmpColDelim);

        }).get().join(tmpRowDelim)
            .split(tmpRowDelim).join(rowDelim)
            .split(tmpColDelim).join(colDelim) + '"',
        // Data URI
        csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

    if (window.navigator.msSaveBlob) { // IE 10+
        //alert('IE' + csv);
        window.navigator.msSaveOrOpenBlob(new Blob([csv], {type: "text/plain;charset=utf-8;"}), filename)
    } else {
        $(this).attr({'download': filename, 'href': csvData, 'target': '_blank'});
    }
}

