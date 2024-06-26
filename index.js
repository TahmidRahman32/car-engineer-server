const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gv1gxa1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
   serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
   },
});

async function run() {
   try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();

      const servicesCollection = client.db("carEngineer").collection("services");
      const BookingCollection = client.db("carEngineer").collection("bookings");

      app.get("/services", async (req, res) => {
         const cursor = servicesCollection.find();
         const result = await cursor.toArray();
         res.send(result);
      });

      app.get("/services/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) };

         const options = {
            projection: { title: 1, price: 1, img: 1 },
         };
         const result = await servicesCollection.findOne(query, options);
         res.send(result);
      });

      app.post("/booking", async (req, res) => {
         const data = req.body;
         const result = await BookingCollection.insertOne(data);
         res.send(result);
      });

      app.get('/booking',async(req,res)=>{
         console.log(req.query.email);
         let query = {}
         if(req.query?.email){
            query = {email: req.query.email}
         }
         const result = await BookingCollection.find(query).toArray();
         res.send(result);
      })

      app.patch('/booking/:id',async(req, res)=>{
         const id = req.params.id;
         const query = { _id: new ObjectId(id)};
         const updateData = req.body;
          const updateDoc = {
             $set: {
                status:updateData.status
             },
          };
          const result = await BookingCollection.updateOne(query, updateDoc);
          res.send(result)
         
      })

      app.delete('/booking/:id', async(req, res)=>{
         const id = req.params.id;
         const query = {_id: new ObjectId(id)};
         const result = await BookingCollection.deleteOne(query);
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
run().catch(console.log);

app.get("/", (req, res) => {
   res.send("car engineer server is running");
});

app.listen(port, () => {
   console.log(`car engineer PORT|| ${port}`);
});
