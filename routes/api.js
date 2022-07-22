/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const Book = require('../models/book').Book;
const mongoose = require('mongoose');

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      Book.find({}, (error, books) => {
        if (error) {
          console.log('GET error: error retrieving all books', error);
        }
        if (books.length) {
          const booksMap = books.map(book => ({ title: book.title, _id: book._id, commentcount: book.comments.length }));
          res.json(booksMap);
        } 
      });
    })
    
    .post(function (req, res){
      //response will contain new book object including atleast _id and title
      let title = req.body.title;
      if (!title) {
        res.send('missing required field title');
        return;
      }
      Book.findOne({ title: title}, (error, bookFound) => {
        if (error) {
          console.log('POST error: error looking for book', error);
        }
        if (bookFound) {
          res.json({
            title: bookFound.title,
            _id: bookFound._id
          });
          return;
        }
        if (!bookFound) {
          const newBook = new Book({
            title: title
          });
          newBook.save((error, data) => {
            if (error) {
              console.log('POST error: error saving new book', error);
            }
            if (data) {
              res.json({
                title: data.title,
                _id: data._id
              });
            }
          });
        }
      });
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      Book.deleteMany({}, (error, result) => {
        if (error) {
          console.log('DELETE error: error deleting all books', error);
        }
        res.send('complete delete successful')
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        res.send('no book exists');
        return;
      }
      Book.findOne({ _id: mongoose.Types.ObjectId(bookid) }, (error, book) => {
        if (error) {
          console.log('GET error: error retrieving book by id', error);
        }
        if (book) {
          res.json({
            title: book.title,
            _id: book._id,
            comments: book.comments
          });
          return;
        }
        if (!book) {
          res.send('no book exists');
        }
      });
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (!comment) {
        res.send('missing required field comment');
        return;
      }
      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        res.send('no book exists');
        return;
      }
      Book.findOne({ _id: mongoose.Types.ObjectId(bookid) }, (error, book) => {
        if (error) {
          console.log('POST error: error posting comment', error);
        }
        if (book) {
          console.log('post book', book)
          book.comments.push(comment);
          book.save((error, saveData) => {
            if (error) {
              console.log('error saving comment', error);
            }
            if (saveData) {
              res.json({
                title: saveData.title,
                _id: saveData._id,
                comments: saveData.comments
              });
            }
          });
        }
        if (!book) {
          res.send('no book exists');
        }
      });
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        res.send('no book exists');
        return;
      }
      Book.findOneAndRemove({ _id: mongoose.Types.ObjectId(bookid) }, (error, deleted) => {
        if (error) {
          console.log('DELETE error: error deleting a book', error);
        }
        if (deleted) {
          res.send('delete successful');
        }
        if (!deleted) {
          res.send('no book exists');
        }
      });
    });
  
};
