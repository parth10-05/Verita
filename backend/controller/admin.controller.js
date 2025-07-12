import User from '../models/User.model.js';
import bcrypt from 'bcryptjs';

// Special endpoint to create admin (should be protected or one-time use)
export const createAdmin = async (req,res) => {
    try{
        const {username,email,password,adminSecret} = req.body;

        // Check admin secret (you can set this in .env)
        if(adminSecret !== process.env.ADMIN_SECRET) {
            return res.status(403).json({message:"Unauthorized to create admin"});
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [ { username }, { email } ] });
        if(existingUser){
            return res.status(400).json({message:"User with the provided username or email already exists."});
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new User({
            username,
            email,
            password_hash: hashedPassword,
            role: 'admin'
        });
        await newAdmin.save();

        res.status(201).json({message:"Admin created successfully",success:true});
    }catch(err){
        console.log("Error in createAdmin", err);
        res.status(500).json({message:err.message});
    }
}
