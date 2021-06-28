
const mongoose = require("mongoose");
require("../models/Book");
const {getFromRedis, setToRedis} = require('../redisService');

const Book = mongoose.model("Book");

module.exports.getBookById = async (id) => {
    let book = await getFromRedis(id)
    if (!book) {
        console.log("Get data from mongodb")
        book = await Book.findById(id)
        await setToRedis(id, book)
    }

    return book;
}

module.exports.getBooks = async () => {
    const books = await Book.find({});
    return books;
}

module.exports.createBook = async (title, content, author) => {
    const book = new Book({
      title,
      content,
      author
    });

    await book.save();
    return book;
}