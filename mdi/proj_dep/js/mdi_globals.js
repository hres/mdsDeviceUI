"use strict";
/**
 * Attach global variables to window. PLace in a single variable
 */
(function(window) {
    var MDI={};
    MDI.DEVICE_TYPE="device";
    MDI.COMPANY_TYPE="company";
    MDI.START_AUTO="[";
    MDI.END_AUTO="]";
    MDI.ILLEGAL_AUTO=["&",","];
    MDI.SEARCH_BOX_ID = "#search";
    MDI.AUTOCOMPLETE_QUERY_LIMIT = 600;
    MDI.MAX_AUTOCOMPLETE_LIST = 8;
    MDI.AUTOCOMPLETE_DELIMITER=",";
    MDI.AUTOCOMPLETE_MIN_LENGTH=0;
    MDI.END_POINT="https://rest.hres.ca/mdi/mdi_search";
    MDI.SERVER_SIDE_PROCESSING_END_POINT="mdi_dep/serverSideProcessing.php";
    MDI.RESULTS_PAGE_NAME="mdi_results.html";
    MDI.DISCLAIMER_PAGE="/static/content/mdidisclaim.php";
    MDI.EXTRACT_PATH="/files/2018-11-30%20extract.zip";
    MDI.DISCLAIM_TAG="disclaimer-link";
    MDI.ZIP_TAG="full-extract-link";
    MDI.TERMS_TAG="terms";
    MDI.RESULTS_TABLE='{"searching":false,"bDeferRender":true,"lengthMenu":[[10, 25, 50,100], [10, 25, 50,100]]}';
    MDI.MDALL_FR='https://health-products.canada.ca/mdall-limh/switchlocale.do?lang=fr';
    MDI.MDALL_EN='https://health-products.canada.ca/mdall-limh/';
    window.MDI=MDI;
})(window);


/**
 * Update variables for french language
 */
$(document).ready(function() {

    if (document && document.documentElement && document.documentElement.lang === "fr"){
        window.MDI.DEVICE_TYPE="dispositif";
        window.MDI.COMPANY_TYPE="entreprise";
        window.MDI.DISCLAIMER_PAGE="/static/content/mdidisclaim.php?lang=fr";
    }
});


