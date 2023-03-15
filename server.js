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

      console.log("Access Token:", token);

      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ token }));
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