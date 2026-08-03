const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const Upload = require("./Upload");
require("dotenv").config();


cloudinary.config({

  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,

  api_key: process.env.CLOUDINARY_API_KEY,

  api_secret: process.env.CLOUDINARY_API_SECRET

});


mongoose.connect(process.env.MONGODB_URI)

.then(() => console.log("✅ MongoDB Connected"))

.catch(err => console.error("❌ MongoDB Error:", err));


const app = express();


app.use(cors());

app.use(express.json());


const upload = multer({

  dest: "uploads/"

});



app.get("/", (req,res)=>{

  res.send("Skiza Backend Running");

});



// Upload screenshot

app.post("/upload", upload.single("screenshot"), async (req,res)=>{


  if(!req.file){

    return res.status(400).json({

      success:false,

      message:"No screenshot uploaded"

    });

  }


  try{


    const result = await cloudinary.uploader.upload(

      req.file.path,

      {
        folder:"skiza"
      }

    );


    fs.unlinkSync(req.file.path);



    const newUpload = new Upload({

      filename:req.file.originalname,

      imageUrl:result.secure_url

    });



    await newUpload.save();



    res.json({

      success:true,

      imageUrl:result.secure_url,

      message:"Screenshot uploaded successfully"

    });



  }catch(error){


    console.error(error);


    res.status(500).json({

      success:false,

      message:"Upload failed"

    });


  }


});




// Get uploads

app.get("/uploads", async(req,res)=>{


try{


const uploads = await Upload.find().sort({

uploadedAt:-1

});


res.json(uploads);



}catch(error){


res.status(500).json({

success:false,

message:"Failed to fetch uploads"

});


}


});





// Total uploads

app.get("/stats", async(req,res)=>{


try{


const totalUploads = await Upload.countDocuments();


res.json({

success:true,

totalUploads

});


}catch(error){


console.error("Stats Error:",error);


res.status(500).json({

success:false,

message:error.message

});


}


});






// Today and This Week statistics

app.get("/stats-details", async(req,res)=>{


try{


const now = new Date();



const startOfToday = new Date(

now.getFullYear(),

now.getMonth(),

now.getDate()

);




const startOfWeek = new Date();


startOfWeek.setDate(

now.getDate() - now.getDay()

);





const todayUploads = await Upload.countDocuments({

uploadedAt:{

$gte:startOfToday

}

});




const weekUploads = await Upload.countDocuments({

uploadedAt:{

$gte:startOfWeek

}

});





res.json({

success:true,

todayUploads,

weekUploads

});





}catch(error){


console.error("Detailed Stats Error:",error);



res.status(500).json({

success:false,

message:error.message

});


}


});






// Admin Login

app.post("/admin/login",(req,res)=>{


const {username,password}=req.body;



if(

username===process.env.ADMIN_USERNAME &&

password===process.env.ADMIN_PASSWORD

){


return res.json({

success:true,

message:"Login successful"

});


}



return res.status(401).json({

success:false,

message:"Invalid username or password"

});


});





const PORT = process.env.PORT || 3000;


app.listen(PORT,()=>{

console.log(`Server running on port ${PORT}`);

});
