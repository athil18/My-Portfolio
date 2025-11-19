const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Init Middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/productRoutes'));

app.use(errorHandler);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
