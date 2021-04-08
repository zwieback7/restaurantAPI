# restaurantAPI :ramen:

### RESTful & GraphQL Endpoints
* http://localhost:3000/api/
* http://localhost:3000/graphql/

### Configuration File
* create file _**config.json**_ in top-level directory
* put couchbase server, bucket and DB user credentials info
* put employee credentials

```
{
    "couchbase" : {
        "server": "127.0.0.1:8091",
        "bucket": "hiltonRestaurant",
        "username": "{username}",
        "password": "{password}"
    },

    "employees" : {
        "user0" : "password1234",
        "user1" : "password1234",
        "user2" : "password1234"
    }

}
```

### Call Examples

* Fetch all records
  * basic authentication using employee credentials maintained in _config.json_
  * filtering capablity for *status* and *date*
  
```
GET http://localhost:3000/api/reservations?status=cancelled
```
or
```
QUERY
query Reservation($status:String, $date:String){
    getAllReservations(status:$status, date:$date) {
        hiltonRestaurant {
            name
            mobile
            email
            numberOfGuests
            numberOfTables
            expectedArrivalDate
            expectedArrivalTime
            status 
            lastUpdatesTime
            type
            resvID
        }
    }
}

VARIABLES
{
    "status":"cancelled"
}
```

* Create an record: 
```
POST http://localhost:3000/api/reservations 
Body: 
{
  "name": "bacon",
  "mobile": "012345678",
  "email": "nobody@nobody.noe",
  "numberOfGuests": 3,
  "numberOfTables": 5,
  "expectedArrivalDate": "2022-01-06",
  "expectedArrivalTime": "12:00"
}
```
or
```
QUERY
mutation Reservation($data:CreateRecordInput!){
    createReservation(newRecord:$data){
        message
        resvID
    }
}

VARIABLES
{ 
  "data": { 
    "name": "ranbow",
    "mobile": "012345678",
    "email": "nobody@nobody.noe",
    "numberOfGuests": 3,
    "numberOfTables": 5,
    "expectedArrivalDate": "2022-01-06",
    "expectedArrivalTime": "12:01"
 }
}
```


* Fetch a single record: 
```
GET http://localhost:3000/api/reservations/HRes_20d02754-182a-461e-b61d-3f6b41f2c89a
```
or
```
QUERY
query Reservation($id:String!){
  getReservationByID(id:$id) {
    name
    mobile
    email
    numberOfGuests
    numberOfTables
    expectedArrivalDate
    expectedArrivalTime
    status
    lastUpdatesTime
    type
    resvID
  }
}

VARIABLES
{ "id" : "HRes_1bc0f8c2-fae9-44d6-b2af-845742601bb8" }

```



* Update an existing record: 
```
POST http://localhost:3000/api/reservations/HRes_20d02754-182a-461e-b61d-3f6b41f2c89a
Body: 
{
  "name": "bacon",
  "mobile": "012345678",
  "email": "nobody@nobody.noe",
  "numberOfGuests": 3,
  "numberOfTables": 5,
  "expectedArrivalDate": "2022-01-06",
  "expectedArrivalTime": "12:00"
}
```
or
```
QUERY
mutation Reservation($id:ID, $data:UpdateRecordInput!){
    updateReservation(id:$id, newRecord:$data){
        message
        resvID
    }
}

VARIABLES
{
  "id" : "HRes_1bc0f8c2-fae9-44d6-b2af-845742601bb8",
  "data" : {
    "name": "Bacon",
    "mobile": "012345678",
    "email": "nobody@nobody.no",
    "numberOfGuests": 2,
    "numberOfTables": 1,
    "expectedArrivalDate": "2023-01-06",
    "expectedArrivalTime": "11:30"
  }
}
```


* Update status of record
```
POST http://localhost:3000/api/reservations/HRes_20d02754-182a-461e-b61d-3f6b41f2c89a/status
Body:
{ "status" : "completed" }
```
or
```
QUERY
mutation Reservation($id:ID, $status:StatusEnum!){
    updateReservationStatus(id:$id, status:$status){
        message
        resvID
    }
}

VARIABLES
{
  "id" : "HRes_1bc0f8c2-fae9-44d6-b2af-845742601bb8",
  "status" : "open"
}




