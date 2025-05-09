start : npm run dev

Dependencies
The project uses the following major packages:

express – Web framework for Node.js

mongoose – MongoDB object modeling tool

dotenv – Loads environment variables from .env file

cors – Enables Cross-Origin Resource Sharing

morgan – HTTP request logger middleware

bcryptjs – For hashing passwords

jsonwebtoken – For user authentication and authorization

nodemailer – For sending email

pdfkit – For invoice PDF generation

npm run i to install all the Dependencies

API Endpoints

Auth Routes
POST /api/auth/register – Register a new user

POST /api/auth/login – Login user

GET /api/auth/profile – Get current user profile

User Routes
POST /api/users/ – Register a new user

GET /api/users/ – Get all users

GET /api/users/profile – Get user profile

PUT /api/users/profile – Update user profile

GET /api/users/:id – Get user by ID

PUT /api/users/:id – Update user by ID

DELETE /api/users/:id – Delete user

Invoice Routes
GET /api/invoices/ – Get all invoices

POST /api/invoices/ – Create an invoice

PUT /api/invoices/:id/status – Update invoice status

DELETE /api/invoices/:id – Delete an invoice

GET /api/invoices/:id/download – Download invoice

Client Routes
GET /api/clients/ – Get all clients

POST /api/clients/ – Create a new client

GET /api/clients/:id – Get client by ID

PUT /api/clients/:id – Update client

DELETE /api/clients/:id – Delete client

Task Routes
GET /api/projects/ – Get all projects

POST /api/projects/ – Create a new project

GET /api/projects/:id – Get project by ID

POST /api/projects/:id – Update project

DELETE /api/projects/:id – Delete project

Task Routes
GET /api/tasks/project/:projectId – Get tasks by project

POST /api/tasks/ – Create a task

Team Routes
GET /api/team/project/:projectId – Get team for a project

POST /api/team/ – Assign a team member
