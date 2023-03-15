// const express = require('express');
// const bodyParser = require('body-parser');
// const jwt = require('jsonwebtoken');

// const app = express();

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// app.post('/api/token', (req, res) => {
//   // Replace YOUR_MEMBERSTACK_API_KEY with your Memberstack API key
//   const secretKey = Buffer.from('sk_sb_12340390230aa60e2d84').toString('base64');
//   const token = jwt.sign({ sub: 'khaoula+n@abxrengine.com' }, secretKey, {
//     expiresIn: '1h'
//   });

//   res.json({ token });
// });

// app.listen(3000, () => console.log('Server started on port 3000'));

const http = require("http");
const url = require("url");
const memberstackAdmin = require("@memberstack/admin");
const fs = require("fs/promises");
require('dotenv').config();

const memberstack = memberstackAdmin.init(process.env.MEMBERSTACK_SECRET_KEY);
const REQUIRED_PERMISSIONS = ["can:view-members"];
// const MEMBERSTACK_SECRET_KEY = process.env.MEMBERSTACK_SECRET_KEY;
// const REQUIRED_PERMISSIONS = ["can:view-members"];

// const memberstack = memberstackAdmin.init(MEMBERSTACK_SECRET_KEY);

http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === "/get-token") {
    try {
      console.log("req.headers:---->", req.headers);
      console.log("req.headers.cookie:---->", req.headers.cookie);
      // console.log("req.headers.get(cookie)----> ", req.headers.get("cookie"));
      const cookieString =req.headers.cookie;  //  req.headers.get("cookie") ; //
      console.log("cookieString:", cookieString);
      const cookieName = "_ms-mid";
      const token = getCookie(cookieString, cookieName);
      // const cookieValue = req.headers.cookie.split(",")
      //   .map(cookie => cookie.trim())
      //   .find(cookie => cookie.startsWith(`${cookieName}=`))
      //   ?.split("=")[1];
      
      // const tokenVerified = await memberstack.verifyToken({ token: cookieValue });
      const cookies = req.headers.cookie.split('; ');
  
      console.log("Access Token:", token);
      // console.log(" tokenVerified----->:", tokenVerified);
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ token }));

      // const cookieName = "_ms-mid";
      // const cookies = req.headers.cookie ? req.headers.cookie.split(';') : [];
      // const token = cookies.reduce((acc, cookie) => {
      //   const [name, value] = cookie.trim().split('=');
      //   if (name === cookieName) {
      //     return value;
      //   }
      //   return acc;
      // }, null);

      // console.log("Access Token:", token);
      // res.setHeader("Content-Type", "application/json");
      // res.end(JSON.stringify({ token }));

      
    } catch (error) {
      console.error(error);
      res.statusCode = 401;
      res.end("Unauthorized");
    }
  } else if (parsedUrl.pathname === "/get-member") {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader.split("Bearer ")[1];

      const { id } = await memberstack.verifyToken({ token, permissions: REQUIRED_PERMISSIONS });
      const { data } = await memberstack.members.retrieve({ id });

      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(data));
    } catch (error) {
      console.error(error);
      res.statusCode = 401;
      res.end("Unauthorized");
    }
  } else if (parsedUrl.pathname === "/") {
    try {
      const html = await fs.readFile("./index.html", "utf8");
      res.setHeader("Content-Type", "text/html");
      res.end(html);
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  } else {
    res.statusCode = 404;
    res.end("Not Found");
  }
}).listen(3000, () => {
  console.log("Server started on port 3000");
});

function getCookie(cookieString, cookieName) {
  if (!cookieString) {
    return null;
  }

  const cookies = cookieString.split("; ");
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === cookieName) {
      return value;
    }
  }

  return null;
}







// // --------------------------- only token -------------------------------
// const http = require("http");
// const url = require("url");
// const fs = require("fs/promises");
// require('dotenv').config();

// const COOKIE_NAME = "_ms-mid";

// http.createServer(async (req, res) => {
//   const parsedUrl = url.parse(req.url, true);

//   if (parsedUrl.pathname === "/get-token") {
//     try {
//       const cookieString = req.headers.cookie;
//       console.log("cookieString:", cookieString);
//       const token = getCookie(cookieString, COOKIE_NAME);

//       console.log("Access Token:", token);

//       res.setHeader("Content-Type", "application/json");
//       res.end(JSON.stringify({ token }));
//     } catch (error) {
//       console.error(error);
//       res.statusCode = 401;
//       res.end("Unauthorized");
//     }
//   } else {
//     res.statusCode = 404;
//     res.end("Not Found");
//   }
// }).listen(3000, () => {
//   console.log("Server started on port 3000");
// });

// function getCookie(cookieString, cookieName) {
//   if (!cookieString) {
//     return null;
//   }

//   const cookies = cookieString.split("; ");
//   for (const cookie of cookies) {
//     const [name, value] = cookie.split("=");
//     if (name === cookieName) {
//       return value;
//     }
//   }

//   return null;
// }
