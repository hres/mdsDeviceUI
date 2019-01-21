
const API_URL = "https://rest.hres.ca/mdi/mdi_search";
const limit = 25;
const termsTag="#terms";
const EMPTY_RESULT=""; //in case need to add dash for empty cell (accessibility)

$(document).ready(() => {
initTableWet();
});

function  getURL(){
    var q=getQueryTermsFromUrl();
    var url="";
    _uiSetTermsDisplay(q);
    if (q) {
       url=_constructURLFromTerms(q);
    } else {
        //TODO any cleanup
    }
    url="https://rest.hres.ca/mdi/mdi_search?select=incident.incident_id&search=eq.recall&limit=1300";//TODO Temp
    url="https://rest.hres.ca/mdi/mdi_search?select=incident.incident_type_e=neq.RECALL&limit=1300";
    return url;
}

/**
 * Sets the terms UI with the terms values
 * @param q
 * @private
 */
function _uiSetTermsDisplay(q){
    if(!q) return;
    $("termsTag").text(q.join(" "));
}

function getQueryTermsFromUrl(){
    var q;
    var queryObj = {};
    const search = window.location.search.substr(1);
    var queries = search.split("&");
    queries.forEach((query) => {

        if (query.indexOf("=") > -1) {
            var qc = query.split("=");
            queryObj[qc[0]] = decodeURIComponent(qc[1]);
        }
    });

    if (queryObj.hasOwnProperty("q")) q = (queryObj.q).split(" ");
    if (queryObj.hasOwnProperty("page") && !isNaN(queryObj.page)) page = parseInt(queryObj.page) - 1;
    //remove brackets
    if(!q) return "";
    for(let i=0;i<q.length;i++){
        let _q=q[i];
        if (_q.indexOf("[") > -1 || _q.indexOf("]") > -1 ||q.length==0){
            q.splice(q.indexOf(_q), 1);
            i=i-1; //dont increment
        }
    }
    return q;
}




function initTableWet() {
    //TODO update initialization?
    window['wb-tables'] = {
        "processing": true,
        "ajax": {
            "url": getURL(),
            "dataSrc":'',
            "searching" : false,
            "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, 'All']],
            "cache": true
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
   if(!data)return EMPTY_RESULT;
   var result=$.trim(data);
   if(!result) result="-";
   return result

}

function riskNameDisplay(data,full){
    //full.incident.device_detail
    //detail.risk_classification
    if(!full.incident || !full.incident.device_detail){
        return EMPTY_RESULT;
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
    if(!data) return EMPTY_RESULT;
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
function _constructURLFromTerms(q) {

    var url = API_URL;
    if (q[0].length > 0) { //TODO hacks
        url = API_URL + "?select=incident.incident_id";
        q.forEach((_q) => {
            //https://rest-dev.hres.ca/mdi/mdi_search?select=incident.incident_id&search=fts.123
            //https://rest-dev.hres.ca/mdi/mdi_search?select=incident.incident_id&search=fts.onetouch&search=fts.ultra&search=fts.blood&offset=0&limit=25
            url += ("&search=fts." + _q);
        });
    } else {
        url = API_URL + "?";
    }

    //url+="&offset="+page;
    //url+="&limit="+limit;
    console.log(url);
    return url;
}

