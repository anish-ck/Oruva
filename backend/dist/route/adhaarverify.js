import { Router } from "express";
import axios from "axios";
const sandBoxHost = "https://api.sandbox.co.in";
const router = Router();
const sandboxAccessToken = async () => {
    try {
        const result = await axios.post(`${sandBoxHost}/authenticate`, {}, {
            headers: {
                "content-type": "application/json",
                "x-api-key": process.env.SANDBOXAPIKEY,
                "x-api-secret": process.env.ACCESSTOKEN,
                "x-api-version": "1.0"
            }
        });
        const token = result.data;
        return token.access_token;
    }
    catch (error) {
        console.log("sandbox authenticate error", error.message);
    }
};
router.post("/generateOTP", async (req, res) => {
    try {
        const { adhaarNumber } = req.body;
        if (!adhaarNumber) {
            return res.status(400).send({ message: "Adhaar number is required" });
        }
        const accessToken = await sandboxAccessToken();
        const result = await axios.post(`${sandBoxHost}/kyc/aadhaar/okyc/otp`, {
            "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
            aadhaar_number: adhaarNumber.toString(),
            consent: "Y",
            reason: "we are using it for project"
        }, {
            headers: {
                "Content-Type": "application/json",
                authorization: accessToken,
                "x-api-key": process.env.SANDBOXAPIKEY,
                "x-api-version": "1.0.0"
            }
        });
        const dataObject = result.data; // optional chaining in case undefined
        console.log(`the response os ${dataObject}`);
        if (!dataObject) {
            return res.status(500).send({ message: "Invalid response from sandbox API" });
        }
        console.log(result.data);
        if (dataObject.code === 200) {
            res.status(200).send({
                referenceId: dataObject.data.reference_id,
                message: dataObject.data.message
            });
        }
        else {
            res.status(dataObject.code).send({
                message: dataObject.message
            });
        }
    }
    catch (error) {
        console.error("Aadhaar verification error:", error);
        res.status(500).send({ message: "Internal server error" });
    }
});
router.post("/verifyOTP", async (req, res) => {
    try {
        const { otp, reference_id } = req.body;
        if (!otp || !reference_id) {
            res.status(400).send({ value: false, message: "INVALID credentials" });
            return;
        }
        console.log("o hyeas");
        const accessToken = await sandboxAccessToken();
        if (!accessToken) {
            throw new Error("Access not found error");
            return;
        }
        const result = await axios.post(`${sandBoxHost}/kyc/aadhaar/okyc/otp/verify`, {
            "@entity": "in.co.sandbox.kyc.aadhaar.okyc.request",
            "reference_id": reference_id.toString(),
            "otp": otp.toString()
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "x-api-key": process.env.SANDBOXAPIKEY,
                "x-api-version": "2.0"
            }
        });
        console.log("data foune", result);
        const data = result.data;
        console.log(data);
        if (data.data.status == "VALID") {
            res.send({ value: true, message: data.data.message });
            return;
        }
        res.send({ value: false, message: data?.data?.message || "UTP time put" });
    }
    catch (error) {
        console.log("sendboc verify error", error);
        res.status(501).send({ value: false, message: error.message });
    }
});
export default router;
//# sourceMappingURL=adhaarverify.js.map