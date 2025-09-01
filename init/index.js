const mongoose = require ("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user");


const Mongo_URL = "mongodb+srv://sowmyaaddala25:Test123456@cluster0.ki2lg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

main()
.then(()=>{
    console.log("Connected to database");
})
.catch(err =>{
    console.log(err);
})

async function main(){
    await mongoose.connect(Mongo_URL);
}

// const initDB = async () =>{
//     await Listing.deleteMany({});
//     //initData.data = initData.data.map((obj)=>({...obj, owner :"67245add140c87749010dabc"}));
//     const user = await User.findOne(); 
//     initData.data = initData.data.map(obj => ({ ...obj, owner: user._id }));

//     await Listing.insertMany(initData.data);
//     console.log("Data was initilized");
// };

const initDB = async () => {
    await Listing.deleteMany({});

    const user = await User.findOne(); // get one existing user
    if (!user) {
        console.log("⚠️ No user found, please create one first");
        return;
    }

    initData.data = initData.data.map(obj => ({
        ...obj,
        owner: user._id
    }));

    await Listing.insertMany(initData.data);
    console.log("✅ Data initialized with owners");
};


initDB();