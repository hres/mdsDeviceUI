"use strict";

var illegal = ["of", "&", "and", "?", "!", "or", "+", "-", "no.","|",",","."];
var illegal2=["&",","];
var SEARCH_BOX_ID = "#search";
var AUTOCOMPLETE_URL = window.MDI.END_POINT;
var AUTOCOMPLETE_QUERY_LIMIT = 600;
var MAX_AUTOCOMPLETE_LIST = 8;
var DELIMITER=",";

$(document).ready(function(){
    autocompleteInit()
});


function split(val) {
    //splitting on space
    //return val.split(/\s+,/);
    return val.split(DELIMITER);
}


function extractLast(term) {
    var temp = split(term).pop();
    return $.trim(temp);
}

/**
 * Gets the raw request and parses it. Used to pass to the results page
 */
function passRequestToResults() { //TODO delete

    var queryString = $(SEARCH_BOX_ID).val();
    var results = "";
    window.location.href = window.MDI.RESULTS_PAGE_NAME + "?q=" + encodeURIComponent(queryString);
}


function removeIllegals(terms){
    var search = terms.substr(0,1);
    var i=$.inArray(search,illegal2);
    if (i > -1)
        console.log(terms.substr(1,terms.length-1));
        return terms.substr(1,terms.length-1);
    return terms;
}

function getTermQuery(term) {

    //term=removeIllegals($.trim(term));
    if(term.indexOf(" ")===-1){
        //single term search
        return AUTOCOMPLETE_URL + "?or=(incident-%3E%3Ecompany_name.ilike.*" + term + "*,incident-%3E%3Etrade_name.ilike.*"  + term + "*)" + "&limit=" + AUTOCOMPLETE_QUERY_LIMIT;
    }
    return AUTOCOMPLETE_URL + "?or=(incident-%3E%3Ecompany_name.plfts." + term + ",incident-%3E%3Etrade_name.plfts." + term + ")" + "&limit=" + AUTOCOMPLETE_QUERY_LIMIT;
}

/**
 * After recieving the query, parse the terms and identify them to users
 * @param term
 * @param data
 * @returns {Array}
 */
function processAutoCompleteTerms(query, data) {
    var suggestions = [];
    var unique_company = {};
    var unique_trade = {};
    if (!query) return [];
    var term=query.toLowerCase();

    //TODO cleanup nested map object maybe?
    for (var i = 0; i < data.length; i++) {
        var inc_trade = "";
        var obj = data[i];
        if (obj.incident.trade_name) {
            for (var j = 0; j < obj.incident.trade_name.length; j++) {
                var word = obj.incident.trade_name[j];
                if (word.toLowerCase().indexOf(term) > -1) {
                    if (!unique_trade.hasOwnProperty(word)) {
                        suggestions.push((word + " " + window.MDI.START_AUTO +window.MDI.DEVICE_TYPE +window.MDI.END_AUTO));
                        unique_trade[word] = 1;
                        if (suggestions.length >= MAX_AUTOCOMPLETE_LIST) return suggestions;
                    }
                }
            }
        }
        if (obj.incident.company_name) {
            for (var j = 0; j < obj.incident.company_name.length; j++) {
                var word = obj.incident.company_name[j];
                if (word.toLowerCase().indexOf(term) > -1) {
                    if (!unique_company.hasOwnProperty(word)) {
                        suggestions.push((word + " " + window.MDI.START_AUTO +window.MDI.COMPANY_TYPE +window.MDI.END_AUTO));
                        unique_company[word] = 1;
                        if (suggestions.length >= MAX_AUTOCOMPLETE_LIST) return suggestions;
                    }
                }
            }
        }
    }
    return suggestions;
}



function autocompleteInit() {
    $(SEARCH_BOX_ID )
    // don't navigate away from the field on tab when selecting an item
        .on("keydown", function (event) {

            if (event.keyCode === $.ui.keyCode.TAB &&
                $(this).autocomplete("instance").menu.active) {
                event.preventDefault();
            } else if (event.keyCode === $.ui.keyCode.SPACE) {
                $(".ui-menu-item").hide();
            }
        })
        .autocomplete({
            source: function (request, response) {
                // delegate back to autocomplete, but extract the last term
                var term = $.trim(request.term);
                if (term) {
                    term = extractLast(request.term)
                    term=removeIllegals(term);
                }
                $.ajax({
                    url: getTermQuery(term),
                    dataType: "json",
                    cache: true,
                    success: function (data) {
                        var dataList = processAutoCompleteTerms(term, data);
                        dataList.splice(MAX_AUTOCOMPLETE_LIST);
                        response(dataList);
                    }
                });
            },
            minLength: 0,
            search: function () {
                var term = extractLast(this.value);
            },
            focus: function () {
                // prevent value inserted on focus
                return false;
            },
            select: function (event, ui) {
                var terms = split(this.value);
                // remove the current input
                terms.pop();
                // add the selected item
                for (var i = 0; i < terms.length; i++) {
                    terms[i] = $.trim(terms[i])+" "+DELIMITER+" ";
                }
                terms.push(_trimAutocompleteType(ui.item.value));
                // add placeholder
                terms.push(DELIMITER+" ");
                this.value = terms.join("");
                return false;
            }
        });
}

function _trimAutocompleteType(value){
    if(!value) return "";
    var location=value.lastIndexOf(window.MDI.START_AUTO);
    if(location>-1){
        return (value.substring(0,location));
    }else if(location=value.lastIndexOf(window.MDI.END_AUTO>-1)){
        return (value.substring(0,location));
    }
    return value;
}
