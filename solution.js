import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pg from "pg";
import nodemailer from "nodemailer";
import session from "express-session";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();



const app = express();

//change1
//const port = 3000;
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// const db = new pg.Client({
//   user: "postgres",
//   host: "localhost",
//   database: "world",
//   password: "Sri12@2005",
//   port: 5432,
// });

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
 app.use(express.static("public"));
//app.use("/uploads", express.static("public/uploads"));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: "public/uploads/",
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Save with unique timestamp filename
  }
});
const upload = multer({ storage: storage });
const maill="";


app.use(session({
  secret: "your_secret_key",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 600000 } // 10-minute expiry
}));

app.set("view engine", "ejs");

// Nodemailer setup


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

//
//
const pool = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
      rejectUnauthorized: false, // Required for Render's managed PostgreSQL
  },
});

// Example query
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
      console.error('Error connecting to the database', err);
  } else {
      console.log('Database connected:', res.rows);
  }
  pool.end();
});

//module.exports = pool;

//
//
//

// Function to generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Middleware to check if the user is an admin
function isAdmin(req, res, next) {
  if (req.session.userEmail) {
    db.query("SELECT role FROM userinfo WHERE email = $1", [req.session.userEmail])
      .then(result => {
        if (result.rows[0].role === "admin") {
          next();
        } else {
          res.status(403).send("Access denied");
        }
      })
      .catch(err => {
        console.error("Error checking admin role:", err);
        res.status(500).send("Server error");
      });
  } else {
    res.status(403).send("Not authenticated");
  }
}
// Route to view all users
app.get("/admin/users", isAdmin, async (req, res) => {
  try {
    const usersResult = await db.query("SELECT * FROM userinfo");
    const users = usersResult.rows;
    res.render("adminUsers.ejs", { users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Error fetching users");
  }
});

// Route to view all products
app.get("/admin/products", isAdmin, async (req, res) => {
  try {
    const postsResult = await db.query("SELECT * FROM posts ORDER BY created_at DESC");
    const posts = postsResult.rows;
    res.render("adminProducts.ejs", { posts });
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).send("Error fetching posts");
  }
});
app.post("/admin/delete-user/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM userinfo WHERE id = $1", [id]);
    res.redirect("/admin/users");
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("Error deleting user");
  }
});
app.post("/admin/delete-product/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const postResult = await db.query("SELECT * FROM posts WHERE id = $1", [id]);
    const post = postResult.rows[0];
    if (post && fs.existsSync(path.join(__dirname, "public", post.image_url))) {
      fs.unlinkSync(path.join(__dirname, "public", post.image_url)); // Delete the image file
    }
    await db.query("DELETE FROM posts WHERE id = $1", [id]);
    res.redirect("/admin/products");
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).send("Error deleting product");
  }
});
app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

// Route to render Features page
app.get("/features", (req, res) => {
  res.render("features.ejs");
});

// Route to render About Us page
app.get("/about", (req, res) => {
  res.render("about.ejs");
});


// Registration Route
app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  

  try {
    const checkResult = await db.query("SELECT * FROM userinfo WHERE email = $1", [email]);
    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in.");
    } else {
      await db.query("INSERT INTO userinfo (email, password) VALUES ($1, $2)", [email, password]);
      req.session.userEmail = email;
      const postsResult = await db.query("SELECT * FROM posts ORDER BY created_at DESC");
        const posts = postsResult.rows;
        const userRole='user';
      res.render("pro.ejs",{posts,userRole});
    }
  } catch (err) {
    console.log(err);
  }
});


// Login Route
app.post("/login", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  //maill=email;

  try {

    const result = await db.query("SELECT * FROM userinfo WHERE email = $1", [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      if (password === user.password) {
        req.session.userEmail = email; // Store user_id in session
        
        const userRoleResult = await db.query("SELECT role FROM userinfo WHERE email = $1", [req.session.userEmail]);
        const userRole = userRoleResult.rows[0]?.role;
        const postsResult = await db.query("SELECT * FROM posts ORDER BY created_at DESC");
        const posts = postsResult.rows;
        res.render("pro.ejs", { posts ,userRole});
      } else {
        res.render("fp.ejs");
      }
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
  }
});


// Forget Password Route
app.get("/forget-password", (req, res) => {
  res.render("forget-password.ejs");
});

// Send OTP
app.post("/send-otp", async (req, res) => {
  const email = req.body.email;  // Email entered by the user
  const otp = generateOTP();  // Generate a random 6-digit OTP
  
  // Store email and OTP in session
  req.session.email = email;
  req.session.otp = otp;

  // Configure the email details
  const mailOptions = {
    from: "shraddhasri743@gmail.com", // Replace with your email
    to: email,
    subject: "Your OTP for Password Reset",
    text: `Your OTP is: ${otp}`
  };

  try {
    // Send the OTP via email
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "OTP sent to your email." });
  } catch (error) {
    console.error("Error sending email:", error);
    res.json({ success: false, message: "Error sending OTP. Try again." });
  }
});


// Verify OTP
app.post("/verify-otp", (req, res) => {
  const { otp } = req.body;

  if (req.session.otp === otp) {
    req.session.otp = null;
    res.json({ success: true, message: "OTP verified. Proceed to reset password." });
  } else {
    res.json({ success: false, message: "Incorrect OTP. Try again." });
  }
});

// Reset Password
app.post("/reset-password", async (req, res) => {
  const newPassword = req.body.newPassword;
  const email = req.session.email;

  try {
    await db.query("UPDATE userinfo SET password = $1 WHERE email = $2", [newPassword, email]);
    req.session.destroy();
    res.render("home.ejs");
    // res.json({ success: true, message: "Password successfully reset." });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Error resetting password. Try again." });
  }
});


// Get products page

