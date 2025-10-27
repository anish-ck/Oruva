import { Router, type Request, type Response } from "express";
import { AddharInterface } from "../interfaces/types.js";
import axios from "axios";
const sandBoxHost = "https://api.sandbox.co.in";
const router = Router();
const MOCK_MODE = process.env.MOCK_MODE === 'true';

const sandboxAccessToken = async () => {
    try {
        const result = await axios.post(`${sandBoxHost}/authenticate`, {}, {
            headers: {
                "content-type": "application/json",
                "x-api-key": process.env.SANDBOXAPIKEY,
                "x-api-secret": process.env.ACCESSTOKEN,
                "x-api-version": "1.0"
            }
        })
        const token: any = result.data;
        return token.access_token;
    } catch (error: any) {
        console.log("sandbox authenticate error", error.message);
    }
}

// Mock data for development
const mockOTPStore = new Map();

router.post("/generateOTP", async (req: Request, res: Response) => {
    try {
        const { adhaarNumber } = req.body;

        if (!adhaarNumber) {
            return res.status(400).send({ message: "Adhaar number is required" });
        }

        // MOCK MODE: Simulate successful OTP generation
        if (MOCK_MODE) {
            console.log('🎭 MOCK MODE: Simulating OTP generation');
            const mockRefId = Math.floor(Math.random() * 100000000);
            const mockOTP = '123456'; // Fixed OTP for testing

            mockOTPStore.set(mockRefId.toString(), {
                adhaarNumber,
                otp: mockOTP,
                timestamp: Date.now()
            });

            return res.status(200).send({
                referenceId: mockRefId,
                message: "OTP sent successfully (MOCK MODE)",
                mockOTP: mockOTP // Only in mock mode
            });
        }

        // REAL API MODE
        const accessToken = await sandboxAccessToken();
        const result = await axios.post(
            `${sandBoxHost}/kyc/aadhaar/okyc/otp`,
            {
                "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
                aadhaar_number: adhaarNumber.toString(),
                consent: "Y",
                reason: "For KYC verification"
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: accessToken,
                    "x-api-key": process.env.SANDBOXAPIKEY,
                    "x-api-version": "2.0"
                }
            }
        );
        const dataObject: any = result.data; // optional chaining in case undefined
        console.log(`the response os ${dataObject}`)
        if (!dataObject) {
            return res.status(500).send({ message: "Invalid response from sandbox API" });
        }

        console.log(result.data);
        if (dataObject.code === 200) {
            res.status(200).send({
                referenceId: dataObject.data.reference_id,
                message: dataObject.data.message
            });
        } else {
            res.status(dataObject.code).send({
                message: dataObject.message
            });
        }
    } catch (error: any) {
        console.error("Aadhaar verification error:", error);
        res.status(500).send({ message: "Internal server error" });
    }
})

router.post("/verifyOTP", async (req: Request, res: Response) => {

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
        })
        console.log("data foune", result);
        const data: any = result.data;
        console.log(data);
        if (data.data.status == "VALID") {
            res.send({ value: true, message: data.data.message });
            return
        }
        res.send({ value: false, message: data?.data?.message || "UTP time put" })

    } catch (error: any) {
        console.log("sendboc verify error", error);
        res.status(501).send({ value: false, message: error.message });
    }
})
export default router;