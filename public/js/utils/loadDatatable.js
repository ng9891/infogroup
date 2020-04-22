// Creates a Datatable with the information in data
function loadDatatable(est) {
  return new Promise((resolve) => {
    $(document).ready(() => {
      const isAdmin = d3.select('.role').node().value;
      let table = $('#jq_datatable').DataTable({
        buttons: [
          {
            extend: '',
            text: 'Export',
            action: exportDataAsync,
          },
        ],
        data: est.data,
        columns: [
          {
            title: 'id',
            data: 'id',
          },
          {
            title: 'Name',
            data: 'CONAME',
            render: function(data, type, row, meta) {
              if (type === 'display') {
                data =
                  '<a href="#" onclick="locatePointByCoordinateDel(' +
                  row['geopoint'].coordinates[1] +
                  ', ' +
                  row['geopoint'].coordinates[0] +
                  ')" data-zoom="12">' +
                  data +
                  '</a>';
              }
              return data;
            },
          },
          {
            title: 'EmpSZ',
            data: 'ALEMPSZ',
          },
          {
            title: 'NAICS',
            data: 'NAICSDS',
            render: function(data) {
              if (!data) return 'UNCLASSIFIED ESTABLISHMENTS';
              return data;
            },
          },
          {
            title: 'Primary SIC',
            data: 'PRMSICDS',
          },
          {
            title: 'PRM',
            data: null,
            render: function(data, type, row) {
              if (type === 'display') {
                if (isAdmin === 'false') {
                  return 'Yes';
                }
                data =
                  "<div class='onoffswitch'><input type='checkbox' name='onoffswitch' onclick='updatePrimaryField(" +
                  row['id'] +
                  ")' class='onoffswitch-checkbox' id='prmswitch" +
                  row['id'] +
                  "' checked><label class='onoffswitch-label' for='prmswitch" +
                  row['id'] +
                  "'><span class='onoffswitch-inner'></span><span class='onoffswitch-switch'></span></label></div>";
              }
              // function updatePrimaryField() located in public/infogroup.js
              return data;
            },
          },
          {
            title: '',
            data: null,
            render: function() {
              let name = 'Edit';
              let className = 'btn btn-success btn-xs';
              if (isAdmin === 'false') {
                name = 'View';
                className = 'btn btn-primary btn-xs';
              }
              return `<a id='btn_edit' href='' class='${className}' data-toggle='modal' data-target='#editModal'>${name}</a>`;
            },
          },
          {
            title: 'lat',
            data: 'geopoint',
            render: function(data) {
              return data.coordinates[1];
            },
          },
          {
            title: 'lon',
            data: 'geopoint',
            render: function(data) {
              return data.coordinates[0];
            },
          },
          {
            title: '2DigitNAICS',
            data: 'NAICSCD',
            render: function(data) {
              if (!data) return 99;
              return data.toString().slice(0, 2);
            },
          },
          {
            title: 'matchCD',
            data: 'MATCHCD',
            render: function(data) {
              if (!data) return 'NULL';
              return data;
            },
          },
        ],
        columnDefs: [
          {
            visible: false,
            targets: [0, 7, 8, 9, 10], //Invisible. id, Latitude, Longitude, two digit, matchcd
          },
          {
            width: 34,
            targets: 2, //Empl column
          },
          {
            width: 50,
            targets: 5, //PRM column
          },
          {
            width: 34,
            targets: 6, //ED column
          },
        ],
        initComplete: function() {
          return resolve('Datatable loaded');
        },
        dom: 'Bfrtip',
        fixedColumns: true,
        bLengthChange: false,
        pageResize: true,
        destroy: true,
        scrollY: '0px',
        scrollCollapse: true,
        scrollResize: true,
        deferRender: true,
      });
      /*
      dom: 'Bftir',
        deferRender: true,
        scrollY: 350,
        scrollCollapse: true,
        scroller: true,
        bDestroy: true,
      *******
      dom: 'Bfrtip',
      fixedColumns: true,
        bLengthChange: false,
        pageResize: true,
        destroy: true,
        scrollY: '0px',
        scrollCollapse: true,
        scrollResize: true,
        scroller: true,
        deferRender: true,
      */

      if (isAdmin === 'false') {
        table.column(5).visible(false);
      }
      // Edit button event listener
      $('#jq_datatable tbody').unbind('click').on('click', 'td a', function() {
        let data_row = table.row($(this).parents('tr')).data();
        // console.log(data_row);
        query_version = d3.select('#version-dropdown').property('value');
        loadEditModal(data_row['id'], query_version);
      });
    });
  });
}

function clearDatatable() {
  const table = $('#jq_datatable');
  if ($.fn.DataTable.isDataTable(table)) table.DataTable().clear().draw();
}

function destroyDatatable() {
  const table = $('#jq_datatable');
  if ($.fn.DataTable.isDataTable(table)) table.DataTable().destroy();
}
