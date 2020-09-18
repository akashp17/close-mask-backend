'use strict';
// test
const express = require('express');
const mongoose = require('mongoose');

const cors = require('cors');
const router = require('./api/routes/index');
const { port, dbUrl } = require('./config/main');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();

if (process.env.NODE_ENV != 'production')
	app.use(
		// cors({ credentials: true, origin: 'https://mask.theclosecompany.com' })
		cors({ credentials: true, origin: 'http://localhost:3001' })
	);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));

app.use('/api', router);

mongoose
  .connect(dbUrl, {
    useUnifiedTopology: true,
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then((db) => {
    console.log('DB Connection Successfull');
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

app.listen(port, () => console.log(`Server is up and running on port ${port}`));
