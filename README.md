Here's a complete `README.md` file tailored for your project:

```markdown
# College Bazaar

**College Bazaar** is a platform designed for college students to buy and sell items directly within their community. It features verified authentication for students, easy product management, and a user-friendly admin interface for managing users and posts.

---

## Features

### For Users:
- **User Authentication**
  - Register and log in using verified college credentials.
  - Password recovery via OTP-based email reset.

- **Post Management**
  - Create, edit, delete posts with images.
  - Search and filter products by title or keywords.

- **Profile Management**
  - View and update profile details.
  - Upload profile pictures.

---

### For Admins:
- View all users and their products.
- Delete user accounts and posts directly from the admin dashboard.

---

## Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: EJS templates, CSS (Plum and white theme)
- **Database**: PostgreSQL
- **Storage**: Multer for file uploads
- **Session Management**: express-session
- **Email Service**: Nodemailer for OTP handling

---

## Prerequisites

Before running the application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) and npm
- [PostgreSQL](https://www.postgresql.org/)
- A Gmail account for email services

---

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/college-bazaar.git
   cd college-bazaar
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up the Database**
   - Create a PostgreSQL database named `world`.
   - Use the following schema for tables:

     ```sql
     CREATE TABLE userinfo (
       id SERIAL PRIMARY KEY,
       email VARCHAR(255) UNIQUE NOT NULL,
       name VARCHAR(255),
       enrolno VARCHAR(50),
       contactno VARCHAR(20),
       roomno VARCHAR(50),
       profilepic VARCHAR(255)
     );

     CREATE TABLE posts (
       id SERIAL PRIMARY KEY,
       userid INT REFERENCES userinfo(id),
       title VARCHAR(255),
       description TEXT,
       image VARCHAR(255)
     );

     CREATE TABLE user (
       userid SERIAL PRIMARY KEY,
       mail VARCHAR(255) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL
     );
     ```

4. **Configure Environment Variables**
   - Create a `.env` file in the root folder and add the following:
     ```env
     DB_USER=your_db_user
     DB_PASSWORD=your_db_password
     DB_NAME=world
     DB_HOST=localhost
     DB_PORT=5432
     GMAIL_USER=your_email@gmail.com
     GMAIL_PASS=your_gmail_app_password
     SESSION_SECRET=your_secret_key
     ```

5. **Run the Application**
   ```bash
   npm start
   ```

6. **Access the Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

1. **User Registration and Login**
   - Register as a new user and log in to access features.
   
2. **Create and Manage Posts**
   - Upload products for sale with images.
   - Edit or delete your posts.

3. **Admin Dashboard**
   - Access the admin page to view and delete user accounts and products.

4. **Profile Management**
   - Update your profile details and upload a profile picture.

---

## Project Structure

```
college-bazaar/
├── public/
│   ├── uploads/          # Directory for uploaded images
│   └── styles.css        # Application styling
├── views/
│   ├── home.ejs          # Homepage
│   ├── login.ejs         # Login page
│   ├── register.ejs      # Registration page
│   ├── createPost.ejs    # Create post form
│   ├── editPost.ejs      # Edit post form
│   ├── adminUsers.ejs    # Admin: View users
│   ├── adminProducts.ejs # Admin: View products
│   ├── up.ejs            # Profile page
│   └── editProfile.ejs   # Edit profile page
├── solution.js           # Main server file
├── package.json          # Dependencies and scripts
└── README.md             # Documentation
```

---

## Contributing

We welcome contributions! Follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push the branch (`git push origin feature/your-feature`).
5. Open a pull request.

---

## License

This project is licensed under the MIT License.

---

## Contact

For any questions or suggestions, contact:

- **Email**: collegebazaar4@gmail.com
- **Author**: Shraddha Sri
```
