var _MDI=window.MDI;

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
    var illegal = ["of", "&", "and", "?", "!", "or", "+", "-", "no.","|",",","."];
    var q = window.location.search.substr(3);
    q=_checkForLang(q);
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
    url = _MDI.END_POINT + "?"+term_query+"&limit="+_MDI.MAX_RESULTS;
    return url;
}

/**
 * Checks for the addition of the language tag
 * @param query -string to process
 * @returns {string}
 * @private
 */
function _checkForLang(query){
    if(!query) return query;
    var index=query.lastIndexOf("&");
    var testString=query.substring(index,query.length-1);
    if(testString.indexOf("lang")>-1){
        return query.substring(0,index);
    }
    return query;
}

/**
 * Sets the terms UI with the terms values
 * @param q
 * @private
 */
function _uiSetTermsDisplay(q) {
    if (!q) return;
    $("#"+_MDI.TERMS_TAG).text(q);
}

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
            {
                'data': 'incident.receipt_date',
                'render': function (data, type, full, meta) {
                    return '<span>' + $.trim(data) + "</span>";

                }
            }
        ]
    }
}
function deviceDescriptionDisplay(data, full) {
    var displayValue = "";
    if (isFrench()) {
        displayValue = full.incident.device_desc_f;
    } else {
        displayValue = full.incident.device_desc_e;
    }
    return ($.trim(displayValue));
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



function hazardDisplay(data, full) {
    var displayValue = "";
    if (isFrench()) {
        displayValue = full.incident.hazard_severity_code_f;
    } else {
        displayValue = full.incident.hazard_severity_code_e;
    }
    return ($.trim(displayValue));
}


function problemDetailDisplay(data, full) {
    var displayName = "";
    var unique = {};
    var code="";
    if (!data || data.length === 0) return "";
    if (isFrench()) {
        for (var i = 0; i < data.length; i++) {
            code=data[i].desc_f;
            if (!unique.hasOwnProperty(code)){
                displayName += code + "<br>";
                unique[code]=1;
            }
        }
    } else {
        //todo fix replace with map?
        for (var j = 0; j < data.length; j++) {
            code=data[j].desc_e;
            if (!unique.hasOwnProperty(code)){
                displayName += code + "<br>";
                unique[code]=1;
            }
        }
    }
    displayName = displayName.substring(0, displayName.length - 4);
    return ($.trim(displayName));
}

function arrayNameDisplay(data) {
    var displayName = "";
    if (!data) return "";
    if (!Array.isArray(data)) return $.trim(data);
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

