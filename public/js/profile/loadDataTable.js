(() => {
  let renderButton = (data) => {
    const authLevel = d3.select('.role').node().value;
    if(authLevel === '0') return '';
    let html = '';
    let withdrawBtn = `<button class="btn btn-warning withdraw" type="button">Withdraw</button>`;
    let proposeBtn = `<button class="btn btn-primary resubmit" type="button">New Edit</button>`;
    switch (data.type) {
      case 'NEW':
        html = `${withdrawBtn} ${proposeBtn}`;
        // html = `${withdrawBtn}`;
        break;
      case 'REJECTED':
        html = proposeBtn;
        break;
      case 'WITHDRAWN':
        html = proposeBtn;
        break;
      case 'ACCEPTED':
      case 'REPLACED':
        break;
    }
    return html;
  };

  loadDatatable = (data) => {
    let dataTableSetting = {
      pageLength: 10,
      data: data,
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
          render: function(data, type) {
            if (!data) return '';
            if (type === 'display') return moment(data).format('MM/DD/YYYY, h:mma');
            return data;
          },
        },
        {title: 'comment', data: 'comment'},
        {title: 'status', data: 'type'},
        {title: 'changed_fields', data: 'changed_fields'},
        {
          title: 'action',
          render: function(data, type, row) {
            let btnHtml = renderButton(row);
            return btnHtml;
          },
        },
      ],
      columnDefs: [
        {
          visible: false,
          targets: [2, 3],
        },
        {
          orderable: false,
          targets: [7, 8],
        },
      ],
      responsive: true,
      order: [[4, 'desc']],
      searching: false,
      lengthChange: false,
      // stateSave: true,
      paging: true,
      pagingType: 'full_numbers',
      scrollX: true,
      // autoWidth: true,
      initComplete: function() {
        $('#submittedTable').DataTable().columns.adjust().draw().responsive.recalc();
      },
    };

    window.dataTable = $('#submittedTable').DataTable(dataTableSetting);
  };
})();
