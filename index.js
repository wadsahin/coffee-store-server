require('dotenv').config()
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());


app.get("/", (req, res)=>{
  res.send("My coffee store server in running..")
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l0f7v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const userCollection = client.db("CoffeeDB").collection("Coffees");

    app.get("/coffee", async(req, res) =>{
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // Get a single element for updated
    app.get("/coffee/:id", async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await userCollection.findOne(query);
      res.send(result);
    })

    app.post("/coffee", async(req, res) =>{
      const newCoffee = req.body;
      console.log(newCoffee);
      const result = await userCollection.insertOne(newCoffee);
      res.send(result);
    })

    // update
    app.put("/coffee/:id", async(req, res) =>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true };
      const updateAbleCoffee = req.body;
      const updatedCoffee = {
        $set: {
          name: updateAbleCoffee.name,
          quantity: updateAbleCoffee.quantity,
          supplier: updateAbleCoffee.supplier,
          taste: updateAbleCoffee.taste,
          category: updateAbleCoffee.category,
          details: updateAbleCoffee.details,
          photo: updateAbleCoffee.photo,
          
        }
      }

      const result = await userCollection.updateOne(filter, updatedCoffee, options);
      res.send(result);

    })

    app.delete("/coffee/:id", async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () =>{
  console.log(`Coffee store server running on ${port}`)
})