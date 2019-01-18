
const documentURL = "https://rest-dev.hres.ca/mdi/mdi_search";
const limit = 25;

$(document).ready(() => {

initTableWet();

});

function  getURL(){
    return "https://rest-dev.hres.ca/mdi/mdi_search?select=incident.incident_id&search=fts.recall&limit=400"
}
function initTableWet() {

    window['wb-tables'] = {
        'processing': true,
        'ajax': {
            'url': getURL(),
            dataSrc:'',
            "searching" : false,
            'cache': true
        },
        'bStateSave': true,
        'columns': [
            {data:'incident.incident_id'},
            {
                'data': 'incident.trade_name',
                'render': function (data, type, full, meta) {
                    return arrayNameDisplay(data);

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
                    return hazardDisplay(data,full);

                }
            },
            {
                'data': 'risk_classification',
                'render': function (data, type, full, meta) {

                    return riskNameDisplay(data,full);
                }
            },
            {
                'data': 'incident_type_e',
                'render': function (data, type, full, meta) {
                    return incidentTypeDisplay(data,full);

                }
            },
            {
                'data': 'incident.receipt_date',
                'render': function (data, type, full, meta) {
                    return trimString(data);

                }
            }
        ]
    }
}

function isEnglish(){
    return  document.documentElement.lang === "en"
}

function isFrench(){
    return !isEnglish();
}

/**
 * If data is empty ensures it is replaced with an empty string
 * @param data
 * @returns {*}
 */
function trimString(data) {
   if(!data)return "";
   return $.trim(data);

}

function riskNameDisplay(data,full){
    //full.incident.device_detail
    //detail.risk_classification
    if(!full.incident || !full.incident.device_detail){
        return "";
    }
    var displayName="";
    var devices=full.incident.device_detail;

    for(var i=0;i<devices.length;i++){
        displayName+=devices[i].risk_classification+"<br>"
    }
    displayName=displayName.substring(0,displayName.length-4);

    return displayName;
}

function hazardDisplay(data,full){
    var displayValue="";
    if(isFrench()){
        displayValue=full.incident.hazard_severity_code_f;
    }else{
        displayValue=full.incident.hazard_severity_code_e;
    }
    return(trimString(displayValue));
}

function incidentTypeDisplay(data,full){
    var displayValue="";
    if(isFrench()){
        displayValue=full.incident.incident_type_f;
    }else{
        displayValue=full.incident.incident_type_e;
    }
    return(trimString(displayValue));
}


function arrayNameDisplay(data){
    var displayName="";
    if(!data) return "";
    if(!Array.isArray(data)) return $.trim(data)
    for(var i=0;i<data.length;i++){
        displayName+=data[i]+"<br>"
    }
    displayName=displayName.substring(0,displayName.length-4);
    return displayName;
}


/**
 {data: 'incident.receipt_date'}
 ,
 *
 * @constructor
 */

function OnFail(){

    console.warn("failed");
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
        window.navigator.msSaveOrOpenBlob(new Blob([csv], { type: "text/plain;charset=utf-8;" }), filename)
    }
    else {
        $(this).attr({ 'download': filename, 'href': csvData, 'target': '_blank' });
    }
}

