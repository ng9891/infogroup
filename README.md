# About
This project aims at creating a Web-GIS tool to allow users to explore Information about firm-level, business establishments and their locations for the understanding of economic activities and related transportation movements at various geographical regions and scales. 
The project will use business establishment data, which includes street address location, number of employees, annual sales volume, NAICS and SICS industry classification codes, and other attributes provided by Infogroup (formally known as InfoUSA). 

# InfoGroup API Start
Requires node (recommended version 8.9.4LTS)
Requires an enviromental file in utils called postgres.env

.env file contains:

- ```POSTGRES_DB= dbname```

- ```POSTGRES_USER= username```

- ```POSTGRES_PASSWORD= password```

- ```POSTGRES_NETLOC= db ip address```

- ```POSTGRES_PORT=5432```

- ```QUERY_DIST=1609``` - OPTIONAL: Default value for maker distance query.


### To Run

```sh-session
    $ git clone https://github.com/availabs/infogroup-api.git
    $ cd infogroup-api
    $ npm i
    $ node server.js or npm start
```

Go to http://localhost:3001/ in your browser

To get data by Zipcode. eg:
http://localhost:3001/byZip/12203

To get data by entry ID. eg:
http://localhost:3001/byid/232719
 
