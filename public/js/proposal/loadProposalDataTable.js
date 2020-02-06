(() => {
  loadDatatable = () => {
    let dataTableSetting = {
      pageLength: 10,
      responsive: true,
      processing: true,
      serverSide: true,
      ajax: {
        url: '/edit/datatable?record_status=0&status=0',
        dataSrc: function(json) {
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
          return json.data;
        },
      },
      columns: [
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
          render: function(data) {
            if (!data) return '';
            let indexOfEmail = data.lastIndexOf('@');
            return data.slice(0, indexOfEmail);
          },
        },
        {title: 'by_id', data: 'by_id', defaultContent: ''},
        {
          title: 'created_at',
          data: 'created_at',
          defaultContent: '',
          render: function(data) {
            if (!data) return '';
            return moment(data).format('MM/DD/YYYY, h:mma');
          },
        },
        {title: 'comment', data: 'comment'},
        {title: 'changed_fields', data: 'changed_fields'},
        {
          title: 'action',
          render: function() {
            let btnHtml = `
                <button class="btn btn-secondary dropdown-toggle" type="button" id="actionBtn" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  Action
                </button>
                <div class="dropdown-menu action" aria-labelledby="actionBtn">
                  <a class="dropdown-item reject" href="javascript:void(0)">Reject</a>
                  <a class="dropdown-item accept" href="javascript:void(0)">Accept</a>
                </div>
            `;
            return btnHtml;
          },
        },
      ],
      columnDefs: [
        {
          visible: false,
          targets: [3],
        },
        {
          orderable: false,
          targets: [6, 7],
        },
      ],
      order: [[4, 'desc']],
      searching: false,
      lengthChange: false,
      // stateSave: true,
      paging: true,
      pagingType: 'full_numbers',
      scrollX: true,
    };

    window.dataTable = $('#proposalTable').DataTable(dataTableSetting);
  };
})();
