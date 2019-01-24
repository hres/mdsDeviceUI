"use strict";

const illegal = ["of", "&", "and", "?", "!", "or", "+", "-", "no."];

const SEARCH_BOX_ID = "#search";

function split(val) {
    //splitting on space
    return val.split(/]\s+/);
}

function splitSpace(val) {
    //splitting on space
    return val.split(/\s+/);
}

function extractLast(term) {
    var temp = split(term).pop();
    if (temp == ' ') temp = "";
    return temp;
}

/**
 * Gets the raw request and parses it. Used to pass to the results page
 */
function passRequestToResults() { //TODO delete

    var queryString = $(SEARCH_BOX_ID).val();
    var results = "";

    queryString = $.trim(queryString);

        //window.location.href = resultPageURL + "?q=" + search.join("%20");
        window.location.href = _MDI_RESULTS_PAGE_NAME + "?q=" + encodeURI(queryString);
}



/**
 * Manages the state of the search ui
 */
/*function updateDateState() {
    if ($("#is-date-range").is(":checked")) {
        $("#date-group").toggleClass('hidden visible');
    } else {
        $("#date-group").toggleClass('visible hidden');
        $("#startdate").val(null);
        $("#enddate").val(null);
    }
}*/
