'use strict';
const {Router} = require('express');
const bookControlllers = require('../controllers/bookControllers');

const router = Router();

router.get('/', bookControlllers.books_get);

router.get('/create', bookControlllers.create_book_get);

router.post('/create', bookControlllers.create_book_post);

router.get('/deleteAll', bookControlllers.delete_all_book_get);

router.post('/deleteAll', bookControlllers.delete_all_book_post);


module.exports = router;