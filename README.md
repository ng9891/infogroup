# About

# InfogGroup API Start
Requires node (recommended version 8.9.4LTS)
Requires an enviromental file in utils called postgres.env

.env file contains:

- ```POSTGRES_DB= dbname```

- ```POSTGRES_USER= username```

- ```POSTGRES_PASSWORD= password```

- ```POSTGRES_NETLOC= db ip address```

- ```POSTGRES_PORT=5432```

- ```QUERY_LIMIT=3000``` - Default value for amount of points to display on map.


### To Run

```sh-session
    $ git clone https://github.com/availabs/infogroup-api.git
    $ cd infogroup-api
    $ npm i
    $ node server.js or npm start
```

Go to http://localhost:3001/ in your browser

to get data by zipcode ex
http://localhost:3001/byZip/12203


to get data by entry ID
http://localhost:3001/byid/232719
 
