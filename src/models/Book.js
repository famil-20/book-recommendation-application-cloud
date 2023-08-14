'use strict';
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, 'Title of the book is missing'],
		unique: [true, 'The book is already in the list'],
	},
	description: {
		type: String,
		required: [true, 'Description of the book is missing']
	},
	createdBy: {
		type: String,
		required: true
	}
}, { timestamps: true });

const Book = mongoose.model('book', bookSchema, 'books');

module.exports = Book;