'use strict';
const Book = require('../models/Book');
const jwt = require('jsonwebtoken');
const { env } = require('process');

const SECRET = env.SECRET;

const errorHandler = (err) => {
	let errors = {
		title: '',
		descripton: ''
	};

	// title error

	if (err.code === 11000) {
		errors.title = 'Entered book title already exists';
		return errors;
	}

	// validation errors
	if (err.message.includes('book validation failed')) {
		const errorsObject = Object.values(err.errors);
		errorsObject.forEach(({ properties }) => {
			errors[properties.path] = properties.message;
		});
		return errors;
	}
};


const books_get = async (req, res) => {
	const allBooks = await Book.find().sort({ createdAt: -1 });
	res.render('books', {
		title: 'Recommendations',
		books: allBooks
	});
};

const create_book_get = async (req, res) => {
	res.render('createBook', {
		title: 'New Book',
	});
};

const create_book_post = async (req, res) => {
	const token = req.headers.authorization;
	if (token) {
		jwt.verify(token, SECRET, async (err, decodedToken) => {
			if (err) {
				res.status(500).send('Something bad happened (cookie is invalid) :(');
				console.log(err);
			}
			else {
				try {
					const options = req.body;
					options.createdBy = decodedToken.id;
					const book = await Book.create(options);
					res.status(201).json({ book: book._id });
				}
				catch (err) {
					console.log(err);
					const errors = errorHandler(err);
					res.status(400).json({ errors });
				}
			}
		});
	}
	else {
		res.status(500).send('Something bad happened (cookie is missing) :(');
	}
};

const delete_all_book_get = async (req, res) => {
	const token = req.headers.authorization;
	if (token) {
		await jwt.verify(token, SECRET, async (err, decodedToken) => {
			if (err) {
				console.log(err);
				res.status(500).send('Something bad happened (cookie is invalid) :(');
			}
			else {
				const books = await Book.find({ createdBy: decodedToken.id });
				const titles = [];
				books.forEach(book => {
					titles.push(book.title);
				});
				res.render('deleteAll', {
					title: 'Delete All',
					titles
				});
			}
		});
	}
	else {
		res.status(500).send('Something bad happened (cookie is missing) :(');
		console.log('');
	}
};

const delete_all_book_post = async (req, res) => {
	const token = req.headers.authorization;
	if (token) {
		await jwt.verify(token, SECRET, async (err, decodedToken) => {
			if (err) {
				console.log(err);
				res.status(500).send('Something bad happened (cookie is invalid) :(');
			}
			else {
				const books = await Book.find({ createdBy: decodedToken.id });
				books.forEach(async (book) => {
					await Book.findByIdAndRemove(book._id);
				});
			}
			res.redirect('/books');
		});
	}
	else {
		res.status(500).send('Something bad happened (cookie is missing) :(');
		console.log('Token is missing');
	}
};

module.exports = {
	books_get,
	create_book_get,
	create_book_post,
	delete_all_book_get,
	delete_all_book_post
};