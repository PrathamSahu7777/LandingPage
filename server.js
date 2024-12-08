const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer'); // For file uploads
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection failed:", err));

// Schemas
const ProjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
});
const ClientSchema = new mongoose.Schema({
  name: String,
  description: String,
  designation: String,
  image: String,
});
const Project = mongoose.model('Project', ProjectSchema);
const Client = mongoose.model('Client', ClientSchema);

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory for uploads
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filenames
  },
});
const upload = multer({ storage });

// Routes

// Add a Project
app.post('/api/projects', upload.single('image'), async (req, res) => {
  const { name, description } = req.body;
  const newProject = new Project({
    name,
    description,
    image: req.file.filename,
  });
  await newProject.save();
  res.json({ message: 'Project added successfully!' });
});

// Add a Client
app.post('/api/clients', upload.single('image'), async (req, res) => {
  const { name, description, designation } = req.body;
  const newClient = new Client({
    name,
    description,
    designation,
    image: req.file.filename,
  });
  await newClient.save();
  res.json({ message: 'Client added successfully!' });
});

// Get Projects
app.get('/api/projects', async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

// Get Clients
app.get('/api/clients', async (req, res) => {
  const clients = await Client.find();
  res.json(clients);
});

// Static File Serving
app.get('/uploads/:filename', (req, res) => {
  res.sendFile(path.join(__dirname, 'uploads', req.params.filename));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
