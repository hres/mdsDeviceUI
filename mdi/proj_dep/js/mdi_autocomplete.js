"use strict";
$(document).ready(function () {
    autocompleteInit()
});

/**
 * Initializes the functionality for all the events for JQuery-ui autocomplete plugin
 * Depends upon the following (must be loaded first):
 * getAutoTerms,extractLast,selectAutoTerms
 */
function autocompleteInit() {
    var _GLOBAL = window.MDI;
    $(_GLOBAL.SEARCH_BOX_ID)
    // don't navigate away from the field on tab when selecting an item
        .on("keydown", function (event) {

            if (event.keyCode === $.ui.keyCode.TAB &&
                $(this).autocomplete("instance").menu.active) {
                event.preventDefault();
            }
            if (event.keyCode === 13) {
                var curr = $(".selector").val();
                if (!curr) return;
                if ($(".selector").val().length == 0) {
                    event.preventDefault();
                    return false;
                }
            }
        })
        .autocomplete({
            source: function (request, response) {
                // delegate back to autocomplete, but extract the last term
                response = getAutoTerms(request, response);
            },
            minLength: _GLOBAL.AUTOCOMPLETE_MIN_LENGTH,
            search: function () {
                extractLast(this.value);
            },
            focus: function () {
                // prevent value inserted on focus
                return false;
            },
            select: function (event, ui) {
                this.value = selectAutoTerms(ui, event, this.value);
                return false;
            }
        });
}


