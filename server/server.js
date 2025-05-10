const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require("path");

const http = require("http");
const { initSocket } = require("./socket");

dotenv.config();
const app = express();

const server = http.createServer(app);
initSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const contactRoutes = require('./routes/contacts');
app.use('/contacts', contactRoutes);

const messageRoutes = require('./routes/messages');
app.use('/messages', messageRoutes);

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const groupsRoutes = require('./routes/groups');
app.use('/groups', groupsRoutes);

const groupchatsRoutes = require('./routes/groupchats');
app.use('/groupchats', groupchatsRoutes);

// Server Start
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));