import crypto from 'crypto';
import nodemailer from 'nodemailer';

const generateAndSendOtp = async (user, purpose='Account Verification') => {
    const buffer = crypto.randomBytes(4);
    const token = buffer.readUInt32BE(0) % 900000 + 100000; // 6-digit
    user.resetPasswordTokenOtp = token;
    user.resetPasswordExpiresOtp = Date.now() + 3600000; // 1hr
    await user.save();
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: purpose,
      text: `Your OTP is ${token}. It is valid for 1 hour.`
    };
  
    return new Promise((resolve,reject)=>{
      transporter.sendMail(mailOptions,(error)=>{
        if(error) return reject(error);
        resolve(token);
      });
    });
  };