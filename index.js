import express from "express";
import bootstrap from "./src/app.controller.js";
import dotenv from "dotenv";
import chalk from "chalk";
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ✅ مهم جدًا — عشان req.body مايبقاش undefined
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ تأكد إن bootstrap فعلاً async
await bootstrap(app, express);

// ✅ تشغيل السيرفر
app.listen(port, () => {
  console.log(chalk.bgGreen(chalk.black(`✅ Server is running at http://localhost:${port}`)));
});
