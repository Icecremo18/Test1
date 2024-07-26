const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const mysql = require("mysql2/promise");
const helmet = require('helmet');
const app = express();
const saltRounds = 10;
const crypto = require('crypto');
const nodemailer = require("nodemailer");
const secret = "login-api";
const corsOptions = {
  origin: "http://localhost:3000", // หรือโดเมนที่คุณใช้รัน React
  origin: ['http://localhost:3002'], // เพิ่ม origin ที่คุณต้องการอนุญาต
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(helmet());
app.use(helmet.noSniff());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"], // อนุญาตให้โหลดทรัพยากรจากต้นทางเดียวกัน
    scriptSrc: ["'self'", "https://trusted.cdn.com"], // อนุญาตให้โหลดสคริปต์จากต้นทางเดียวกันและ CDN ที่เชื่อถือได้
    styleSrc: ["'self'", "https://trusted.cdn.com"], // อนุญาตให้โหลดสไตล์จากต้นทางเดียวกันและ CDN ที่เชื่อถือได้
    imgSrc: ["'self'", "data:"], // อนุญาตให้โหลดภาพจากต้นทางเดียวกันและ data URIs
    frameAncestors: ["'none'"], // ป้องกันการฝังเนื้อหา
    formAction: ["'self'"], // อนุญาตให้ส่งฟอร์มไปยังโดเมนเดียวกัน
    connectSrc: ["'self'", "https://api.trusted.com"] // อนุญาตให้เชื่อมต่อไปยังต้นทางเดียวกันและ API ที่เชื่อถือได้
  }
}));
app.use(helmet.frameguard({ action: 'sameorigin' }));


app.use(cors(corsOptions));
app.use(bodyParser.json());
const jsonParser = bodyParser.json();
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "mysql-nodejs",
  port: "3007",
});

const uploadDir = path.join(
  __dirname,
  "..",
  "react-login",
  "public",
  "uploads",
  "profile"
);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}






// กำหนดการบันทึกไฟล์โปรไฟล์ด้วย Multer
const storageprofile = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// const uploadProfileImage = multer({
//   storage: storageprofile,
//   limits: { fieldSize: 25 * 1024 * 1024 },
// });

