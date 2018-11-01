// Entity Edit Modal Form
function loadEditModal(dt_row) {
    if ($.isEmptyObject({dt_row}) && typeof dt_row == 'undefined') {
        console.log("Datatable row is undefined or empty");
        return;
    }
    let business_id = dt_row["id"];
    let reqURL = '/api/byid/' + business_id;
    d3.json(reqURL)
		.then(data => {
            let est = data.data[0];
            $("#modalLabel").html(est.CONAME + ' - ID: <span id ="business_id">'+business_id+'</span>');
            $("#LEMPSZCD").val(est.LEMPSZCD);
            $("#ALEMPSZ").val(est.ALEMPSZ);
            $("#NAICSCD").val(est.NAICSCD);
            $("#NAICSDS").val(est.NAICSDS);
            $("#PRMSICCD").val(est.PRMSICCD);
            $("#PRMSICDS").val(est.PRMSICDS);
            $("#SQFOOTCD").val(est.SQFOOTCD);
            $("#SQFOOTDS").val(est.SQFOOTDS);
            $("#LSALVOLCD").val(est.LSALVOLCD);
            $("#LSALVOLDS").val(est.LSALVOLDS);
            $("#ALSLSVOL").val(est.ALSLSVOL);
            $("#CSALVOLDS").val(est.CSALVOLDS);
            $("#ACSLSVOL").val(est.ACSLSVOL);

		}, function (err) {
			alert("Query Error on ID");
			console.log(err);
		});
}
// END Entity Edit Modal Form
/*
database records: spatial (add, modify, delete) point feature geometry; 
non-spatial (add, modify, delete) PRIMARY_SIC_CODE; PRIMARY_SIC_DESC; NAICS_CODE; NAICS_DESC; 
ACTUAL_LOCATION_EMPLOYMENT_SIZE; ACTUAL_CORPORATE_EMPLOYMENT_SIZE; MODELED_EMPLOYMENT_SIZE; ACTUAL_LOCATION_SALES_VOLUME; 
ACTUAL_CORPORATE_SALES_VOLUME; SQUARE_FOOTAGE_CODE; LATITUDE; LONGITUDE)

//list
id
business_id
by
record_status
status
PRMSICCD //int
PRMSICDS
NAICSCD //int
NAICSDS
ALEMPSZ //int
ACEMPSZ
LEMPSZCD
LEMPSZSZ
SQFOOTCD
SQFOOTDS
LATITUDEO
LONGITUDEO
created_at
started_at
ended_at
geom
LSALVOLCD
LSALVOLDS
ALSLSVOL //int
CSALVOLCD
CSALVOLDS
ACSLSVOL //int


SQFOOTCD / DS
"A"	"0 - 2499"
"B"	"2500 - 9999"
"C"	"10000 - 39999"
"D"	"40000+"
*/