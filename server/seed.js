import 'dotenv/config'; 
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/Users.js';
import Event from './models/Events.js';



(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany();
  await Event.deleteMany();

  const pass = await bcrypt.hash('123456', 10);
  const alice = await User.create({ name: 'Alice', email: 'alice@test.com', passwordHash: pass });
  const bob = await User.create({ name: 'Bob', email: 'bob@test.com', passwordHash: pass });

  const now = new Date();
  const slot1 = await Event.create({
    title: 'Team Sync', startTime: now, endTime: new Date(now.getTime() + 3600000),
    status: 'SWAPPABLE', owner: alice._id
  });
  const slot2 = await Event.create({
    title: 'Focus Block', startTime: new Date(now.getTime() + 86400000),
    endTime: new Date(now.getTime() + 86400000 + 3600000),
    status: 'SWAPPABLE', owner: bob._id
  });

  console.log('Seeded:', alice.email, bob.email);
  process.exit();
})();