// Endpoint API สำหรับอัพเดทข้อมูลโปรไฟล์
app.patch("/userprofileedit/:id", async (req, res) => {
  const ID = req.params.id;
  const { First_name, Last_name, phone, email } = req.body;

  if (
    First_name === undefined ||
    Last_name === undefined ||
    phone === undefined ||
    email === undefined
  ) {
    return res.status(400).json({ message: "Invalid edit" });
  }

  try {
    const connection = await pool.getConnection();
    try {
      const sqlUpdateProfile =
        "UPDATE users SET First_name = ?, Last_name = ?, email = ?, phone = ? WHERE ID = ?";
      await connection.query(sqlUpdateProfile, [
        First_name,
        Last_name,
        email,
        phone,
        ID,
      ]);
      res.status(200).json({ message: "DONE" });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// Endpoint API สำหรับอัพโหลดภาพโปรไฟล์
const uploadProfileImage = multer({
  storage: storageprofile,
  limits: { fileSize: 25 * 1024 * 1024 }, // เปลี่ยน fieldSize เป็น fileSize
}).single("profileImage"); // ชื่อฟิลด์ที่คาดหวังคือ 'profileImage'

app.post("/uploadProfileImage/:id", uploadProfileImage, async (req, res) => {
  const userId = req.params.id;
  console.log(req.file);
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imagePath = req.file.path;

    const connection = await pool.getConnection();
    try {
      const sqlUpdateProfileImage = "UPDATE users SET profile = ? WHERE ID = ?";
      await connection.query(sqlUpdateProfileImage, [imagePath, userId]);

      res.status(200).json({ message: "Profile image uploaded successfully" });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error uploading profile image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// การตั้งค่าและการเชื่อมต่อของส่วนอื่นๆ

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadMiddleware = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "pdfFile", maxCount: 1 },
]);



app.get("/books", async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT book.*, users.profile as userProfile, CONVERT(PDF USING utf8) as pdf , users.First_name,categorybook.categoryname FROM book JOIN users ON book.userupload = users.ID JOIN  categorybook ON book.typing = categorybook.categoryID ORDER BY book.name ASC"
);
    const formattedResults = results.map((result) => ({
      ...result,
      userProfile: result.userProfile
        ? result.userProfile.replace(/^.*[\\/]/, "")
        : "",
    }));
    res.json(formattedResults);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/users", async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT * FROM users WHERE Role = ? ORDER BY username ASC",
      ["user"]
    );
    res.send(results);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/users/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const [results] = await pool.query("DELETE FROM users WHERE ID = ?", [
      userId,
    ]);
    res.send({ message: "Delete success" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/booksdelete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const [results] = await pool.query("DELETE FROM book WHERE bookID = ?", [
      id,
    ]);
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    console.error("Error deleting book data:", err);
    res.status(500).json({ error: "Internal Server Error", details: err });
  }
});

app.patch("/books/:id", async (req, res) => {
  const bookId = req.params.id;

  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({ message: "Invalid request body" });
  }

  if (!req.body.name) {
    return res.status(400).json({ message: "Invalid book name" });
  }

  const {
    name = "",
    write = "",
    publish = "",
    detail = "",
    typing = "",
  } = req.body;
  console.log(req.body);

  try {
    // ดึง categoryID จาก categorybook โดยใช้ category_name
    const [categoryResults] = await pool.query(
      "SELECT categoryID FROM categorybook WHERE categoryname = ?",
      [typing]
    );

    if (categoryResults.length === 0) {
      return res.status(400).json({ message: "Invalid category name" });
    }

    const categoryCode = categoryResults[0].categoryID;
    console.log(categoryCode);

    // อัปเดตตาราง book พร้อมกับ categoryID ที่ดึงมา
    const [results] = await pool.query(
      "UPDATE book SET `name` = ?, `write` = ?, `publish` = ?, `detail` = ?, `typing` = ? WHERE bookID = ?",
      [name, write, publish, detail, categoryCode, bookId]
    );
    console.log(results);

    res.status(200).json({ message: "DONE" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to update book" });
  }
});

app.get("/usersprofile/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const [results] = await pool.query(
      `SELECT * FROM users WHERE ID = ${userId}`
    );

    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/adminedit/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const [results] = await pool.query(
      "SELECT * FROM users WHERE Role = ? AND ID = ?",
      ["user", userId]
    );

    if (results.length > 0) {
      res.json(results);
    } else {
      res.status(404).json({ message: "Books not found for this user" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/mybooksuser/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const [results] = await pool.query(
      `SELECT book.bookID,book.name,book.detail,book.write,book.publish, categorybook.categoryname AS category_name 
       FROM book 
       JOIN categorybook ON book.typing = categorybook.categoryID 
       WHERE book.userupload = ?`,
      [userId]
    );
    res.send(results);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post('/register', jsonParser, async function (req, res) {
  try {
    const connection = await pool.getConnection();
    try {
      // Check if email already exists
      const [emailResults] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [req.body.email_address]
      );

      if (emailResults.length > 0) {
        res.json({ status: 'fail', message: 'email ซ้ำ' });
        return;
      }

      // Hash password and insert new user
      bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
        if (err) {
          res.json({ status: 'error', message: err });
          return;
        }

        try {
          const [results] = await connection.execute(
            'INSERT INTO users (`username`, `password`, `email`, `phone`, `First_name`, `Last_name`, `Role`, `profile`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
              req.body.username,
              hash,
              req.body.email_address,
              req.body.phone,
              req.body.fname,
              req.body.lname,
              'user',
              '',  // ค่าของคอลัมน์ `profile` สามารถเปลี่ยนเป็นค่าที่ต้องการได้
            ]
          );
          res.json({ status: 'ok' });
        } catch (insertErr) {
          res.json({ status: 'error', message: insertErr });
        }
      });
    } finally {
      connection.release();
    }
  } catch (connErr) {
    res.json({ status: 'error', message: connErr });
  }
});



app.post("/login", jsonParser, async function (req, res, next) {
  try {
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.execute(
        "SELECT * FROM users WHERE username=?",
        [req.body.username]
      );
      if (users.length == 0) {
        res.json({ status: "error", message: "no user found" });
        return;
      }
      bcrypt.compare(
        req.body.password,
        users[0].password,
        function (err, isLogin) {
          if (isLogin) {
            var token = jwt.sign(
              {
                username: users[0].username,
                Role: users[0].Role,
                ID: users[0].ID,
                First_name: users[0].First_name,
              },
              secret,
              { expiresIn: "1h" }
            );
            res.json({ status: "ok", message: "login success", token });
            console.log(err);
          } else {
            res.json({ status: "error", message: "login failed" });
          }
        }
      );
    } finally {
      connection.release();
    }
  } catch (err) {
    res.json({ status: "error", message: err });
  }
});

app.post("/authen", jsonParser, function (req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    var decoded = jwt.verify(token, secret);
    res.json({ status: "ok", decoded });
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

app.get("/get_img/:id", async (req, res) => {
  const ID = req.params.id; // เปลี่ยนเป็น const

  try {
    const [results] = await pool.query(
      "SELECT profile FROM users WHERE ID = ?",
      [ID] // ใช้ตัวแปร ID ที่ได้จาก params
    );

    if (results.length > 0) {
      const userProfile = results[0];
      res.send(userProfile);
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/books_PDF/:id", async (req, res) => {
  const bookId = req.params.id;

  try {
    const [results] = await pool.query(
      "SELECT PDF FROM book WHERE bookID = ?",
      [bookId]
    );

    if (results.length > 0) {
      res.send(results[0]);
    } else {
      res.status(404).json({ error: "PDF not found for this book ID" });
    }
  } catch (error) {
    console.error("Error fetching PDF:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post(
  "/addbook",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "pdfFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, detail, write, publish, typing, userid } = req.body;
      const coverImage = req.files["coverImage"][0];
      const pdfFile = req.files["pdfFile"][0];

      const uploadDirCoverImage = path.join(
        "C:",
        "Users",
        "Cite",
        "Downloads",
        "โปรเจ็คท้าย",
        "myapp",
        "react-login",
        "public",
        "uploads",
        "profile",
        "coverimg"
      );
      const uploadDirPdfFile = path.join(
        "C:",
        "Users",
        "Cite",
        "Downloads",
        "โปรเจ็คท้าย",
        "myapp",
        "react-login",
        "public",
        "uploads",
        "profile",
        "pdf"
      );

      if (!fs.existsSync(uploadDirCoverImage)) {
        fs.mkdirSync(uploadDirCoverImage, { recursive: true });
      }

      if (!fs.existsSync(uploadDirPdfFile)) {
        fs.mkdirSync(uploadDirPdfFile, { recursive: true });
      }

      const coverImageName = `${Date.now()}-${coverImage.originalname}`;
      const pdfFileName = `${Date.now()}-${pdfFile.originalname}`;

      const coverImagePath = path.join(uploadDirCoverImage, coverImageName);
      const pdfFilePath = path.join(uploadDirPdfFile, pdfFileName);

      fs.writeFileSync(coverImagePath, coverImage.buffer);
      fs.writeFileSync(pdfFilePath, pdfFile.buffer);

      // บันทึก path เป็น relative path
      const relativeCoverImagePath = `/uploads/profile/coverimg/${coverImageName}`;
      const relativePdfFilePath = `/uploads/profile/pdf/${pdfFileName}`;

      const connection = await pool.getConnection();
      try {
        const sqlSelectCategoryID =
          "SELECT categoryID FROM categorybook WHERE categoryname = ?";
        const [categoryResult] = await connection.query(sqlSelectCategoryID, [
          typing,
        ]);

        if (!categoryResult || categoryResult.length === 0) {
          return res.status(404).json({ error: "Category not found" });
        }

        const categoryID = categoryResult[0].categoryID;

        const sqlInsertBook =
          "INSERT INTO book (`name`, `detail`, `write`, `publish`, `typing`, `cover_image`, `PDF`, `userupload`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        await connection.query(sqlInsertBook, [
          name,
          detail,
          write,
          publish,
          categoryID,
          relativeCoverImagePath,
          relativePdfFilePath,
          userid,
        ]);

        res.status(200).send("Values inserted");
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Error processing request");
    }
  }
);

app.get("/get_img_mybook/:id", async (req, res) => {
  const ID = req.params.id;

  try {
    const [results] = await pool.query(
      `SELECT *
   FROM users
   INNER JOIN book ON users.ID = book.userupload
   WHERE book.userupload = ?`,
      [ID]
    );

    if (results.length > 0) {
      res.send(results[0].profile); // Send the profile directly
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    console.error(err); // Use console.error for error logging
    res.status(500).send("Internal Server Error");
  }
});

app.get("/users_mybook", async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT book.userupload FROM users,book WHERE book.userupload = users.ID ",
      ["user"]
    );
    res.send(results);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});



app.post("/booklike/:id", (req, res) => {
  const bookId = parseInt(req.params.id);
  pool.query(
    "UPDATE book SET likes = likes + 1 WHERE bookID = ?",
    [bookId],
    (err, result) => {
      if (err) throw err;
      res.send({ message: "Book liked" });
    }
  );
});

app.post("/bookdislike/:id", (req, res) => {
  const bookId = parseInt(req.params.id);
  pool.query(
    "UPDATE book SET dislikes = dislikes + 1 WHERE bookID = ?",
    [bookId],
    (err, result) => {
      if (err) throw err;
      res.send({ message: "Book disliked" });
    }
  );
});

// Middleware to verify JWT and extract user ID
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token)
    return res.status(403).send({ auth: false, message: "No token provided." });

  jwt.verify(token, "your_secret_key", (err, decoded) => {
    if (err)
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate token." });

    req.userId = decoded.id;
    next();
  });
};

app.post('/books/:bookID/:userID/like', async (req, res) => {
  const { bookID, userID } = req.params;
  const {status} = req.body; // รับค่า status จาก body ของ request
  let client;

  console.log("bookID::",bookID);
  console.log("userID:",userID);
  console.log("status:",status);

  try {
    client = await pool.getConnection(); // เชื่อมต่อกับฐานข้อมูล

    // เริ่ม Transaction
    await client.query('BEGIN');

    if (status === 1) {
      // ถ้า status เป็น 1 ให้เพิ่มการ Like
      await client.query(
        'INSERT INTO likes (bookID, userID) VALUES (?, ?)',
        [bookID, userID]
      );

      // ลบการ Dislike หนังสือในกรณีที่มีการ Dislike แล้ว
      await client.query(
        'DELETE FROM dislikes WHERE bookID = ? AND userID = ?',
        [bookID, userID]
      );
    } else if (status === 0) {
      // ถ้า status เป็น 0 ให้ลบการ Like
      await client.query(
        'DELETE FROM likes WHERE bookID = ? AND userID = ?',
        [bookID, userID]
      );
    }

    // Commit Transaction
    await client.query('COMMIT');
    console.log('Transaction committed');

    // ปล่อยคลายคอนเน็กชัน
    client.release();

    // ส่งผลลัพธ์กลับไปยัง client
    res.status(200).send({ success: true });
  } catch (err) {
    console.error('Error handling like:', err);

    // Rollback Transaction ในกรณีเกิดข้อผิดพลาด
    if (client) {
      await client.query('ROLLBACK');
      client.release(); // ปล่อยคลายคอนเน็กชัน
    }

    // ส่งข้อความผิดพลาดกลับไปยัง client
    res.status(500).send({ success: false, message: err.message });
  }
});








// API to handle dislike
app.post("/books/:bookID/dislike", verifyToken, async (req, res) => {
  const { bookID } = req.params;
  const userID = req.userId;

  try {
    const client = await pool.connect();
    await client.query("BEGIN");

    const dislikeExists = await client.query(
      "SELECT * FROM dislikes WHERE bookID = $1 AND userID = $2",
      [bookID, userID]
    );
    if (dislikeExists.rows.length > 0) {
      await client.query(
        "DELETE FROM dislikes WHERE bookID = $1 AND userID = $2",
        [bookID, userID]
      );
    } else {
      await client.query(
        "INSERT INTO dislikes (bookID, userID) VALUES ($1, $2)",
        [bookID, userID]
      );
      await client.query(
        "DELETE FROM likes WHERE bookID = $1 AND userID = $2",
        [bookID, userID]
      );
    }

    await client.query("COMMIT");
    client.release();

    res.status(200).send({ success: true });
  } catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
});

app.get("/books_getlike_and_getdislike", async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT
        book.bookID,
        users.ID as userID,
        COUNT(likes.id) as like_count,
        COUNT(dislikes.id) as dislike_count
      FROM book
      JOIN users ON book.userupload = users.ID
      LEFT JOIN likes ON book.bookID = likes.bookID
      LEFT JOIN dislikes ON book.bookID = dislikes.bookID AND users.ID = dislikes.userID
      GROUP BY book.bookID, users.ID
    `);

    res.status(200).json(results);
  } catch (err) {
    console.error("Error executing SQL query:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});





// POST /books/:bookID/:userID/reaction
app.post('/books/:bookID/:userID/reaction_test', async (req, res) => {
  const { bookID, userID } = req.params;
  const { reaction } = req.body; // รับค่า reaction จาก body ของ request

  try {
    const conn = await pool.getConnection();

    // เริ่ม Transaction
    await conn.beginTransaction();

    // ลบการ reaction เก่าถ้ามี
    await conn.query(
      'DELETE FROM reactions WHERE bookID = ? AND userID = ?',
      [bookID, userID]
    );

    if (reaction) {
      // เพิ่มการ reaction ใหม่
      await conn.query(
        'INSERT INTO reactions (bookID, userID, reaction) VALUES (?, ?, ?)',
        [bookID, userID, reaction]
      );
    }

    // Commit Transaction
    await conn.commit();

    // ปล่อยคลายคอนเน็กชัน
    conn.release();

    res.status(200).send({ success: true });
  } catch (err) {
    console.error('Error handling reaction:', err);

    // Rollback Transaction ในกรณีเกิดข้อผิดพลาด
    if (conn) {
      await conn.rollback();
      conn.release(); // ปล่อยคลายคอนเน็กชัน
    }

    res.status(500).send({ success: false, message: err.message });
  }
});




// Endpoint to fetch reactions by userID
app.get('/reactions/:userID', async (req, res) => {
  const { userID } = req.params;

  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT * FROM reactions WHERE userID = ?', [userID]);
   

    conn.release();
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching reactions:', error);
    res.status(500).json({ message: 'Failed to fetch reactions' });
  }
});




app.get('/books/:bookID/:userID/reaction', async (req, res) => {
  const { bookID, userID } = req.params;

  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query(
      'SELECT reactions.reaction, users.First_name FROM reactions JOIN users ON users.ID = reactions.userID WHERE bookID = ? AND userID = ?',
      [bookID, userID]
    );
    conn.release();

    if (rows.length > 0) {
      res.status(200).send({ reaction: rows[0].reaction });
    } else {
      res.status(200).send({ reaction: null });
    }
  } catch (err) {
    console.error('Error fetching reaction:', err);
    if (conn) conn.release();
    res.status(500).send({ success: false, message: err.message });
  }
});






app.post('/api/favorite/:book', async (req, res) => {
  const { userID, } = req.body;
  const book = req.params.book;
  const checkQuery = 'SELECT * FROM favorite WHERE usersID = ? AND bookID = ?';
  console.log(req.body,book);
  
  let conn;
  try {
    conn = await pool.getConnection();
    
    // ตรวจสอบว่ามีรายการโปรดอยู่แล้วหรือไม่
    const [existingFavorite] = await conn.query(checkQuery, [userID, book]);

    if (existingFavorite.length > 0) {
      return res.status(400).json({ message: 'Book is already favorited' });
    }

    const insertQuery = 'INSERT INTO favorite(usersID, bookID) VALUES (?, ?)';
    await conn.query(insertQuery, [userID, book]); // แก้ไขที่นี่
    res.status(201).json({ message: 'Book added to favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add favorite' });
  } finally {
    if (conn) conn.release(); // แก้ไขที่นี่
  }
});



app.get("/api/favorites/:userID", async (req, res) => {
  const userID = req.params.userID; // ใช้ req.query แทน req.body สำหรับ GET
  const query = `
    SELECT favorite.*, book.cover_image ,book.name,book.PDF
    FROM favorite 
    JOIN book ON book.bookID = favorite.bookID 
    WHERE favorite.usersID = ?
  `;
  
  let conn; // ประกาศ conn ที่นี่
  try {
    conn = await pool.getConnection();
    const [favorites] = await conn.query(query, [userID]);
    
    res.status(200).json(favorites); // ส่งผลลัพธ์กลับไป
  } catch (err) {
    console.log("status 500", err);
    res.status(500).json({ error: 'Failed to fetch favorite books' });
  } finally {
    if (conn) conn.release(); // ปล่อยการเชื่อมต่อ
  }
});








app.delete('/api/favorite', async (req, res) => {
  const { userID, book } = req.body;
  const query = 'DELETE FROM favorite WHERE usersID = ? AND bookID = ?';
  console.log(req.body);
  let conn;
  try {
      conn = await pool.getConnection();
      const result = await conn.query(query, [userID, book]);
      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Favorite not found' });
      }
      res.status(200).json({ message: 'Book removed from favorites' });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to remove favorite' });
  } finally {
      if (conn) conn.release();
  }
});


app.post("/reviews", async (req, res) => {
  const { bookId, review, userId } = req.body;

  if (!bookId || !review || !userId) {
    return res.status(400).json({ error: 'Please provide bookId, review, and userId' });
  }

  try {
    const connection = await pool.getConnection();

    const [result] = await connection.execute(
      'INSERT INTO review (book_ID, user_ID, review) VALUES (?, ?, ?)',
      [bookId, userId, review]
    );

    connection.release();

    if (result.affectedRows === 1) {
      res.status(200).json({ message: 'Review submitted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to submit review' });
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});






app.get("/reviews", async (req, res) => {
  const { bookId } = req.query;

  if (!bookId) {
    return res.status(400).json({ error: 'Please provide bookId' });
  }

  try {
    const connection = await pool.getConnection();

    const [rows] = await connection.execute(
      'SELECT review.*, users.First_name, users.profile FROM review JOIN users ON users.ID = review.user_ID WHERE book_ID = ?;',
      [bookId]
    );

    connection.release();

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


app.get("/my_reviews/:userid/:book", async (req, res) => {
  const  bookId  = req.params.book;
  const userid = req.params.userid;

  if (!bookId) {
    return res.status(400).json({ error: 'Please provide bookId' });
  }

  try {
    const connection = await pool.getConnection();

    const [rows] = await connection.execute(
      'SELECT review.*, users.First_name, users.profile FROM review JOIN users ON users.ID = review.user_ID WHERE book_ID = ? and users.ID = ? ;',
      [bookId,userid]
    );

    connection.release();

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});



// Endpoint สำหรับลบรีวิว
app.delete('/reviews/:id',async (req, res) => {
  const reviewId = req.params.id;
  const connection = await pool.getConnection();
  // SQL Query สำหรับลบรีวิว
  const sql = 'DELETE FROM review WHERE Review_ID = ?';
  connection.query(sql, [reviewId], (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Internal server error' });
      }

      if (result.affectedRows > 0) {
          res.status(200).json({ message: 'Review deleted successfully' });
      } else {
          res.status(404).json({ message: 'Review not found' });
      }
  });
});




app.get('/books/:bookID/like-count', async (req, res) => {
  const { bookID } = req.params;

  try {
    const conn = await pool.getConnection();
    const [result] = await conn.query(
      'SELECT COUNT(*) AS likeCount FROM reactions WHERE bookID = ? AND reaction = "like"',
      [bookID]
    );
    
    conn.release();

    res.status(200).json({ likeCount: result[0].likeCount });
  } catch (error) {
    console.error('Error fetching like count:', error);
    res.status(500).json({ message: 'Failed to fetch like count' });
  }
});










app.get('/res/:userID', async (req, res) => {
  const { userID } = req.params;

  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query(
      "SELECT * FROM users INNER JOIN book ON users.ID = book.userupload WHERE book.userupload = ?",
      [userID]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching reactions:', error);
    res.status(500).json({ message: 'Failed to fetch reactions' });
  } finally {
    if (conn) conn.release();
  }
});







// API endpoint for searching books by name
app.get('/search', async (req, res) => {
  const { name } = req.query;

  try {
    const conn = await pool.getConnection();
    const query = 'SELECT * FROM book WHERE name LIKE ?';
    const [rows] = await conn.query(query, [`%${name}%`]);

    conn.release();
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Failed to fetch books' });
  }
});


const generateOtp = () => {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};





// Configure your email transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aom2inter@gmail.com',
    pass: 'dugc hmrn ouvb ided'
  }
});

let otpStore = {}; // Temporary in-memory storage for OTPs

app.post('/reset-password-request', async (req, res) => {
  try {
    const { email } = req.body;

    // ตรวจสอบความถูกต้องของอีเมล
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // สร้าง OTP และ token
    const otp = generateOtp(); // ฟังก์ชันสำหรับสร้าง OTP
    otpStore[email] = otp; // เก็บ OTP ชั่วคราว

    const token = jwt.sign({ email }, 'your-jwt-secret', { expiresIn: '15m' });

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Reset Password',
      text: `Your OTP is ${otp}. Click here to reset your password: http://localhost:3002/OTP?token=${token}`
    };
    

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Error sending reset password email:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});



