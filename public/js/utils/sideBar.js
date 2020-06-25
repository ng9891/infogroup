(() => {
    /**
   * Global function to close the road sidebar.
   */
  window.closeSideBar = () => {
    if ($('.mapContainer').hasClass('sideBar-open')) {
      $('.mapContainer').toggleClass('sideBar-open');
      window.setTimeout(() => {
        window.mymap.invalidateSize();
      }, 400);
      clearUsrMarker();
    }
  };

  /**
   * Function to open the road sidebar.
   */
  window.openSideBar = () => {
    if (!$('.mapContainer').hasClass('sideBar-open')) {
      $('.mapContainer').toggleClass('sideBar-open');
      window.setTimeout(() => {
        window.mymap.invalidateSize();
      }, 400);
    }
  };

    /**
   * Toggles the loading animation in the road sidebar.
   */
  window.toggleSideBarLoadingIcon = () => {
    if ($('#sideBarLoader').css('display') == 'block') {
      $('#sideBarLoader').css('display', 'none');
    } else if ($('#sideBarLoader').css('display') == 'none') {
      $('#sideBarLoader').css('display', 'block');
    }
  };
  
})();
