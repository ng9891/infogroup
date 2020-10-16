// Creates a Datatable with the information in data
function loadDatatable(est) {
  return new Promise((resolve) => {
    $(document).ready(() => {
      // Button definition
      $.fn.dataTable.ext.buttons.expand = {
        text: 'Expand Table',
        className: 'btn btn-info expandDatatableBtn',
        init: function(api, node, config) {
          $(node).removeClass('dt-button');
        },
      };

      const authLevel = d3.select('.role').node().value;

      let table = $('#jq_datatable').DataTable({
        buttons: [
          'expand',
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
            title: 'Info_ID',
            data: 'INFOUSA_ID',
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
                if (authLevel === 'false') {
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
              if (authLevel === '0') {
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
            targets: [0, 1, 6, 8, 9, 10, 11], //Invisible. id, Latitude, Longitude, two digit, matchcd
          },
          {
            responsivePriority: 1,
            targets: 7,
          },
        ],
        initComplete: function() {
          return resolve('Datatable loaded');
        },
        // pagingType: 'full_numbers',
        dom: 'Bfrtip',
        destroy: true,
        scrollY: 300,
        scrollCollapse: true,
        responsive: true,
      });

      // if (authLevel === 'false') {
      //   table.column(5).visible(false);
      // }
      // Edit button event listener
      $('#jq_datatable tbody').unbind('click').on('click', 'td a', function() {
        let data_row = table.row($(this).parents('tr')).data();
        query_version = d3.select('#version-dropdown').property('value');
        loadEditModal(data_row['id'], query_version);
      });

      // Button to hide piechart and expand datatable.
      $('#jq_datatable_wrapper .dt-buttons button.expandDatatableBtn').on('click', function() {
        let dtable = $('#jq_datatable').DataTable();
        if ($('.infoContainer .pieChartContainer').is(':visible')) {
          $('.infoContainer .pieChartContainer').fadeOut('fast');
          $('.infoContainer .pieChartContainer').promise().done(() => {
            $('.infoContainer .datatable-wrapper').addClass('expanded');
            dtable.page.len(20).draw(false); // Change page length to display 20 rows.
          });
        } else {
          $('.infoContainer .datatable-wrapper').removeClass('expanded');
          dtable.page.len(10).draw(false);
          $('.infoContainer .pieChartContainer').fadeIn('slow');
        }
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
