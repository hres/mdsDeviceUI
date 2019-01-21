"use strict";

const AUTOCOMPLETE_URL = "https://rest.hres.ca/mdi/mdi_search";
const AUTOCOMPLETE_QUERY_LIMIT = 300;
const MAX_AUTOCOMPLETE_LIST=10;
var resultPageURL = "results.html";
const illegal = ["of", "&", "and", "?", "!", "or", "+", "-", "no."];
const LUCENE_IMPLICIT = "<implicit>";
var SEARCH_BOX_ID = "#search";
var SPACE_STRING = " ";


$(document).ready(() => {

    autocompleteInit()
});

/**
 * Parses the query using lucene. Constructs the terms for the api
 * @param query - valid lucene query
 * @returns {string}
 */
function _parseQuery(query) {
    var result = "";
    console.log(query);
    if (!query || !query.left) return result;
    var ptr = query;

    //process the first one in case there is no right
    if (!ptr.right) {
        console.log("no pointer right")
        result += _getLuceneTerm(ptr);
    }
    while (ptr && ptr.right) {
        var prefix = "";
        var suffix = "";
        var separator = "";
        var operator = "";
        if (ptr.operator) operator = ptr.operator.toLowerCase();
        /* if(ptr.operator){
             prefix=prefix+ ptr.operator.toLowerCase()+"(";
             suffix=")";
             separator=",";
         }*/
        if (ptr.left) {
            result += prefix + _getLuceneTerm(ptr.left) + SPACE_STRING + operator + SPACE_STRING;
        }
        if (ptr.right && !ptr.right.left) {
            result += separator + _getLuceneTerm(ptr.right) + suffix;
        }
        ptr = ptr.right;
    }
    console.log("Result pasre query " + result);
    return result;

}

/**
 * Expectes a lucene formatted term
 * @param node
 * @private
 */
function _getLuceneTerm(node) {
    var isField = false;
    var result = "";
    console.log(node)
    if (node.field !== LUCENE_IMPLICIT) {
        isField = true;
    }
    if (node.term) {
        //ilike
    }
    if (isField) {
        //todo encode as URL or wait till end?
        result = node.field + "=ilike." + node.term;
    } else {
        //TODO basically no column identifier
    }
    console.log("_getLuceneTerm " + result);
    return result;
}
/**
 * Create the autocomplete url based on the terms the user adds
 * @param term
 * @returns {string}
 */
function getTermQuery(term) {

    //var temp = AUTOCOMPLETE_URL + "?(incident.trade_name.ilike." + term + "*,incident.company_name.ilike." + term + "*,incident.incident_type_e.ilike." + term + "*)&limit=" + AUTOCOMPLETE_LIMIT;
    if (document.documentElement.lang == "fr") {
        return AUTOCOMPLETE_URL + "?(incident.trade_name.ilike." + term + "*,incident.incident_type_f.ilike."  + term + "*)&limit=" + AUTOCOMPLETE_QUERY_LIMIT;
    }
    return AUTOCOMPLETE_URL + "?(incident.trade_name.ilike." + term +"*,incident.company_name.ilike." + term + "*,incident.incident_type_e.ilike." + term  + "*)&limit=" + AUTOCOMPLETE_QUERY_LIMIT;

   // console.log(temp);
    //return temp
}

function processAutoCompleteTerms(term,data){
        var keywords = $.map(data, (obj) => {
            console.log(obj)
            if (document.documentElement.lang == "fr") {
                return  [obj.incident.trade_name + " [device]",,obj.incident.company_name + " [company]", obj.incident.incident_type_f + " [type]"];
            }
            else {
                return  [obj.incident.trade_name + " [device]",obj.incident.company_name + " [company]", obj.incident.incident_type_e + " [type]"];
            }
        });
        console.log(keywords);
        var suggestions = [];
        keywords.forEach((keyword) => {
            if (keyword.toLowerCase().indexOf(term) > -1) {
                const pushKeyword = keyword.toLowerCase()
                if (!suggestions.includes(pushKeyword)) suggestions.push(pushKeyword);
            }
        });
        return suggestions;
}

/**
 * Gets the raw request and parses it. Used to pass to the results page
 */
function passRequest() {

    var queryString = $(SEARCH_BOX_ID).val();
    var results = "";
    require(['proj_dep/vendor/lucene-query-parser.js'], function (lucenequeryparser) {
        // Use the Lucene Query Parser library here
        var queryString = $("#search").val();

        try {
            results = lucenequeryparser.parse(queryString);
        } catch (e) {
            console.error("There was an error with the query " + e)
            results = queryString; //TODO make a default query?
        }
        _parseQuery(results);
        console.log(results);
    });

    var search = queryString.split(" ");

    illegal.forEach((def) => {
        const i = $.inArray(def, search);
        if (i > -1) search.splice(i, 1);
    });
    if (search.length > 0) {
        window.location.href = resultPageURL + "?q=" + search.join("%20");
    }
}


function split(val) {
   //splitting on space
    return val.split(/\s+/);
}

function extractLast(term) {
    var temp = split(term).pop();
    console.log(term);
    if (temp == ' ') temp = "";
    //console.warn("Last term'+temp)
    return temp;
}

function autocompleteInit() {
    $("#search")
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
                }
                $.ajax({
                    url: getTermQuery(term),
                    dataType: "json",
                    cache: true,
                    success: function (data) {
                        var dataList=processAutoCompleteTerms(term,data);
                        dataList.splice(MAX_AUTOCOMPLETE_LIST);
                        response(dataList);
                    }
                });
            },
            minLength: 2,
            search: function () {
                // custom minLength
                var term = extractLast(this.value);
                if (term.length < 2) {
                    return false;
                }
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
                terms.push(ui.item.value);
                // add placeholder to get the comma-and-space at the end
                terms.push("");
                this.value = terms.join(" ");
                return false;
            }
        });
}

/**
 * Manages the state of the search ui
 */
function updateDateState() {
    if ($("#is-date-range").is(":checked")) {
        $("#date-group").toggleClass('hidden visible');
    } else {
        $("#date-group").toggleClass('visible hidden');
        $("#startdate").val(null);
        $("#enddate").val(null);
    }
}
