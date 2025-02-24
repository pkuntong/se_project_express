# WTWR (What to Wear?): Back End

The WTWR (What to Wear?) back-end project focuses on creating a robust server to support the WTWR application. The application helps users select appropriate clothing based on weather conditions. This project emphasizes building a secure and functional API, managing user authentication, connecting to a database, and deploying the server to a remote machine.

## Project Description

This project serves as the back end for the WTWR application. It provides RESTful API endpoints for:

- Managing clothing items (CRUD operations)
- User registration and authentication
- User profile management

The server interacts with a MongoDB database to store user information and clothing items. It also implements security features such as password hashing, data validation, and authorization checks.

## Functionality

- **User Registration and Login**: Users can create an account and log in to access personalized features.
- **CRUD Operations**: Perform Create, Read, Update, and Delete operations for clothing items.
- **Authorization**: Routes are protected, allowing only authenticated users to access specific resources.
- **Error Handling**: Provides clear error messages and handles edge cases gracefully.

## Technologies and Techniques Used

- **Node.js**: JavaScript runtime for building server-side applications.
- **Express.js**: Web framework for handling routes and middleware.
- **MongoDB**: NoSQL database for storing user and clothing item data.
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB.
- **Nodemon**: Utility to automatically restart the server during development.
- **Postman**: API testing tool for verifying endpoints during development.

## Running the Project

To start the server, use the following commands:

- `npm run start` — Launch the server.
- `npm run dev` — Launch the server with the hot reload feature (using `nodemon`).

### Testing

Before committing your code, make sure to edit the `sprint.txt` file in the root folder. The file `sprint.txt` should contain the number of the sprint you're currently working on (e.g., "12").

## Deployment

The back end can be deployed on platforms such as Heroku, AWS, or any server that supports Node.js applications.

## Project Domain

https://gcp-demo.mooo.com/


