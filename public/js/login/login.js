(() => {
  document.getElementById('submit_button').addEventListener('click', validate);
  function validate(e) {
    e.preventDefault();
    let email = document.getElementById('email').value;
    let pw = document.getElementById('password').value;
    document.getElementById('message').innerHTML = '';
    if (email === '' || pw === '') {
      error = 'All fields must be entered.';
      document.getElementById('message').innerHTML = error;
      return false;
    }
    let postData = JSON.stringify({email:email, password:pw});
    fetch('/login', {
      method: 'POST',
      body: postData,
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((response) => {
        if (response === 'Incorrect email or password.') {
          let error = 'Incorrect email or password.';
          document.getElementById('message').innerHTML = error;
          return false;
        }
        if (response) window.location.replace('/');

        // if(response && response.status &&response.status === 'logged in'){
        //   redirect: window.location.replace("/");
        // }else if(response){
        //   document.getElementById("message").innerHTML = response;
        //   return false;
        // }
      });
  }
})();
