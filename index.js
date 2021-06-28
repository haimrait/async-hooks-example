const express = require("express");;
const mongoose = require("mongoose");
require('./traceContext');
const bookService = require("./bookService");
const { addTraceContext } = require('./middlewares');
const { patchMongoose } = require('./wrappers');
patchMongoose(mongoose); 

mongoose.connect(
    `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB_NAME}`,
    {useNewUrlParser: true, useUnifiedTopology: true});

const app = express();
app.use(express.urlencoded());
app.use(express.json());
app.use(addTraceContext)

app.get("/books/:id", async (req, res) => {
    const book = await bookService.getBookById(req.params.id)
    if (book) {
        return res.status(200).send(book);
    }
    return res.status(404).send("Book not found");
});

app.get("/books", async (req, res) => {
    const books = await bookService.getBooks();
    return res.status(200).send(books);
});

app.post("/books", async (req, res) => {
    const { title, content, author } = req.body;
    if (!title || !content || !author) {
        return res.status(400).send("The given data was invalid or missing")
    }

    const book = await bookService.createBook(title, content, author)
    return res.status(200).send(book);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Listening on port`, PORT);
});