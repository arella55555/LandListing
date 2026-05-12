<<<<<<< HEAD
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JTW_SECRET = process.env.JWT_SECRET as string;
const db = new sqlite3.Database("./landmark.db");

app.use(cors());
app.use(express.json());

const authenticateToken = (req: any, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if(!token) return res.status(401).json({ message: "Access Denied." });

    try {
        const verified = jwt.verify(token, JTW_SECRET);
        req.user = verified;
        next();
    } catch(err) {
        res.status(403).json({ message: "Invalid Token" });
    }
};

const dbRun = (query: string, params: any[]) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if(err) reject(err);
            else resolve(this);
        });
    });
};

const dbGet = (query: string, params: any[] = []): Promise<any> => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if(err) reject(err);
            else resolve(row);
        });
    });
};

//POST
app.post("/register", async (req: Request, res: Response) => {
    try {
        const {username, password, email} = req.body;

        if(!username || !password || !email ) {
            return res.status(400).json({ message: "Required fields are missing" });
        }
        const result = await dbGet("SELECT COUNT(*) as total FROM user");
        const nextIdNumber = (result?.total || 0) + 1;
        const formattedUserId = `USR${String(nextIdNumber).padStart(3, '0')}`;

        const hashedPassword = await bcrypt.hash(password, 10);

        const insertQuery = `
            INSERT INTO user (userid, username, password, email)
            VALUES(?,?,?,?)
        `;

        await dbRun(insertQuery, [
            formattedUserId,
            username,
            hashedPassword,
            email
        ]);

        res.status(201).json({
            message: "Registration successful!",
            userid: formattedUserId,
            username
        });
    } catch(error: any) {
        console.error("Registration error:", error);

        if(error.message && error.message.includes("UNIQUE")) {
            return res.status(400).json({ message: "Username or Email already taken."});
        }

        res.status(500).json({ message: "Internal server error."});
    }
});

app.post("/login", async (req: Request, res: Response) => {
    const {username, password} = req.body;

    try{
        const user = await dbGet(`SELECT * FROM user WHERE username = ?`, [username]);

        if(!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign({ userid: user.userid }, JTW_SECRET, {expiresIn: "24h"});
        res.json({ token, username: user.username });
    } catch (error) {
        res.status(500).json({ message: "Login failed."});
    }
});

app.listen(PORT, () => console.log(`Server on http://localhost: ${PORT}`));


=======
import dotenv from "dotenv";
dotenv.config();

import app from "./src/app";

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
>>>>>>> d3978336dcfff4cfb7f76d098a5fdbcedec05531
