import express from "express";
import adhaarRouter from "./route/adhaarverify.js";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
console.log(process.env.ACCESSTOKEN);
const PORT = 3000;
const app = express();
app.use(express.json());
app.get("/", (req, res) => {
    console.log(req);
    res.send({ status: 200 });
});
app.use(`/adhaar`, adhaarRouter);
app.listen(PORT, () => {
    console.log(`app is listening on port `);
});
//# sourceMappingURL=server.js.map