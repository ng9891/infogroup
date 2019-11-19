const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  fetch = require('node-fetch'),
  db = require('./db_service.js')

// configure passport.js to use the local strategy
// passport.use(
//   new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
    // const HOST = 'https://availauth.availabs.org/';
//     fetch(`${HOST}login/`, {
//       method: 'POST',
//       headers: {
//         Accept: 'application/json, text/plain, odata=verbose, */*',
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({email: email, password: password, project: 'NPMRDS', token: null}),
//     })
//       .then((response) => response.json())
//       .then((json) => {
//         console.log('LocalStrat - got auth response from avail auth', json);
//         if (json && JSON.stringify(json.error)) {
//           return done(false, false, {message: json.error, error: 'not authenticated'});
//           //if(email == user.email || password == user.password) {
//         }
//         if (JSON.stringify(json.id)) {
//           return done(null, JSON.stringify(json));
//         }
//         return done(null, {message: 'unknown error'});
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   })
// );

passport.use(new LocalStrategy({usernameField: 'email'},(email, password, done) => {
  let query = `
      SELECT id, password, email, isadmin
      FROM users
			WHERE email = $1;
        `;

	db.runQuery(query, [email], (err, data) => {
		if (err) {
			console.log("error selecting user");
			return done(err);
		}

		if (data.rows.length < 1) {
			return done(null, false, {
				message: "Invalid email"
			});
		} else {
			let user = data.rows[0];

			if (user.password !== password) { // TODO: Need bcrypt
				return done(null, false, {
					message: "Incorrect password"
				});
			}
			return done(null, data.rows[0]);
		}
	});
}));

// tell passport how to serialize the user
passport.serializeUser(function(email, done) {
  done(null, email);
});

// deserializer
passport.deserializeUser(function(email, done) {
  done(null, email);
});

// // tell passport how to serialize the user
// passport.serializeUser(function(json, done) {
//   done(null, json);
// });

// // deserializer
// passport.deserializeUser(function(json, done) {
//   done(null, json);
// });

module.exports = passport;
