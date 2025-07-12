import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Email transporter configuration - will be initialized after dotenv loads
let transporter = null;

// Initialize email transporter
const initializeEmailTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return;
    }

    transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Generate 6-digit OTP
const generateOTP = () => {
    const buffer = crypto.randomBytes(4);
    return buffer.readUInt32BE(0) % 900000 + 100000; // 6-digit
};

// Send OTP email
const sendOTPEmail = async (email, otp, purpose = 'Password Reset') => {
    if (!transporter) {
        return Promise.resolve();
    }
    
    const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@stackit.com',
        to: email,
        subject: purpose,
        text: `Your OTP is ${otp}. It is valid for 1 hour.`
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return reject(error);
            }
            resolve(info);
        });
    });
};

// Generate and send OTP for user
const generateAndSendOTP = async (user, purpose = 'Password Reset') => {
    const otp = generateOTP();
    user.resetPasswordTokenOtp = otp.toString();
    user.resetPasswordExpiresOtp = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendOTPEmail(user.email, otp, purpose);
    return otp;
};

export { transporter, generateOTP, sendOTPEmail, generateAndSendOTP, initializeEmailTransporter }; 