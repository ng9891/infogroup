(() => {

  let loadData = () => {
    return new Promise ((resolve, reject) => {
      fetch(`/edit/user/${window._user}`, {
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
          alert('Error getting Data.')
          console.log(err);
          reject(err);
        });
    });
  };

  $(document).ready(async function() {
    let data = await loadData();
    if(!data) return;
    loadDatatable(data);
    loadEventListeners();
  });
})();
