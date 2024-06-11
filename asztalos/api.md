| Controller                  | Endpoint           | Method | Parameters                                  | Return                           | Description                   |
| --------------------------- | ------------------ | ------ | ------------------------------------------- | -------------------------------- | ----------------------------- |
| **AccountController**       | /account           |        |                                             |                                  |                               |
|                             | /checkToken        | POST   | Map<String, String>                         | ResponseEntity<Object>           | Check token validity          |
|                             | /profile           | GET    | Authentication                              | ResponseEntity<Object>           | Get user profile              |
|                             | /login             | POST   | LoginDto                                    | ResponseEntity<Object>           | User login                    |
|                             | /register          | POST   | RegisterDto                                 | ResponseEntity<Object>           | User registration             |
| **ClientController**        | /clients           |        |                                             |                                  |                               |
|                             |                    | GET    | Long clientId                               | ResponseEntity<?>                | Get clients                   |
|                             |                    | POST   | Client client                               | ResponseEntity<?>                | Create a client               |
|                             | /{id}              | PUT    | Long id, Client clientDetails               | ResponseEntity<Client>           | Update a client               |
|                             | /{id}              | DELETE | Long id                                     | ResponseEntity<Void>             | Delete a client               |
| **ClientPaymentController** | /client-payments   |        |                                             |                                  |                               |
|                             |                    | GET    | Long paymentId                              | ResponseEntity<?>                | Get client payments           |
|                             | /client/{clientId} | GET    | Long clientId                               | ResponseEntity<?>                | Get client payments by client |
|                             | /work/{workId}     | GET    | Long workId                                 | ResponseEntity<?>                | Get client payments by work   |
|                             | /user              | GET    | Long userId                                 | ResponseEntity<?>                | Get client payments by user   |
|                             |                    | POST   | ClientPayment clientPayment                 | ResponseEntity<ClientPayment>    | Create a client payment       |
|                             | /{id}              | PUT    | Long id, ClientPayment clientPaymentDetails | ResponseEntity<ClientPayment>    | Update a client payment       |
|                             | /{id}              | DELETE | Long id                                     | ResponseEntity<Void>             | Delete a client payment       |
| **ColorController**         | /colors            |        |                                             |                                  |                               |
|                             |                    | POST   | Color color                                 | ResponseEntity<Color>            | Create a color                |
|                             | /{id}              | GET    | Long id                                     | ResponseEntity<Color>            | Get color by ID               |
|                             |                    | GET    |                                             | ResponseEntity<List<Color>>      | Get all colors                |
|                             | /{id}              | PUT    | Long id, Color colorDetails                 | ResponseEntity<Color>            | Update a color                |
|                             | /{id}              | DELETE | Long id                                     | ResponseEntity<Void>             | Delete a color                |
| **CreatedItemController**   | /created-items     |        |                                             |                                  |                               |
|                             |                    | POST   | CreatedItem createdItem                     | ResponseEntity<?>                | Create a created item         |
|                             | /{id}              | GET    | Long id                                     | ResponseEntity<?>                | Get created item by ID        |
|                             | /{id}              | DELETE | Long id                                     | ResponseEntity<?>                | Delete created item           |
|                             | /{id}              | PUT    | Long id, CreatedItem updatedItem            | ResponseEntity<?>                | Update created item           |
| **ObjectController**        | /objects           |        |                                             |                                  |                               |
|                             |                    | GET    | Long objectId                               | ResponseEntity<?>                | Get objects                   |
|                             |                    | POST   | WorkObject workObject                       | ResponseEntity<?>                | Create an object              |
|                             | /{id}              | PUT    | Long id, WorkObject objectDetails           | ResponseEntity<WorkObject>       | Update an object              |
|                             | /{id}              | DELETE | Long id                                     | ResponseEntity<Void>             | Delete an object              |
| **ScriptController**        | /scripts           |        |                                             |                                  |                               |
|                             |                    | POST   | Script script                               | ResponseEntity<Script>           | Create a script               |
|                             | /{id}              | GET    | Long id                                     | Script                           | Get script by ID              |
|                             |                    | GET    |                                             | List<Script>                     | Get all scripts               |
|                             | /{id}              | PUT    | Long id, Script scriptDetails               | ResponseEntity<Script>           | Update a script               |
|                             | /{id}              | DELETE | Long id                                     | ResponseEntity<Void>             | Delete a script               |
| **ScriptItemController**    | /script-item       |        |                                             |                                  |                               |
|                             | /script/{scriptId} | GET    | Long scriptId                               | ResponseEntity<List<ScriptItem>> | Get script items by script ID |
|                             | /{itemId}          | GET    | Long itemId                                 | ResponseEntity<ScriptItem>       | Get script item by ID         |
|                             |                    | POST   | ScriptItem scriptItem                       | ResponseEntity<ScriptItem>       | Create a script item          |
|                             | /{itemId}          | DELETE | Long itemId                                 | ResponseEntity<Void>             | Delete a script item          |
|                             | /{id}              | PUT    | Long id, ScriptItem scriptItemDetails       | ResponseEntity<ScriptItem>       | Update a script item          |
| **UserController**          | /users             |        |                                             |                                  |                               |
|                             | /{id}              | PUT    | Long id, User userDetails                   | ResponseEntity<User>             | Update a user                 |
|                             |                    | PUT    | User userDetails                            | ResponseEntity<User>             | Update self                   |
|                             | /{id}              | DELETE | Long id                                     | ResponseEntity<Void>             | Delete a user                 |
| **UserPaymentController**   | /user-payments     |        |                                             |                                  |                               |
|                             |                    | GET    | Long paymentId                              | ResponseEntity<?>                | Get user payments             |
|                             | /user/{userId}     | GET    | Long userId                                 | ResponseEntity<?>                | Get user payments by user     |
|                             |                    | POST   | UserPayment userPayment                     | ResponseEntity<UserPayment>      | Create a user payment         |
|                             | /{id}              | PUT    | Long id, UserPayment userPaymentDetails     | ResponseEntity<UserPayment>      | Update a user payment         |
|                             | /{id}              | DELETE | Long id                                     | ResponseEntity<Void>             | Delete a user payment         |
| **WorkController**          | /works             |        |                                             |                                  |                               |
|                             |                    | GET    | Long workId                                 | ResponseEntity<?>                | Get works                     |
|                             | /{id}              | PUT    | Long id, Work workDetails                   | ResponseEntity<Work>             | Update a work                 |
|                             | /{id}              | DELETE | Long id                                     | ResponseEntity<Void>             | Delete a work                 |
|                             |                    | POST   | Create a work                               |
