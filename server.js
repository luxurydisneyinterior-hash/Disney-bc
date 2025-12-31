import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

/* =========================
   CORS SETUP
========================= */
const frontendURLs = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",")
    : ["*"];

app.use(
    cors({
        origin: frontendURLs,
        methods: ["GET", "POST"],
        credentials: true,
    })
);

app.use(express.json());

/* =========================
   MAIL TRANSPORTER
========================= */
const createTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // APP PASSWORD
        },
    });
};

/* =========================
   TEST ROUTES
========================= */
app.get("/", (req, res) => {
    res.send("Luxury Disney Interior Backend Running ✅");
});

app.get("/mail-test", async (req, res) => {
    try {
        const transporter = createTransporter();
        await transporter.sendMail({
            from: `"Luxury Disney Interior" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: "Mail Test Successful",
            text: "Gmail App Password is working perfectly ✅",
        });
        res.send("Mail sent successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Mail test failed");
    }
});

/* =========================
   FORM 1 – CONTACT FORM
========================= */
app.post("/send-contact", async (req, res) => {
    const { name, phone, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: "Required fields missing" });
    }

    try {
        const transporter = createTransporter();

        // Admin Email
        await transporter.sendMail({
            from: `"Luxury Disney Interior" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_RECEIVER,
            replyTo: email,
            subject: `New Contact Message - ${name}`,
            html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "-"}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
        });

        // User Confirmation
        await transporter.sendMail({
            from: `"Luxury Disney Interior Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Thank you for contacting Luxury Disney Interior",
            html: `
        <p>Hi ${name},</p>
        <p>Thank you for reaching out to <strong>Luxury Disney Interior</strong>.</p>
        <p>Our team will contact you within 24 hours.</p>
        <br/>
        <p>Warm regards,<br/>
        <strong>Luxury Disney Interior Team</strong></p>
      `,
        });

        res.json({ message: "Contact form email sent successfully" });
    } catch (err) {
        console.error("Contact Mail Error:", err);
        res.status(500).json({ message: "Email sending failed" });
    }
});

/* =========================
   FORM 2 – PROJECT INQUIRY
========================= */
app.post("/send-project", async (req, res) => {
    const {
        Name,
        "Phone Number": phone,
        Email,
        "Project Name": projectName,
        "Project Location": projectLocation,
    } = req.body;

    if (!Name || !Email || !projectName) {
        return res.status(400).json({ message: "Required fields missing" });
    }

    try {
        const transporter = createTransporter();

        // Admin Email
        await transporter.sendMail({
            from: `"Luxury Disney Interior" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_RECEIVER,
            replyTo: Email,
            subject: `New Project Inquiry - ${projectName}`,
            html: `
        <h3>New Project Inquiry</h3>
        <p><strong>Name:</strong> ${Name}</p>
        <p><strong>Email:</strong> ${Email}</p>
        <p><strong>Phone:</strong> ${phone || "-"}</p>
        <p><strong>Project Name:</strong> ${projectName}</p>
        <p><strong>Project Location:</strong> ${projectLocation || "-"}</p>
      `,
        });

        // User Confirmation
        await transporter.sendMail({
            from: `"Luxury Disney Interior Team" <${process.env.EMAIL_USER}>`,
            to: Email,
            subject: "We received your project inquiry",
            html: `
        <p>Hi ${Name},</p>
        <p>Thank you for contacting <strong>Luxury Disney Interior</strong>.</p>
        <p><strong>Project:</strong> ${projectName}</p>
        <p>Our interior experts will contact you shortly.</p>
        <br/>
        <p>Warm regards,<br/>
        <strong>Luxury Disney Interior Team</strong></p>
      `,
        });

        res.json({ message: "Project inquiry email sent successfully" });
    } catch (err) {
        console.error("Project Mail Error:", err);
        res.status(500).json({ message: "Email sending failed" });
    }
});

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
