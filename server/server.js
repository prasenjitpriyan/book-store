const express = require('express')
const app = express()
const port = process.env.PORT || 3001;
const cors = require("cors")

// Middlewares
app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Mongo DB configuration
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://prasenjitpriyan:MERNpassword123@book-store.lhxl4w8.mongodb.net/book-store?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Create a collection of documents
    const bookStore = client.db('BookInventory').collection("books")

    // Insert a book to the db: post method
    app.post("/upload-book", async (req, res) => {
      const data = req.body;
      const result = await bookStore.insertOne(data);
      res.send(result)
    })

    // Get all book from the db: get method
    // app.get("/all-books", async (req, res) => {
    //   const books = bookStore.find();
    //   const result = await books.toArray();
    //   res.send(result)
    // })

    // update a book: patch or update method
    app.patch("/book/:id", async (req, res) => {
      const id = req.params.id
      const updateBookData = req.body;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...updateBookData
        }
      }
      // Update
      const result = await bookStore.updateOne(filter, updateDoc, options);
      res.send(result)
    })

    // Delete a book data
    app.delete("/book/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const result = await bookStore.deleteOne(filter);
      res.send(result)
    })

    // Find by category
    app.get("/all-books", async (req, res) => {
      let query = {};
      if (req.query?.category) {
        query = { category: req.query.category }
      }
      const result = await bookStore.find(query).toArray();
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})