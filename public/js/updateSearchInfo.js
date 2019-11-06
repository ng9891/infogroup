/*
* Helper function that targets 'search-description' div element to change its description based on the query search.
* 
* If this function is called from an advanced search query, searchValue will be an array[2] that contains a longer description of the query.
* Reason to send it as an array so its easier to separate the description into a smaller paragraph
*
* Expected input:   searchType {string}as the title of the search
*                   searchValue {string or array(if searchType='Search:')} as the small description of the search
*
* Output: Div element '.search-description' with the desired description
*/

function updateSearchInfo(searchType, searchValue) {
    if (!searchType) searchType = 'error';
    if (!searchValue) searchValue = '';
    if (searchType == 'Search:') {
        // Different description loading for advances search as it sends an array
        $('.search-description').html('<h4>' + searchType + ' ' + searchValue[0] + '</h4> <p>' + searchValue[1] + '</p>');
    } else {
        $('.search-description').html('<h4>' + searchType + ' ' + searchValue + '</h4><p></p>');
    }
}
