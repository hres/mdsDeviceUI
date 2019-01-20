"use strict";

const AUTOCOMPLETE_URL = "https://rest-dev.hres.ca/mdi/mdi_search";
const autocompleteLimit = 300;
var resultPageURL = "results.html";
const illegal = ["of", "&", "and", "?", "!", "or", "+", "-", "no."];
const LUCENE_IMPLICIT = "<implicit>";
var SEARCH_BOX_ID = "#search";
$(document).ready(() => {

    /*$( "#search" ).autocomplete({
      appendTo: "#search"
    });
  */
    autocompleteInit()
});

/**
 * Parses the query using lucene. Constructs the terms for the api
 * @param query
 * @returns {string}
 */
function parseQuery(query) {
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
        var prefix="&";
        var suffix="";
        var separator="&"
        if(ptr.operator){
            prefix=prefix+ ptr.operator.toLowerCase()+"(";
            suffix=")";
            separator=",";
        }
        if (ptr.left) {
            result +=  prefix+_getLuceneTerm(ptr.left);
        }
        if (ptr.right) {
            result +=separator+ _getLuceneTerm(ptr.right)+suffix;
        }
        ptr = ptr.right;
    }
    console.log("REsult pasre query"+result);
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


    result = result;
    console.log("_getLuceneTerm "+result);
    return result;
}

//If filters include PostgREST reserved characters(,, ., :, ()) you'll have to surround them in percent encoded double quotes %22 for correct processing.
//GET /people?and=(grade.gte.90,student.is.true,or(age.gte.14,age.is.null)) HTTP/1.1

/**
 * Create the autocomplete url based on the terms the user adds
 * @param term
 * @returns {string}
 */
function getTermQuery(term) {

    //return autocompleteURL + "?or=(or(brand_name.ilike." + term + "*,company_name.ilike." + term + "*),ingredient.ilike." + term + "*)&limit=" + autocompleteLimit;
    //return autocompleteURL + "?or=(or(trade_name.ilike." + term + "*,company_name.ilike." + term + "*),incident_type_e.ilike." + term + "*)&limit=" + autocompleteLimit;
    var temp = AUTOCOMPLETE_URL + "?(incident.trade_name.ilike." + term + "*,incident.company_name.ilike." + term + "*,incident.incident_type_e.ilike." + term + "*)&limit=" + autocompleteLimit;
    console.log(temp);
    return temp
}

/**
 * Gets the raw request and parses it. Used to pass to the results page
 */
function passRequest() {

    var queryString = $(SEARCH_BOX_ID).val();

    require(['proj_dep/vendor/lucene-query-parser.js'], function (lucenequeryparser) {
        // Use the Lucene Query Parser library here
        var queryString = $("#search").val();
        var results = lucenequeryparser.parse(queryString);
        parseQuery(results);
        console.log(results);
    });


    var search = queryString.split(" ");

    illegal.forEach((def) => {

        const i = $.inArray(def, search);

        if (i > -1) search.splice(i, 1);
    });

    /*if (search.length > 0) {

      window.location.href = resultPageURL + "?q=" + search.join("%20");
    }*/
}

var availableTags = [
    "Johnson & Johnson [conpany]",
    "Acme [company]",
    "My hip (id re) [device]",
    "",
    "OR",
    "AND",
    "NOT"
];

function split(val) {
    var temp = val.split(/\s+/);
    console.log("SPlit" + temp)
    return val.split(/\s+/);
}

function extractLast(term) {
    var temp = split(term).pop();
    console.log(term);
    if (temp == ' ') temp = "";
    console.log(temp)
    return temp;
}

function autocompleteInit() {
    $("#search")
    // don't navigate away from the field on tab when selecting an item
        .on("keydown", function (event) {
            console.log(event.keyCode)
            if (event.keyCode === $.ui.keyCode.TAB &&
                $(this).autocomplete("instance").menu.active) {
                event.preventDefault();
            } else if (event.keyCode === $.ui.keyCode.SPACE) {
                $(".ui-menu-item").hide();
                //$(this).autocomplete("instance").menu.inactive;
            }
        })
        .autocomplete({
            minLength: 2,
            source: function (request, response) {
                // delegate back to autocomplete, but extract the last term
                const term = $.trim(request.term)
                //var reg = new RegExp($.ui.autocomplete.escapeRegex(term), "i");
                if (term !== "")
                    response($.ui.autocomplete.filter(
                        availableTags, extractLast(term)));
                //else
                //$( "#search" ).autocomplete( "close" );

            },
            focus: function () {
                // prevent value inserted on focus
                return false;
            },
            select: function (event, ui) {
                console.log(ui)
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
