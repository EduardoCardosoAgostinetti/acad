const express = require('express');
const signin = require('./routes/signin');
const signup = require('./routes/signup');
const upload = require('./routes/upload');
const exercise = require('./routes/exercise');
const forgotPassword = require('./routes/forgotPassword');
const cors = require('cors');
require('./models/syncModels');
const path = require('path');


const app = express();
const PORT = 3000; 

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/signin', signin);
app.use('/signup', signup);
app.use('/forgotPassword', forgotPassword);
app.use('/upload', upload);
app.use('/exercise', exercise);

app.listen(PORT, () => {
    console.log(` HTTP running at port: 3000`);
});
