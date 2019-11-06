//Creates a Datatable with the information in data
function loadDatatable(establishments) {
  // var wh = $(window).height();
  // var calcDataTableHeight = LessThan17inch ? wh * 0.23 : wh * 0.3;

  var obj = {
    data: [],
  };

  establishments = establishments.data.map((est) => {

    if(!est.NAICSCD){
      est.NAICSCD = 99;
    }
    obj.data.push({
      id: est.id,
      lat: est.geopoint.coordinates[1] && est.geopoint.coordinates[0] ? est.geopoint.coordinates[1] : null,
      lon: est.geopoint.coordinates[1] && est.geopoint.coordinates[0] ? est.geopoint.coordinates[0] : null,
      name: est.CONAME,
      employee: est.ALEMPSZ,
      industry: est.NAICSDS,
      prmsic: est.PRMSICDS,
      naicsTwoDigit: est.NAICSCD.toString().slice(0, 2),
    });
  });

  $(document).ready(function() {
    var table = $('#jq_datatable').DataTable({
      dom: 'Bfrtip',
      buttons: [
        {
          extend: '',
          text: 'Export',
          action: exportDataAsync,
        },
      ],
      data: obj.data,
      columns: [
        {
          title: 'id',
          data: 'id',
        },
        {
          title: 'Name',
          data: 'name',
          render: function(data, type, row, meta) {
            if (type === 'display') {
              data =
                '<a href="#" onclick="locatePointByCoordinate(' +
                row['lat'] +
                ', ' +
                row['lon'] +
                ')" data-zoom="12">' +
                data +
                '</a>';
            }
            return data;
          },
        },
        {
          title: 'EmpSZ',
          data: 'employee',
        },
        {
          title: 'NAICS',
          data: 'industry',
        },
        {
          title: 'Primary SIC',
          data: 'prmsic',
        },
        {
          title: 'PRM',
          data: null,
          render: function(data, type, row, meta) {
            if (type === 'display') {
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
          defaultContent:
            "<a id='btn_edit' href='' class='btn btn-primary btn-xs' data-toggle='modal' data-target='#editModal'>Edit</a>",
        },
        {
          title: 'lat',
          data: 'lat',
        },
        {
          title: 'lon',
          data: 'lon',
        },
        {
          title: '2Digit',
          data: 'naicsTwoDigit',
        },
      ],
      columnDefs: [
        {
          visible: false,
          targets: [0,7,8,9], //Invisible. id, Latitude, Longitude, two digit
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
      fixedColumns: true,
      bLengthChange: false,
      pageResize: true,
      destroy: true,
      scrollY: '0px',
      scrollCollapse: true,
      scrollResize: true
    });

    // Edit button event listener
    $('#jq_datatable tbody').unbind('click').on('click', 'td a', function() {
      var data_row = table.row($(this).parents('tr')).data();
      // console.log(data_row);
      query_version = d3.select('#version-dropdown').property('value');
      loadEditModal(data_row['id'], query_version);
    });
  });
}

function clearDatatable() {
  $('#jq_datatable').DataTable().clear().draw();
}

function destroyDatatable() {
  $('#jq_datatable').DataTable().destroy();
}

// Marker creation when a business is selected
// TODO: Make this a helper function.
function locatePointByCoordinate(lat, lon) {
  let mkr;
  if (lat != null && lon != null) {
    mymap.setView([lat, lon], 19);
    if (mkr) {
      mymap.removeLayer(mkr);
    }
    mkr = new L.marker([lat, lon], {}).addTo(mymap);
    mkr.on('click', function() {
      mymap.removeLayer(mkr);
    });
    markerList.push(mkr);
  }
}
