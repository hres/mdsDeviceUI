
/**
 * Attach global variables to window. PLace in a single variable
 */
(function(window) {
    var MDI={};
    MDI.DEVICE_TYPE="device";
    MDI.COMPANY_TYPE="company";
    MDI.START_AUTO="[";
    MDI.END_AUTO="]";
    MDI.END_POINT="https://rest.hres.ca/mdi/mdi_search";
    MDI.RESULTS_PAGE_NAME="results.html";
    window.MDI=MDI;
})(window);


/**
 * Update variables for french language
 */
$(document).ready(function() {

    if (document && document.documentElement && document.documentElement.lang == "fr"){
        window.MDI.DEVICE_TYPE="instrument";
        window.MDI.COMPANY_TYPE="entreprise";
    }
});


