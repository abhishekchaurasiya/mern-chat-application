import mongoose from "mongoose"
import "dotenv/config"

const Url = process.env.MONGODB_URL;

const connectDatabase = async()=>{
    try {
        let database = await mongoose.connect(Url.toString().trim())
        console.log(`Connected to MongoDB with ${database.connection.host}`)
    } catch (error) {
        console.error('Failed to connect to MongoDB', error)
        process.exit(1)
    }
}

export default connectDatabase;