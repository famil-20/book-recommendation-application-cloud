'use strict';
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const { env } = require('process');

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();

// connection to mongoDB
const dbURI = env.DBURI;

mongoose.connect(dbURI)
	.then(() => {
		app.listen(env.PORT, env.IP);
	})
	.catch((err) => {
		console.log(err);
	});


/* MIDDLEWARES */

// setting up middleware to handle stylesheet, favicon etc. requests
// eslint-disable-next-line no-undef
const staticPath = path.join(__dirname, '../assets');
app.use('/assets', express.static(staticPath));


// registering logging middleware
app.use(morgan('tiny'));

app.use(express.json());

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

// retrieving and putting auth header into request
app.use((req, res, next) => {
	const jwt = req.cookies.jwt;
	if (jwt) {
		req.headers.authorization = jwt;
	}
	next();
});

app.use('*', authMiddleware.checkUser);

app.use('*', authMiddleware.verifyCookie);

/* MIDDLEWARES END */

// view engine register
app.set('view engine', 'ejs');
app.set('views', './src/views');

// routes

app.get('/', (req, res) => {
	res.render('index', { title: 'Index' });
});

//books routes
app.use('/books', authMiddleware.requireAuth, bookRoutes);

// auth routes
app.use('/auth', authRoutes);

// not found
app.use((req, res) => {
	res.status(404).render('notFound', { title: 'Not Found' });
});