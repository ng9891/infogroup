(() => {
  let tableName = '#submittedTable';
  // On Resizing
  $(window).on('resize', function() {
    setTimeout(() => {
      $(tableName).DataTable().columns.adjust().responsive.recalc().draw();
      // window.mymap.invalidateSize();
    }, 400);
  });

  let updateProposal = (type, data) => {
    return new Promise(async (resolve, reject) => {
      let url = '';
      if (type === 'withdraw') url = `/edit/${data.id}/withdraw?comment=${data.reason}`;
      else return;
      fetch(url, {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })
        .then((response) => {
          let json = response.json();
          if (!response.ok) return json.then(Promise.reject.bind(Promise));
          return json;
        })
        .then((json) => {
          resolve('success');
        })
        .catch((err) => {
          console.log(err);
          if (err.status === 'invalid') return reject('Field was changed before. Please refresh.');
          reject('Error in submission');
        });
    });
  };

  let displayCommentModal = (type, row) => {
    let title = '';
    if (type === 'withdraw') title = 'Withdraw Reason';
    else return;
    $('#confirmModal').off('show.bs.modal').on('show.bs.modal', () => {
      $('.modal-title').text(title);
      $('#confirmModal #comment').val('');
    });

    $('#confirmModal').off('click').on('click', '.confirmBtn', () => {
      let rowData = $(tableName).DataTable().row(row).data();
      if (!rowData) return console.log('Error. No data found in row.');
      rowData.reason = encodeURI($('#confirmModal #comment').val());
      updateProposal(type, rowData)
        .then((data) => {
          if (data === 'success') {
            alert('Transaction was successful');
            rowData.type = 'WITHDRAWN';
            $(tableName).DataTable().row(row).data(rowData).draw();
          }
        })
        .catch((err) => {
          console.log(err);
          alert(err);
        })
        .finally(() => {
          $('#confirmModal').modal('hide');
        });
    });
    $('#confirmModal').modal();
  };

  loadEventListeners = () => {
    // let featureGroup;
    // $('#proposalTable')
    //   .off('mouseover')
    //   .on('mouseover', 'tr', function() {
    //     let row = $(this);
    //     if (row.hasClass('child')) row = row.prev();
    //     row.addClass('selected');
    //     let geometry = $('#proposalTable').DataTable().row(row).data().geopoint;
    //     let originalGeom = $('#proposalTable').DataTable().row(row).data().originalPoint;
    //     featureGroup = new L.featureGroup([geometry, originalGeom]);
    //     window.mymap.fitBounds(featureGroup.getBounds(), {maxZoom: 16});
    //     window.mymap.addLayer(featureGroup);
    //   })
    //   .off('mouseout')
    //   .on('mouseout', 'tr', function() {
    //     let row = $(this);
    //     if (row.hasClass('child')) row = row.prev();
    //     row.removeClass('selected');
    //     window.mymap.removeLayer(featureGroup);
    //   });

    $(tableName).on('click', 'tr .btn.withdraw', function() {
      let row = $(this).closest('tr');
      //Check if the current row is a child row
      if (row.hasClass('child')) row = row.prev(); //If it is, then point to the row before it (its 'parent')
      displayCommentModal('withdraw', row);
    });

    $(tableName).on('click', 'tr .btn.resubmit', function() {
      let row = $(this).closest('tr');
      // Check if the current row is a child row
      if (row.hasClass('child')) row = row.prev(); //If it is, then point to the row before it (its 'parent')

      let bus_id = $(tableName).DataTable().row(row).data().bus_id;
      let modalID = '#editModal';
      loadEditModal(bus_id);
      $(modalID).modal();
    });
  };
})();
