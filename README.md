# DEEL Backend

This project is a Node.js/Express.js REST API. It simulates a job and contract management system where clients and contractors interact through contracts and jobs. The API includes endpoints for retrieving contracts and jobs, processing payments, depositing funds, and generating administrative reports on professions and top clients.

## Table of Contents

- [Features](#features)
- [Installation & Setup](#installation--setup)
- [File Structure](#file-structure)
- [API Endpoints](#api-endpoints)
  - [Contracts](#contracts)
  - [Jobs](#jobs)
  - [Balances](#balances)
  - [Admin Reports](#admin-reports)
- [Database & ORM](#database--orm)
- [Additional Notes](#additional-notes)

## Features

- **User Profiles:** Supports two types of profiles – clients and contractors.  
- **Contracts:** Clients can create contracts with contractors;
- **Jobs:** Contractors perform jobs for clients; jobs can be marked as paid.  
- **Payment Processing:** Clients can pay for jobs (with balance validation) and funds are transferred to contractors.  
- **Deposits:** Clients can deposit funds into their account but are limited to 25% of their total jobs-to-pay amount at deposit time.  
- **Admin Reporting:**  
  - **Best Profession:** Finds the profession that earned the most money during a given time period.  
  - **Best Clients:** Returns a list of clients who have paid the most for jobs in a given time period (with an optional limit; default is 2).  

## Installation & Setup

### Prerequisites

- **Node.js:** Ensure you have the LTS version of Node.js installed ([download Node.js](https://nodejs.org/en/)).
- **NPM:** Comes bundled with Node.js.

### Setup Steps

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Seed the Database:**

   The project uses SQLite and seeds data into a local file (`database.sqlite3`). **Warning:** Running the seed command will drop any existing database.

   ```bash
   npm run seed
   ```

3. **Start the Server:**

   The application uses `nodemon` to automatically restart when files change.

   ```bash
   npm start
   ```

   The server will run on **http://localhost:3001/**.

## File Structure

Below is an overview of the key files and directories in the project:

```
deel-be/
├── src/
│   ├── app.js                       # Main Express application setup
│   ├── server.js                    # Starts the application server
│   ├── config/
│   │   ├── database.js              # Database configuration settings
│   ├── controllers/
│   │   ├── admin.controller.js      # Handles admin-related functionalities
│   │   ├── balances.controller.js   # Handles balance-related operations
│   │   ├── contracts.controller.js  # Handles contract-related logic
│   │   ├── jobs.controller.js       # Manages job-related operations
│   ├── middleware/
│   │   ├── getProfile.js            # Middleware to retrieve user profile data
│   ├── models/
│   │   ├── contract.js              # Contract model defining schema and relations
│   │   ├── job.js                   # Job model defining schema and relations
│   │   ├── profile.js               # Profile model defining schema and relations
│   ├── routes/
│   │   ├── admin.routes.js          # Defines routes for admin-related operations
│   │   ├── balances.routes.js       # Defines routes for balance-related actions
│   │   ├── contracts.routes.js      # Defines routes for contract management
│   │   ├── jobs.routes.js           # Defines routes for job functionalities
├── scripts/
│   ├── seedDb.js                    # Script to seed the database with initial data
├── package.json                     # Contains project metadata and dependencies
```

## API Endpoints

Below is a detailed description of each RESTful endpoint implemented in this project, including input parameters, output responses, and implementation.

### Contracts

#### GET `/contracts/:id`

- **Description:** Returns a specific contract if it belongs to the authenticated profile.
- **Authentication:** Required – via the `getProfile` middleware; client or contractor must pass their `profile_id` in the request header.
- **Input:**  
  - **URL Parameter:** `id` (Contract ID)
  - **Header:** `profile_id`
- **Output:**  
  - **Success:** Contract details in JSON format.
  - **Error:** 404 if the contract does not belong to the user or does not exist.
- **Implementation:**
  The function checks if the contract belongs to the authenticated user (either as a client or contractor). If it does not exist or access is denied, a 404 error is returned.

#### GET `/contracts`

- **Description:** Returns a list of contracts that belong to the authenticated user. Only contracts that are not terminated are included.
- **Authentication:** Required – client or contractor must pass their `profile_id` in the request header.
- **Input:**  
  - **Header:** `profile_id`
- **Output:**  
  - **Success:** Returns an array of contracts in JSON format.
  - **Error:** 500 if there is an issue retrieving contracts.
- **Implementation:**
  - Uses `getContractFilter` with `excludeTerminated=true` to ensure only active contracts are returned.
  - Retrieves contracts from the database using `Contract.findAll()` with the applied filter.
  - If an error occurs, a `500` response is returned.

### Jobs

#### GET `/jobs/unpaid`

- **Description:** Retrieves all unpaid jobs for the authenticated user under contracts that are active (status `in_progress`).
- **Authentication:** Required – client or contractor must pass their `profile_id` in the request header.
- **Input:**  
  - **Header:** `profile_id`
- **Output:**  
  - **Success:** Returns an array of unpaid jobs.
  - **Error:**  
    - `404` if no unpaid jobs are found.  
    - `500` if there is a server error.
- **Implementation Details:**
  - Determines the user type (`contractor` or `client`) and filters contracts accordingly.
  - Retrieves contracts that belong to the user and are in the `in_progress` state.
  - Includes only jobs that are unpaid (`paid: false`).
  - If no unpaid jobs exist, returns a `404` response.

#### POST `/jobs/:job_id/pay`

- **Description:** Allows a client to pay for a job if they have enough balance. The payment is transferred to the contractor.
- **Authentication:** Clients only.
- **Input:**
  - **URL Parameter:** `job_id`
  - **Header:** `profile_id`
- **Output:**
  - **Success:** Marks the job as paid and updates balances.
  - **Errors:**
    - `403` if the user is not a client or has insufficient balance.
    - `404` if the job or related profiles are not found.
    - `500` if the transaction fails.
- **Implementation:**
  - Ensures only clients can pay.
  - Checks if the job exists and belongs to the client.
  - Uses a transaction to update balances and mark the job as paid.

### Balances

#### POST `/balances/deposit/:userId`

- **Description:** Clients can deposit funds into their account, limited to 25% of their unpaid job total.
- **Authentication:** Only the client can deposit into their own account.
- **Input:**
  - **URL Parameter:** `userId` (must match the authenticated client)
  - **Body:** `{ "amount": <deposit_amount> }`
- **Output:**
  - **Success:** Updates balance and returns new balance.
  - **Errors:** `403` for unauthorized deposits or exceeding the limit, `400` for invalid amounts, `500` for transaction failures.
- **Implementation:**
  - Ensures the deposit is within the allowed limit.
  - Uses a database transaction to update the client’s balance.

### Admin Reports

#### GET `/admin/best-profession?start=<date>&end=<date>`

- **Description:** Returns the profession that earned the most money (sum of job payments) within a given date range.
- **Authentication:** Admin access.
- **Input:**
  - **Query Parameters:**
    - `start` (required) – Start date (`YYYY-MM-DD`).
    - `end` (required) – End date (`YYYY-MM-DD`).
- **Output:**
  - **Success:** `{ "bestProfession": "profession_name", "totalEarnings": amount }`
  - **Errors:** `400` if missing parameters, `500` for server errors.
- **Implementation:**
  - Finds all paid jobs in the specified period.
  - Groups earnings by contractor profession.
  - Returns the highest-earning profession.

#### GET `/admin/best-clients?start=<date>&end=<date>&limit=<integer>`

- **Description:** Returns the list of clients who paid the most for jobs within a given date range.
- **Authentication:** Admin access.
- **Input:**
  - **Query Parameters:**
    - `start` (required) – Start date (`YYYY-MM-DD`).
    - `end` (required) – End date (`YYYY-MM-DD`).
    - `limit` (optional, default: 2) – Number of top clients to return.
- **Output:**
  - **Success:** Array of top-paying clients with `id`, `fullName`, and `totalPaid`.
  - **Errors:** `400` if missing parameters, `500` for server errors.
- **Implementation:**
  - Finds paid jobs in the given period.
  - Aggregates payments per client.
  - Returns the highest-paying clients, limited by the query parameter.

## Database & ORM

- **Database:** SQLite is used as the local database and stores its data in the file `database.sqlite3`.
- **ORM:** Sequelize is used to manage database interactions. All data models for `Profile`, `Contract`, and `Job` are defined in `src/model.js`.
- **Transactions:** Write operations (e.g., payments and deposits) use transactions with a "Read Committed" isolation level to ensure data integrity.

## Additional Notes

- **Authentication:**  
  Users are authenticated by including a `profile_id` header with each request. The middleware `src/middleware/getProfile.js` is responsible for fetching the profile from the database and attaching it to `req.profile`.
  
- **Development Tools:**  
  The server is set up with `nodemon` for automatic reloading during development.
  
- **Potential Improvements:**  
  - A service layer to decouple business logic from controllers could improve maintainability.
  - Unit tests and integration tests may be added to ensure future changes do not introduce regressions.
  - Additional error handling and input validation could be implemented for enhanced security and robustness.