app.post('/verify-otp', async (req, res) => {
  try {
    const { token, otp, password } = req.body;

    // ตรวจสอบ token
    jwt.verify(token, 'your-jwt-secret', async (err, decoded) => {
      if (err) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      const email = decoded.email;

      // ตรวจสอบ OTP
      if (otp !== otpStore[email]) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }

      // เชื่อมต่อฐานข้อมูลและอัปเดตรหัสผ่าน
      try {
        const conn = await pool.getConnection();

        // แฮชรหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = "UPDATE users SET password = ? WHERE email = ?";
        const [result] = await conn.query(query, [hashedPassword, email]);

        conn.release();

        // ลบ OTP หลังจากใช้แล้ว
        delete otpStore[email];
        res.status(200).json({ message: 'Password updated successfully' });
      } catch (dbError) {
        console.error('Database error:', dbError);
        res.status(500).json({ error: 'Database error', details: dbError.message });
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.post('/set-new-password', async (req, res) => {
  const { token, password } = req.body;

  jwt.verify(token, 'your-jwt-secret', async (err, decoded) => {
    if (err) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const email = decoded.email;

    try {
      // Hash the password before storing it
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update the user's password in the database
      conn.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email], (error, results) => {
        if (error) {
          console.error('Database error:', error);
          return res.status(500).json({ error: 'Database error' });
        }
        if (results.affectedRows === 0) {
          return res.status(400).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'Password updated successfully' });
      });
    } catch (error) {
      console.error('Error hashing password:', error);
      res.status(500).json({ error: 'Error hashing password' });
    }
  });
});








app.listen(3333, function () {
  console.log("CORS-enabled web server listening on port 3333");
});