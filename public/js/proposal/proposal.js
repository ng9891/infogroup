(() => {
  $(document).ready(async function() {
    // console.log(JSON.parse(window.dataTableContent));
    // console.log(window.dataTableContent);
    await window.loadDatatable();
    window.loadMap();
    window.loadEventListeners();
  });
})();
