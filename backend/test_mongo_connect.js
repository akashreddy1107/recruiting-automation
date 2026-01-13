
import mongoose from 'mongoose';

const uri = "mongodb+srv://recruitai:Remember%40naruto@cluster0.kj9jolq.mongodb.net/recruiting_app?retryWrites=true&w=majority&appName=Cluster0";

console.log("Attempting to connect to MongoDB Atlas...");

mongoose.connect(uri)
    .then(() => {
        console.log("SUCCESS: Connected to MongoDB Atlas!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("FAILURE: Could not connect.");
        console.error(err);
        process.exit(1);
    });
