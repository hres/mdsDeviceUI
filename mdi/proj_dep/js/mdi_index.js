
"use strict";

//const autocompleteURL = "https://rest-dev.hres.ca/dpd/dpd_lookup";
const autocompleteURL = "https://rest-dev.hres.ca/mdi/mdi_search";
const autocompleteLimit = 300;
var resultPageURL = "results.html";
const illegal = ["of", "&", "and", "?", "!", "or", "+", "-", "no."];
var searchBoxId="#search";
$(document).ready(() => {

  /*$( "#search" ).autocomplete({
    appendTo: "#search"
  });
*/
  autocompleteInit()
});


function parseLucene(query){
  var result="";
  if(!query) return result;
  var ptr=query.left;

  while(ptr.right){
    if(ptr.left) {
      console.log("Field left:" + ptr.left.field);
      console.log("term left:" + ptr.left.term);
    }
    if(ptr.right) {
      console.log("Field right:" + ptr.right.field);
      console.log("term right:" + ptr.right.term);
    }
    ptr=ptr.right;
  }


}

/**
 * Create the autocomplete url based on
 * @param term
 * @returns {string}
 */
function getTermQuery(term) {

  //return autocompleteURL + "?or=(or(brand_name.ilike." + term + "*,company_name.ilike." + term + "*),ingredient.ilike." + term + "*)&limit=" + autocompleteLimit;
  //return autocompleteURL + "?or=(or(trade_name.ilike." + term + "*,company_name.ilike." + term + "*),incident_type_e.ilike." + term + "*)&limit=" + autocompleteLimit;
  var temp= autocompleteURL + "?(incident.trade_name.ilike."+term+"*,incident.company_name.ilike."+term+"*,incident.incident_type_e.ilike."+term+"*)&limit=" + autocompleteLimit;
  console.log(temp);
 return temp
}

/**
 * Gets the raw request and parses it. Used to pass to the results page
 */
function passRequest() {

  var queryString = $(searchBoxId).val();

  require(['proj_dep/vendor/lucene-query-parser.js'], function(lucenequeryparser) {
    // Use the Lucene Query Parser library here
   var queryString = $("#search").val();
    var results = lucenequeryparser.parse(queryString);
    parseLucene(results);
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

  var availableTags = [
    "Johnson & Johnson [conpany]",
     "Acme [company]",
     "My hip (id re) [device]",
     "",
    "OR",
    "AND",
    "NOT"
  ];
  function split( val ) {
    var temp=val.split(/\s+/);
    console.log("SPlit"+temp)
    return val.split(/\s+/);
  }
  function extractLast( term ) {
    var temp=split( term ).pop();
    console.log(term);
    if(temp==' ') temp="";
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
function updateDateState(){
    if($("#is-date-range").is(":checked")){
      $("#date-group").toggleClass('hidden visible');
    }else{
      $("#date-group").toggleClass('visible hidden');
      $("#startdate").val(null);
      $("#enddate").val(null);
    }

  }
