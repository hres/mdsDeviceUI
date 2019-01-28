"use strict";
var _MDI=window.MDI; //get globals

$(document).ready(function() {
        //update URL for the env.
        var baseUrl=window.location.protocol + "//" + window.location.host;
        var disclaimer = baseUrl + _MDI.DISCLAIMER_PAGE;
        var zipFile = baseUrl+ _MDI.EXTRACT_PATH;
        $("#"+_MDI.DISCLAIM_TAG).attr("href", disclaimer);
        $("#"+_MDI.ZIP_TAG).attr("href", zipFile);
    });

    /**
     * Splits a string using the autocomplete delimiter
     * @param val input string
     * @returns {Array|*|never|string[]|null}
     */
    function split(val) {
        return val.split(_MDI.AUTOCOMPLETE_DELIMITER);
    }

    /**
     * Extracts the last term in a string based on delmiter
     * @param term -string to parse
     * @returns {string} -the rightmost tern
     */
    function extractLast(term) {
        if (!term) return "";
        var temp = split(term).pop();
        return $.trim(temp);
    }

    /**
     * Gets the raw request and parses it. Used to pass to the results page
     */
    function passRequestToResults() { //TODO delete

        var queryString = $(_MDI.SEARCH_BOX_ID).val();
        var results = "";
        window.location.href = _MDI.RESULTS_PAGE_NAME + "?q=" + encodeURIComponent(queryString);
    }

    function removeLeadingIllegal(terms) {
        var search = terms.substr(0, 1);
        var i = $.inArray(search, _MDI.ILLEGAL_AUTO);
        if (i > -1) {
            return terms.substr(1, terms.length - 1);
        }
        return terms;
    }

    /**
     * gets the query for autocomplete lookups
     * @param term -the string to search for
     * @returns {string} end point with appropriate query
     */
    function getTermQuery(term) {
        if (term.indexOf(" ") === -1) {
            //single term search
            return _MDI.END_POINT + "?or=(incident-%3E%3Ecompany_name.ilike.*" + term + "*,incident-%3E%3Etrade_name.ilike.*" + term + "*)" + "&limit=" + _MDI.AUTOCOMPLETE_QUERY_LIMIT;
        }
        return _MDI.END_POINT + "?or=(incident-%3E%3Ecompany_name.plfts." + term + ",incident-%3E%3Etrade_name.plfts." + term + ")" + "&limit=" + _MDI.AUTOCOMPLETE_QUERY_LIMIT;
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
        var term = query.toLowerCase();

        //TODO cleanup nested map object maybe?
        for (var i = 0; i < data.length; i++) {
            var inc_trade = "";
            var obj = data[i];
            if (obj.incident.trade_name) {
                for (var j = 0; j < obj.incident.trade_name.length; j++) {
                    var word = obj.incident.trade_name[j];
                    if (word.toLowerCase().indexOf(term) > -1) {
                        if (!unique_trade.hasOwnProperty(word)) {
                            suggestions.push((word + " " + _MDI.START_AUTO + _MDI.DEVICE_TYPE + _MDI.END_AUTO));
                            unique_trade[word] = 1;
                            if (suggestions.length >= _MDI.MAX_AUTOCOMPLETE_LIST) return suggestions;
                        }
                    }
                }
            }
            if (obj.incident.company_name) {
                for (var j = 0; j < obj.incident.company_name.length; j++) {
                    var word = obj.incident.company_name[j];
                    if (word.toLowerCase().indexOf(term) > -1) {
                        if (!unique_company.hasOwnProperty(word)) {
                            suggestions.push((word + " " + _MDI.START_AUTO + _MDI.COMPANY_TYPE + window._MDI.END_AUTO));
                            unique_company[word] = 1;
                            if (suggestions.length >= _MDI.MAX_AUTOCOMPLETE_LIST) return suggestions;
                        }
                    }
                }
            }
        }
        return suggestions;
    }

    function _trimAutocompleteType(value) {
        if (!value) return "";
        var location = value.lastIndexOf(window.MDI.START_AUTO);
        if (location > -1) {
            return (value.substring(0, location));
        } else if (location = value.lastIndexOf(window.MDI.END_AUTO > -1)) {
            return (value.substring(0, location));
        }
        return value;
    }


    /**
     * Used by the jquery UI autocomplete to get and list terms
     * @param request
     * @param response
     */
    function getAutoTerms(request, response) {
        // delegate back to autocomplete, but extract the last term
        var term = $.trim(request.term);
        if (term) {
            term = extractLast(request.term)
            term = removeLeadingIllegal(term);
        }
        $.ajax({
            url: getTermQuery(term),
            dataType: "json",
            cache: true,
            success: function (data) {
                var dataList = processAutoCompleteTerms(term, data);
                dataList.splice(_MDI.MAX_AUTOCOMPLETE_LIST);
                return response(dataList);
            }
        });
    }

    /**
     * Used for selection of autocomplete terms by the JQuery UI plugin
     * @param ui
     * @param event
     * @param value
     */
    function selectAutoTerms(ui, event, value) {
        var terms = split(value);
        // remove the current input
        terms.pop();
        // add the selected item
        for (var i = 0; i < terms.length; i++) {
            terms[i] = $.trim(terms[i]) + " " + _MDI.AUTOCOMPLETE_DELIMITER + " ";
        }
        terms.push(_trimAutocompleteType(ui.item.value));
        // add placeholder
        terms.push(_MDI.AUTOCOMPLETE_DELIMITER + " ");
        return (terms.join(""));
    }
