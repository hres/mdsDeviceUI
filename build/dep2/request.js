const search = window.location.search.substr(1);
const documentURL = "https://rest-dev.hres.ca/mdi/";
const limit = 25;
const pagesAllowed = 5;
var page = 0;
var searchdata = [];
var searchdata2 = [];

$(document).ready(() => {

    var q;
    var queries = search.split("&");
    var queryObj = {};

    console.log("Search is " + search);
    console.log(queries)
    queries.forEach((query) => {

        if (query.indexOf("=") > -1) {
            var qc = query.split("=");
            queryObj[qc[0]] = decodeURIComponent(qc[1]);
        }
    });

    if (queryObj.hasOwnProperty("q")) q = (queryObj.q).split(" ");
    if (queryObj.hasOwnProperty("page") && !isNaN(queryObj.page)) page = parseInt(queryObj.page) - 1;

    q.forEach((_q) => {

        if (_q.indexOf("(") > -1 || _q.indexOf(")") > -1) q.splice(q.indexOf(_q), 1);
    });

    $("#terms").text(q.join(" "));
    console.log(q);
    if (q) {
        requestDocuments(q);
    } else {
        end();
    }
    var data=[{"incident_id":2040,"incident":{"incident_id": 2040, "mandatory_rt": 0, "receipt_date": "1983-03-23", "incident_type_e": "Recall", "incident_type_f": "Rappel", "hazard_severity_code_e": "UNASSIGNED", "hazard_severity_code_f": "NON ATTRIBUE"},"search":"'-03':10 '-23':11 '0':6 '1983':9 '2040':3 'attribu':30 'code':22,27 'date':8 'e':14,23 'f':18,28 'hazard':20,25 'id':2 'incid':1,12,16 'mandatori':4 'non':29 'rappel':19 'recal':15 'receipt':7 'rt':5 'sever':21,26 'type':13,17 'unassign':24"}]
        $('#tableWet').DataTable( {
        data: data,
        columns: [
            { title: "Device Id" },
            { title: "Incident" },
            { title: "Descrop" },
            { title: "Risk" },
            { title: "Trade" },
            { title: "Usage" }
        ]
    } );
});



function requestDocuments(q) {

    var url = documentURL + "device?";

    q.forEach((_q) => {
        console.log(_q)
        url += ("trade_name=fts." + _q);
    });
    url+="&offset="+page;
    url+="&limit="+limit;
    const range = (page * limit) + "-" + (((page + 1) * limit) - 1);

    $.ajax({
        url: url,
        method: "GET",
        beforeSend: (xhr) => {

            xhr.setRequestHeader('Range-Unit', 'items');
            xhr.setRequestHeader('Range', range);
            xhr.setRequestHeader('Prefer', 'count=exact');
        },
        success: (data, status, xhr) => {

            var content = xhr.getResponseHeader('Content-Range');
            console.log(content);
            populateTable2(data);
            createPagination(content);
        },
        error: (err) => {
            console.log("error");
            end();
        }
    });


    /*
    var url = documentURL + "?select=drug_product";

  q.forEach((_q) => {

    url += ("&search=fts." + _q);
  });

  url += "&order=drug_product->>brand_name";

  const range = (page * limit) + "-" + (((page + 1) * limit) - 1);

  $.ajax({
		url: url,
		method: "GET",
		beforeSend: (xhr) => {

			xhr.setRequestHeader('Range-Unit', 'items');
			xhr.setRequestHeader('Range', range);
			xhr.setRequestHeader('Prefer', 'count=exact');
		},
		success: (data, status, xhr) => {

			var content = xhr.getResponseHeader('Content-Range');
      populateTable(data);
      createPagination(content);
		},
    error: (err) => {

      end();
    }
	});
     */




}


