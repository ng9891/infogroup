(() => {
  let loadData = () => {
    return new Promise((resolve, reject) => {
      // Get URL param to pass it to datatable loading.
      let url_string = window.location.href;
      let url = new URL(url_string);
      let type = url.searchParams.get('type');
      let fetchURL = `/edit/user/${window._user}?`;
      if (type) fetchURL += `&type=${type}`;
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
        .then((data) => {
          resolve(data.data);
        })
        .catch((err) => {
          alert('Error getting Data.');
          console.log(err);
          reject(err);
        });
    });
  };

  $(document).ready(async function() {
    let data = await loadData();
    if (!data) return;
    loadDatatable(data);
    loadEventListeners();
  });
})();
