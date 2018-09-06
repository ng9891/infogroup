//-----
// BEGIN Test to PARSE URL
//-----
//  Parse URL and call API accordingly
// authors note: is this the only way to go? or use templating
var url = new URL(window.location.href);

//locate the middle occurrence of the / character in your URL and cut it.
var path = url.pathname.substr(url.pathname.indexOf('/') + 1, url.pathname.lastIndexOf('/') - 1);
//locate the last occurrence of the / character in your URL and cut it.

switch (path) {
    case 'county':
        console.log("County Page");
        var county = url.pathname.substr(url.pathname.lastIndexOf('/') + 1);
        console.log(county);
        if (url.search !== '') {
            console.log(url.search);
            let params = new URLSearchParams(url.search.substring(1)); //drop the leading "?"
            console.log(parseInt(params.get("offset")));
        } else {
            console.log('Empty query');
        }
        break;
    default:
        console.log("HomePage");
}
//-----
// END Test to PARSE URL
//-----


// --
// on Load, load zipcode 10001
// --
// loadDistanceEstablishments(-74.00157809257509, 40.71972943412674);
// loadCountyEstablishments('Westchester'); //Can take an offset for pagination
loadZipEstablishments(10001);

$( window ).on( "load", function() {
    // Animate loader off screen
    $(".loader").fadeOut("slow");
});