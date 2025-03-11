import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware to enable CORS for your frontend URL
const corsOptions: cors.CorsOptions = {
  origin: ['*'], // Replace this with your frontend's URL
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
app.get('/', (req: Request, res: Response) => {
  res.send('Server is running');
});

// Contact form submission handler with correct type annotations
app.post('/api/contact', async (req: Request, res: Response): Promise<any> => {
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
    return res.status(200).json({ message: 'Message received successfully' });
  } catch (error: any) {
    console.error('Error sending email:', error.message);
    return res.status(500).json({ error: 'Failed to send message. Please try again later.' });
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