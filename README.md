# About
This project aims at creating a Web-GIS tool to allow users to explore Information about firm-level, business establishments and their locations for the understanding of economic activities and related transportation movements at various geographical regions and scales. 
The project will use business establishment data, which includes street address location, number of employees, annual sales volume, NAICS and SICS industry classification codes, and other attributes provided by Infogroup (formally known as InfoUSA). 

# Requirements
- NodeJS (recommended version v12.18.3 LTS) 
- Database export
- Account with [AVAIL Albany](https://www.albany.edu/avail/)

# Infogroup API Installation

### Steps to run

```sh-session
    $ git clone https://github.com/availabs/infogroup-api.git
    $ cd infogroup-api
    $ npm i
```
  Create the `postgres.env` file with credentials and move it to `utils/`

`postgres.env` file should contain:

- ```POSTGRES_DB= dbname```

- ```POSTGRES_USER= username```

- ```POSTGRES_PASSWORD= password```

- ```POSTGRES_NETLOC= db_ip_address```

- ```POSTGRES_PORT=5432```

- ```MAPQUEST_KEY= you_mapquest_key``` - If you desire to use reverse geocoding from MapQuest API.

- ```QUERY_DIST=1609``` - OPTIONAL: Default value for maker distance query.
```
    $ node server.js or npm start
```

Go to http://localhost:3000/ in your browser

Contact [AVAIL Albany](https://www.albany.edu/avail/) for access to the credentials.