import 'dotenv/config';
import fs from 'node:fs';
import mongoose from 'mongoose';
import { UserModel } from '../infrastructure/database/models/user.model.js';
import { config } from '../infrastructure/config/env.js';

async function checkUsers() {
  await mongoose.connect(config.MONGODB_URI);
  console.log('Connected to DB');

  const users = await UserModel.find({});
  let output = '--- USERS ---\n';
  users.forEach(u => {
    output += `Email: ${u.email} | Role: '${u.role}' | Active: ${u.active}\n`;
  });
  output += '------------\n';
  
  console.log(output);
  fs.writeFileSync('users-dump.txt', output);

  await mongoose.disconnect();
}

checkUsers().catch(console.error);
