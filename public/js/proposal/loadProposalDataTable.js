(() => {
  let loadData = () => {
    return new Promise((resolve, reject) => {
      // Get URL param to pass it to datatable loading.
      let url_string = window.location.href;
      let url = new URL(url_string);
      let type = url.searchParams.get('type');
      let user = url.searchParams.get('user_id');
      let fetchURL = `/edit/list?record_status=0&status=0`;
      if (user && type) {
        $('h3').text(`Edit User: ${user}`);
        fetchURL += `&user_id=${user}&type=${type}`;
      }
      fetch(fetchURL, {
        method: 'GET',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })
        .then((response) => {
          let json = response.json();
          // throw Error
          if (!response.ok) return json.then(Promise.reject.bind(Promise));
          return json;
        })
        .then((json) => {
          let redIcon = new L.Icon({
            iconUrl: '/stylesheet/images/leaflet-color-markers/marker-icon-red.png',
            shadowUrl: '/stylesheet/images/leaflet-color-markers/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          });
          for (let data of json.data) {
            data.geopoint = L.geoJSON(JSON.parse(data.geopoint), {
              pointToLayer: function(feature, latlng) {
                return L.marker(latlng, {icon: redIcon});
              },
            });
            data.originalPoint = L.marker([data.row_data.LATITUDE_1, data.row_data.LONGITUDE_1]);
          }
          return resolve(json.data);
        })
        .catch((err) => {
          alert('Error getting Data.');
          console.log(err);
          reject(err);
        });
    });
  };

  loadDatatable = () => {
    return new Promise(async (resolve, reject) => {
      let data = await loadData();
      let dataTableSetting = {
        pageLength: 10,
        data: data,
        columns: [
          {
            // Check box
            data: null,
            defaultContent: '',
          },
          {
            title: 'ID',
            data: 'bus_id',
          },
          {
            title: 'Name',
            data: 'row_data',
            render: (data) => {
              return data.COMPANY_NAME;
            },
          },
          {
            title: 'By',
            data: 'by',
            defaultContent: '',
            render: function(data, type, row) {
              if (!data) return '';
              let indexOfEmail = data.lastIndexOf('@');
              return `<a href="/edit?user_id=${row.by_id}&type=new"> ${data.slice(0, indexOfEmail)}</a>`;
            },
          },
          {title: 'by_id', data: 'by_id', defaultContent: ''},
          {
            title: 'created_at',
            data: 'created_at',
            defaultContent: '',
            render: function(data, type) {
              if (!data) return '';
              if (type === 'display') return moment(data).format('MM/DD/YYYY, h:mma');
              return data;
            },
          },
          {title: 'comment', data: 'comment'},
          {title: 'changed_fields', data: 'changed_fields'},
        ],
        columnDefs: [
          {
            orderable: false,
            className: 'select-checkbox',
            width: '10px',
            targets: 0,
          },
          {
            visible: false,
            targets: [4],
          },
          {
            orderable: false,
            targets: [7],
            // targets: [7, 8],
          },
        ],
        order: [[5, 'desc']],
        searching: false,
        lengthChange: false,
        // stateSave: true,
        paging: true,
        pagingType: 'full_numbers',
        scrollX: true,
        select: {
          style: 'multi',
        },
        dom: 'Bfrtip',
        buttons: ['selectAll', 'selectNone', 'accept', 'reject'],
      };

      window.dataTable = $('#proposalTable').DataTable(dataTableSetting);
      return resolve();
    });
  };
  // Button definition
  $.fn.dataTable.ext.buttons.accept = {
    text: 'Accept',
    className: 'btn btn-success accept',
    init: function(api, node, config) {
      $(node).removeClass('dt-button');
    },
  };
  $.fn.dataTable.ext.buttons.reject = {
    text: 'Reject',
    className: 'btn btn-danger reject',
    init: function(api, node, config) {
      $(node).removeClass('dt-button');
    },
  };
})();
