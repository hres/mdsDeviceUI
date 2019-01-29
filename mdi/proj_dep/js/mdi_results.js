var _MDI=window.MDI;
//TODO clean up table initialization do it manually?
$(document).ready(function() {
    //set attribute dynamically for language
    $("#results-table").attr("data-wb-tables",_MDI.RESULTS_TABLE);
    initTableWet();
});

// This must be a hyperlink
$('#linkExcel').on('click', function (event) {
    ExportTableToCSV.apply(this, [$('#results-table'), 'mdi_imm.csv']);
});

/**
 * Creates the url for the search functionality
 * Remove characters that interfere with search success
 * @returns {string}
 */
function getURL() {
    var url = "";
    var term_query = "";
    var illegal = ["of", "&", "and", "?", "!", "or", "+", "-", "no.","|",",","."];
    var q = window.location.search.substr(3);
    var terms;
    q=_checkForLang(q);
    _uiSetTermsDisplay(decodeURIComponent(q));
    terms=q.split(" ");
    for(var count=0;count<illegal.length;count++){
        var illegal_index = $.inArray(illegal[count], terms);
        if (illegal_index  > -1){
            terms.splice(illegal_index , 1);
            //reset term search, more than one
            count=count-1;
        }
    }
    q=terms.join("%20");
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
        "destroy": true,
        "processing": true,
        "autoWidth": false,
        "columnDefs": [
            {"width": "9%", "targets": 7}
        ],
        "ajax": {
            "url": getURL(),
            "dataSrc": '',

            "searching": false,
            "cache": true
        },
        'bStateSave': false,
        "order": [[ 0, "desc" ]],
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

/**
 * For the Device type, display lang specific data
 * @param data- the field/column triggered in the tale def
 * @param full- the entire incident record
 * @returns {string}
 */
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

/**
 * Displays the data for code type column
 * Concatenates the multiple lang specific terms
 * @param data -the triggered data column
 * @param full- the full incident json
 * @returns {string}
 */
function problemDetailDisplay(data, full) {
    var displayName = "";
    var unique = {};
    var code="";
    if (!data || data.length === 0) return "";
    var tag="desc_e";
    if(isFrench()){
        tag="desc_f"
    }
    for (var i = 0; i < data.length; i++) {
        code=data[i][tag];
        if (!unique.hasOwnProperty(code)){
            displayName += code + "<br>";
            unique[code]=1;
        }
    }
    displayName = displayName.substring(0, displayName.length - 4);
    return ($.trim(displayName));
}

/**
 * Concats array data for dsiplay. Each on new line
 * @param data- array to process
 * @returns {string}
 */
function arrayNameDisplay(data) {
    var displayName = "";
    if (!data) return "";
    if (!Array.isArray(data)) return $.trim(data);
    for (var i = 0; i < data.length; i++) {
        displayName += data[i] +" "+ "<br>";
        //TODO relying on the space for csv download
    }
    displayName = displayName.substring(0, displayName.length - 4);
    return displayName;
}

/**
 * Exports table data to a csv- function take from review Desicions
 * @param $table -the table to process
 * @param filename -file
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