function populateTable2(data) {


    var body = "";
    /* $('#myTable').DataTable( {
         data: data,
         columns: [
             { title: "incident Id" },
             { title: "Position" }
         ]
     } );*/
    //const drugPageURL = document.documentElement.lang == "fr" ? "drug-fr.html" : "drug.html";

    data.forEach((d) => {
        body += "<tr>" +
            "<td>" + d.device_id + "</td>" +
            "<td>" + d.incident_id + "</td>" +
            "<td>" + d.pref_desc_e + "</td>" +
            "<td>" + d.risk_classification + "</td>" +
            "<td>" + d.trade_name + "</td>" +
            "<td>" + d.usage_code_term_e + "</td>" +
            "</tr>";
    });



    $("#drug-table").attr("hidden", false);
    $("#table-content").html(body);
    //$("#table-content2").html(body);
    $("#pagination").attr("hidden", false);
    $("#empty").attr("hidden", true);
    //$("#refresh").text(makeDate(data[0].drug_product.last_refresh));
}

//dpd
function populateTable(data) {

    console.log(data);

    var body = "";

    const drugPageURL = document.documentElement.lang == "fr" ? "drug-fr.html" : "drug.html";

    data.forEach((d) => {

        const drug = d.drug_product;

        var status = document.documentElement.lang == "fr" ? drug.status_current_f : drug.status_current;
        var drugClass = document.documentElement.lang == "fr" ? drug.class_f : drug.class;

        var ingredients = $.map(drug.active_ingredients_detail, (ing) => {

            return (document.documentElement.lang == "fr") ? (ing.ingredient_f + " (" + ing.strength + " " + ing.strength_unit_f + ")") : (ing.ingredient + " (" + ing.strength + " " + ing.strength_unit + ")");
        }).join(", ");

        body += "<tr>" +
            "<td>" + status + "</td>" +
            "<td><a href='" + drugPageURL + "?pr=" + drug.drug_code + "'>" + drug.drug_identification_number + "</a></td>" +
            "<td>" + drug.company.company_name + "</td>" +
            "<td>" + drug.brand_name + "</td>" +
            "<td>" + drugClass + "</td>" +
            "<td>" + ingredients + "</td>" +
            "</tr>";
    });

    $("#drug-table").attr("hidden", false);
    $("#table-content").html(body);
    $("#pagination").attr("hidden", false);
    $("#empty").attr("hidden", true);
    $("#refresh").text(makeDate(data[0].drug_product.last_refresh));
}

function createPagination(content) {

    var range = (content.split("/"))[0];
    var start = parseInt((range.split("-"))[0]) + 1;
    var end = parseInt((range.split("-"))[1]) + 1;

    var total = (content.split("/"))[1];

    $("#count").text("(Displaying results " + start + " - " + end + " of " + total + ")");

    const totalPages = Math.ceil(total / limit);
    const pageMedian = Math.ceil(pagesAllowed / 2);
    const pageDeviation = Math.floor(pagesAllowed / 2);

    var currentPage = page + 1;
    var pageArray = [];

    if (currentPage < pageMedian) {
        for (var i = 0; i < pagesAllowed; i++) {
            if (i < totalPages) pageArray.push(i + 1);
        }

        makePages(pageArray, currentPage);
    } else if (currentPage + pageDeviation > totalPages) {
        for (var i = 0; i < pagesAllowed; i++) pageArray.unshift(totalPages - i);

        makePages(pageArray, currentPage);
    } else {
        for (var i = 0; i < pagesAllowed; i++) pageArray.push((currentPage - pageDeviation) + i);

        makePages(pageArray, currentPage);
    }
}

function makePages(pageArray, current) {

    for (var i = 0; i < pagesAllowed; i++) {
        if (i < pageArray.length) {
            var btn = "btn-default";

            if (pageArray[i] == current) {
                btn = "btn-primary";
            }

            $("#pg-" + i).addClass(btn).html(pageArray[i]).attr("onclick", "travel(" + pageArray[i] + ")");
        } else {
            $("#pg-" + i).css("display", "none");
        }
    }
}

function travel(page) {

    var searchComponents = search.split("&");
    var q;

    searchComponents.forEach((c) => {

        if (c.startsWith("q=")) q = c;
    });
    console.log("travelling")
    window.location.href = "results.html?" + q + "&page=" + page;
}

function end() {

    $("#drug-table").attr("hidden", true);
    $("#pagination").attr("hidden", true);
    $("#empty").attr("hidden", false);
}

function makeDate(iso) {

    const d = new Date(iso);
    const month = d.getMonth() < 9 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1);
    const day = d.getDate() < 10 ? "0" + d.getDate() : d.getDate()

    return d.getFullYear() + "-" + month + "-" + day;
}
