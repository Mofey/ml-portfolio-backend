const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware to enable CORS for your frontend URL
const corsOptions = {
  origin: 'http://localhost:5173', // Replace this with your frontend's URL
  methods: 'GET, POST', // Allowed methods
  allowedHeaders: 'Content-Type', // Allowed headers
};

app.use(cors(corsOptions));

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other email services as well
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address
    pass: process.env.GMAIL_PASS, // Your Gmail app password (NOT your Gmail login password)
  },
});

// Route to check if the server is running
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Contact form submission handler
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  // Simple validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const mailOptions = {
    from: email, // Sender address (email provided by the user)
    to: process.env.GMAIL_USER, // Receiver address (your email)
    subject: `Message from ${name}`, // Email subject
    text: `You have received a new message from ${name} (${email}):\n\n${message}`, // Email body content
  };

  try {
    // Send email using Nodemailer
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    res.status(200).json({ message: 'Message received successfully' });
  } catch (error) {
    console.error('Error sending email:', error.message);
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});

// Serve static assets in production (optional)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build')); // Assuming your React app is built in 'client/build'
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
