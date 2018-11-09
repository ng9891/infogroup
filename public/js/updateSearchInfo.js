function updateSearchInfo(searchType, searchValue) {
    if (!searchType) searchType = 'error';
    if (!searchValue) searchValue = '';
    if (searchType == 'Search:') {
        $('#search-description').html('<h4>' + searchType + ' ' + searchValue[0] + '</h4> <p>' + searchValue[1] + '</p>');
    } else {
        $('#search-description').html('<h4>' + searchType + ' ' + searchValue + '</h4>');
    }
}
