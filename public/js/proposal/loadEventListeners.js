(() => {
  // On Resizing
  $(window).on('resize', function() {
    setTimeout(() => {
      $('#proposalTable').DataTable().columns.adjust().responsive.recalc().draw();
      window.mymap.invalidateSize();
    }, 400);
  });

  let updateProposal = (type, data) => {
    return new Promise(async (resolve, reject) => {
      let url = '';
      if (type === 'accept') url = `/edit/${data.id}/accept?comment=${data.comment}`;
      else if (type === 'reject') url = `/edit/${data.id}/reject?comment=${data.comment}`;
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
          reject(`Error in submission. ${data.id} - ${data.CONAME}: ${data.changed_fields}`);
        });
    });
  };

  let displayCommentModal = (type, row) => {
    let count = $('#proposalTable').DataTable().rows(row).count();
    if (count < 1) return; // no row selected

    let title = '';
    if (type === 'accept') title = 'Comment before accepting record(s)';
    else if (type === 'reject') title = 'Reason for rejection(s)';
    else return;
    $('#confirmModal').off('show.bs.modal').on('show.bs.modal', () => {
      $('.modal-title').text(title);
      $('#confirmModal .desc').text(`${count} row(s) selected.`);
      $('#confirmModal #comment').val('');
    });

    $('#confirmModal').off('click').on('click', '.confirmBtn', async () => {
      let data = $('#proposalTable').DataTable().rows(row).data();
      if (!data) return console.log('Error. No data found in row.');
      let comment = encodeURI($('#confirmModal #comment').val());
      for (let i = count - 1; i >= 0; i--) {
        data[i].comment = comment;
        await updateProposal(type, data[i]).catch((err) => {
          console.log(err);
          alert(err);
        });
      }
      alert('Transaction was successful');
      $('#proposalTable').DataTable().rows(row).remove().draw();
      $('#confirmModal').modal('hide');

      // let updates = [];
      // Promise.all(updates)
      //   .then((data) => {
      //     alert('Transaction was successful');
      //     $('#proposalTable').DataTable().rows(row).remove().draw();
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //     alert(err);
      //   })
      //   .finally(() => {
      //     $('#confirmModal').modal('hide');
      //   });
    });
    $('#confirmModal').modal();
  };

  loadEventListeners = () => {
    let featureGroup;
    $('#proposalTable')
      .off('mouseover')
      .on('mouseover', 'tr', function() {
        let row = $(this);
        if (row.hasClass('child')) row = row.prev();
        // row.addClass('selected');
        let data = $('#proposalTable').DataTable().row(row).data();
        if (data) {
          let geometry = data.geopoint;
          let originalGeom = data.originalPoint;
          if (data.changed_fields_json.LATITUDE_1) {
            featureGroup = new L.featureGroup([geometry, originalGeom]);
          } else featureGroup = new L.featureGroup([originalGeom]);
          window.mymap.fitBounds(featureGroup.getBounds(), {maxZoom: 16});
          window.mymap.addLayer(featureGroup);
        }
      })
      .off('mouseout')
      .on('mouseout', 'tr', function() {
        let row = $(this);
        if (row.hasClass('child')) row = row.prev();
        // row.removeClass('selected');
        if (featureGroup) window.mymap.removeLayer(featureGroup);
      });

    $('#proposalTable_wrapper .dt-buttons button.accept').on('click', function() {
      displayCommentModal('accept', {selected: true});
    });

    $('#proposalTable_wrapper .dt-buttons button.reject').on('click', function() {
      displayCommentModal('reject', {selected: true});
    });
  };
})();