// Route to get all posts and render the index page
app.get("/pro", async (req, res) => {
  const userRole='user';
  try {
      const result = await db.query("SELECT * FROM posts ORDER BY created_at DESC");
      const posts = result.rows;
      res.render("pro.ejs", { posts,userRole });
  } catch (err) {
      console.error("Error fetching posts:", err);
      res.status(500).send("Error fetching posts");
  }
});

// Route to render the create post page
app.get("/create", (req, res) => {
  res.render("createPost.ejs");
});

// Route to handle post creation with image upload
app.post("/create", upload.single("image"), async (req, res) => {
  const { title, content } = req.body;
  const imageUrl = `/uploads/${req.file.filename}`;
  const userEmail = req.session.userEmail;

  try {
      await db.query("INSERT INTO posts (title, content, image_url,user_email) VALUES ($1, $2, $3,$4)", [title, content, imageUrl,userEmail]);
      res.redirect("/pro");
  } catch (err) {
      console.error("Error creating post:", err);
      res.status(500).send("Error creating post");
  }
});

// Route to render the edit post page with the specified id
app.get("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const userEmail = req.session.userEmail; // Get the logged-in user's email
  
  try {
      const result = await db.query("SELECT * FROM posts WHERE id = $1", [id]);
      const post = result.rows[0];

      if (post) {
        if (post.user_email === userEmail) { // Check if the post belongs to the logged-in user
          res.render("editPost.ejs", { post });
        } else {
          res.status(403).send("You can only edit your own posts");
        }
      } else {
          res.status(404).send("Post not found");
      }
  } catch (err) {
      console.error("Error fetching post:", err);
      res.status(500).send("Error fetching post");
  }
});

// Route to handle updating a post with a new image if provided
app.post("/edit/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
      const result = await db.query("SELECT * FROM posts WHERE id = $1", [id]);
      const post = result.rows[0];


      if (post) {
          let imageUrl = post.image_url;

          // Update the image if a new file is uploaded
          if (req.file) {
              if (fs.existsSync(path.join(__dirname, 'public', imageUrl))) {
                  fs.unlinkSync(path.join(__dirname, 'public', imageUrl));
              }
              imageUrl = `/uploads/${req.file.filename}`;
          }

          // Update the post in the database
          await db.query("UPDATE posts SET title = $1, content = $2, image_url = $3 WHERE id = $4", [title, content, imageUrl, id]);
  
          res.redirect("/pro");
      } else {
          res.status(404).send("Post not found");
      }
  } catch (err) {
      console.error("Error updating post:", err);
      res.status(500).send("Error updating post");
  }
});

// Route to delete a post
app.post("/delete/:id", async (req, res) => {
  const { id } = req.params;
  const userEmail = req.session.userEmail; // Get the logged-in user's email

  try {
      const result = await db.query("SELECT * FROM posts WHERE id = $1", [id]);
      const post = result.rows[0];

      if (post) {
        if (post.user_email === userEmail) { // Check if the post belongs to the logged-in user
          if (fs.existsSync(path.join(__dirname, "public", post.image_url))) {
            fs.unlinkSync(path.join(__dirname, "public", post.image_url)); // Delete the image file
          }
          await db.query("DELETE FROM posts WHERE id = $1", [id]); // Delete the post from the database
          res.redirect("/pro");
        } else {
          res.status(403).send("You can only delete your own posts");
        }
         
      } else {
          res.status(404).send("Post not found");
      }
  } catch (err) {
      console.error("Error deleting post:", err);
      res.status(500).send("Error deleting post");
  }
});

// Route to view profile (Display user profile information)
app.get("/up", async (req, res) => {
  const userEmail = req.session.userEmail ; // Assuming the user's email is stored in session after login
  
  try {
    const result = await db.query("SELECT * FROM userinfo WHERE email = $1", [userEmail]);
    if (result.rows.length > 0) {
      const userProfile = result.rows[0];
      res.render("up.ejs", { userProfile });
    } else {
      res.send("Profile not found");
    }
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).send("Error fetching profile");
  }
});

// Route to edit profile (display the form with current profile data)
app.get("/edit-profile", async (req, res) => {
  const userEmail = req.session.userEmail;
  
  try {
    const result = await db.query("SELECT * FROM userinfo WHERE email = $1", [userEmail]);
    if (result.rows.length > 0) {
      const userProfile = result.rows[0];
      res.render("editProfile.ejs", { userProfile });
    } else {
      res.send("Profile not found");
    }
  } catch (err) {
    console.error("Error fetching user profile for edit:", err);
    res.status(500).send("Error fetching profile");
  }
});

// Route to update profile information (handle form submission)
app.post("/update-profile", upload.single("profilePhoto"), async (req, res) => {
  const userEmail = req.session.userEmail; // User's email from session
  const { name, enroll_no, contact, room_no } = req.body;
  const profilePhoto = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // Update profile details in userinfo table
    await db.query(
      "UPDATE userinfo SET name = $1, enroll_no = $2, contact = $3, room_no = $4, profile_photo = $5 WHERE email = $6",
      [name, enroll_no, contact, room_no, profilePhoto, userEmail]
    );
    res.redirect("/up"); // Redirect to view updated profile
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).send("Error updating profile");
  }
});

// Search Route
app.get("/search", async (req, res) => {
  const userRole='user';
  const searchQuery = req.query.q; // Get the search query from the URL parameter
 
  try {
    const result = await db.query(
      "SELECT * FROM posts WHERE title ILIKE $1 OR content ILIKE $1 ORDER BY created_at DESC",
      [`%${searchQuery}%`]
    );
    const posts = result.rows;
    res.render("pro.ejs", { posts ,userRole});
  } catch (err) {
    console.error("Error fetching search results:", err);
    res.status(500).send("Error fetching search results");
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

