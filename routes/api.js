/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  commentcount: Number,
  comments: [],
})

let Book = new mongoose.model('Book', bookSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      Book.find({ })
          .then( (all) => {
            res.json(all);
          })
          .catch( (err) => {
            console.log(err);
          });
    })
    
    .post(function (req, res){
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title) {
        res.json('missing required field title');
      } else {
        let newBook = new Book({ title: title,
                                 commentcount: 0,
                               });
        newBook.save()
               .then( (addedBook) => {
                 res.json({ _id: addedBook._id , title: addedBook.title });
               })
               .catch( (err) => {
                 console.log("Error while saving - " + err);
               });
      }
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      Book.deleteMany({})
          .then( (deletedAll) => {
            console.log(deletedAll);
            res.json('complete delete successful');
          })
          .catch( (err) => {
            console.log("Error while deleting all" + err);
          })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      //if (!bookid) {
        
      //} else {
        Book.findById( { _id : bookid })
            .then( (foundBook) => {
              res.json({_id: foundBook._id,
                        title: foundBook.title,
                        comments: foundBook.comments });
            })
            .catch( (err) => {
              console.log("Error while finding a book " + err);
              res.json("no book exists");     
            });
      //}
    })
    
    .post(function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (!comment) {
        res.json("missing required field comment");
      } else {
        Book.findById({ _id: bookid })
            .then( (bookForUpdate) => {
              bookForUpdate.comments.push(comment);
              bookForUpdate.commentcount += 1;
              bookForUpdate.save()
                           .then( (updatedBook) => {
                             res.json(updatedBook);
                           })
                           .catch( (err) => {
                             console.log("Error while adding a comment " + err);
                           })
            })
            .catch( (err) => {
              res.json("no book exists");
            });
      }
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      if (!bookid) {
        res.json("no book exists");
      } else {
        Book.findOneAndRemove({ _id: bookid })
            .then( (deletedBook) => {
              if (!deletedBook) res.json("no book exists");
              else {
                console.log("Delete one - " + deletedBook);
                res.json("delete successful");
              }
            })
            .catch( (err) => {
              console.log('Error while deleting by id - ' + err);
              res.json("no book exists");
            });
      }
    });
  
};
