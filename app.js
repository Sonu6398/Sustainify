const express = require("express");
const nodemailer = require("nodemailer");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const User = require("./models/UserAuth");
const pickmodel = require("./models/pickup");
const pickupboy=require("./models/PickUser");
const ScrapItem = require('./models/ScrapItem'); // Adjust path if needed
// const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

app.set("view engine", "ejs");
app.use(express.static("Public"));

app.use(bodyparser.urlencoded({ extended: true }));

// Configure sessions
let account="Login";
app.use(
  session({
    secret: "software_engineering", // Replace with a strong secret key
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }, // 1-hour session expiration
  })
);

// Configure nodemailer
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});



app.get("/", (req, res) => {
  let account;

  if (req.session.Name) {
    // If session has Name, set account to Name
    account = req.session.Name;
  } else if (req.session.pickupName) {
    // If session has pickupName, set account to pickupName
    account = req.session.pickupName;
  } 
  else if(req.session.adminName){
    account="Admin";
  }
  else {
    // If neither is present, set account to "Login"
    account = "Login";
  }

  res.render("index", { Account: account });
});

app.get("/index", (req, res) => {
  let account;

  if (req.session.Name) {
    // If session has Name, set account to Name
    account = req.session.Name;
  } else if (req.session.pickupName) {
    // If session has pickupName, set account to pickupName
    account = req.session.pickupName;
  } 
  else if(req.session.adminName){
    account="Admin";
  }
  else {
    // If neither is present, set account to "Login"
    account = "Login";
  }

  res.render("index", { Account: account });
});


app.get("/AskPage", (req, res) => {
  
  if (req.session.Name) {
    res.redirect("/Profile");
  }
  else if (req.session.pickupName) {
    res.redirect("/Profile");
  } 
  else if(req.session.adminName){
    res.redirect("/Profile");
  }
  else {
      res.render("Askpage");
  }
});

app.get("/demo", (req, res) => {
  res.render("demo");
});
//
app.get("/ChooseOptionPage", function(req, res) {
    
    if (req.session.Name) {
      res.render("ChooseOptionPage", { nm: req.session.Name });
  } else {
    res.render("AskPage");
  }
});
//

app.get("/LoginPage", (req, res) => {
  res.render("LoginPage", { errorMessage: " " });
});

app.get("/Signup", (req, res) => {
  res.render("Signup", { errorMessage: " " });
});

app.get("/otp", (req, res) => {
  res.render("otp");
});


// Admin Details
const ADMIN_EMAIL = "aakapishwey111@gmail.com";
const ADMIN_PASSWORD = "Admin@123";
const nameAd="Admin";


app.get("/NewPass", (req, res) => {
  res.render("NewPass");
});

app.get("/Checkoptions", (req, res) => {

    res.render("Checkoption");
  });

// Handle new password setting
app.post("/NewPass", async (req, res) => {
  try {
    const user = await User.findOne({ Email: req.session.forgotEmail });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const newpass = req.body.newpass;
    user.Password = newpass;
    await user.save();
    return res.redirect("/LoginPage");
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).send("Server error occurred");
  }
});

// Handle OTP submission
app.post("/otp", async (req, res) => {
  const otp = req.body.otp;
  if (otp == req.session.otp) {
    if (req.session.redirect === 1) {
      const newuser = new User({
        Name: req.session.name,
        Email: req.session.email,
        Password: req.session.password,
      });
      try {
        await newuser.save();
        console.log("Data saved");
      } catch (err) {
        console.error("Error:", err);
      }
      return res.redirect("/LoginPage");
    } else {
      return res.redirect("/NewPass");
    }
  } else {
    res.write("Wrong OTP");
  }
});


  
// code to be changed.......................................................


// code to be changed...............................................
app.get('/api/scrap-items', async (req, res) => {
    try {
        const items = await ScrapItem.find({});
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch scrap items.' });
    }
});
  // Route to serve the PriceCalculator page
  app.get('/PriceCalculator', (req, res) => {
    res.render("PriceCalculator");
  });
  
  // API route to fetch scrap items dynamically
  app.get('/api/scrap-items', async (req, res) => {
    try {
      const scrapItems = await ScrapItem.find();
      res.json(scrapItems);
    } catch (error) {
      console.error('Error fetching scrap items:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get("/ScrapRates", async (req, res) => {
    try {
        const scrapItems = await ScrapItem.find(); // Fetch the scrap items from the database
        res.render("ScrapRates", { scrapItems }); // Pass the scrapItems data to the EJS view
    } catch (error) {
        console.error("Error fetching scrap items:", error);
        res.status(500).send("Server error occurred");
    }
});

// Handle signup
app.post("/Signup", (req, res) => {
  const { email, name, password, confpassword } = req.body;
  if (password === confpassword) {
    req.session.name = name;
    req.session.email = email;
    req.session.password = password;

    const otp = Math.floor(Math.random() * 9000) + 1000;
    req.session.otp = otp;
    req.session.redirect = 1;

    console.log(`OTP for signup: ${otp}`);

    var mailOptions = {
      from: "anshuyadav202301jan@gmail.com",
      to: email,
      subject: "Confirmation code",
      text: `Your signup code is ${otp}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Error in sending email:", error.message);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    return res.redirect("/otp");
  } else {
    return res.render("Signup", { errorMessage: "Passwords do not match" });
  }
});

// Handle login
app.post("/LoginPage", async (req, res) => {
  const { email, password, forgetemail } = req.body;

  if (forgetemail) {
    const user = await User.findOne({ Email: forgetemail });
    if (user) {
      const otp = Math.floor(Math.random() * 9000) + 1000;
      req.session.otp = otp;
      req.session.redirect = 0;
      req.session.forgotEmail = forgetemail;

      console.log(`OTP for password reset: ${otp}`);

      var mailOptions = {
        from: "anshuyadav202301jan@gmail.com",
        to: forgetemail,
        subject: "Verification code",
        text: `Your forget password code is ${otp}`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("Error in sending email:", error.message);
        } else {
          console.log("Email sent:", info.response);
        }
      });

      return res.redirect("/otp");
    }
  } else {
    let loginemail = req.body.email;
    let loginpass = req.body.password;
    try {
        const user = await User.findOne({ Email: loginemail });
        if (!user) {
            return res.render('LoginPage', { errorMessage: 'User not found' });
        }
        if (user.Password === loginpass) {
          // Store user details in the session
          req.session.Email = user.Email;
          req.session.Name = user.Name;
      
          // Redirect to ChooseOptionPage
          res.redirect("/ChooseOptionPage");
      } else {
            return res.render('LoginPage', { errorMessage: 'Incorrect Password' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error occurred");
    }
}});

// Handle logout
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
      }
      res.redirect("/index");
    });
  });

// pickupboy 

app.get("/pickupBoySignUpPage",function(req,res){
  res.render("pickupboysignup",{errorMessage: " "});
})

app.get("/pickupBoyLoginPage",function(req,res){
  res.render("pickupboylogin",{errorMessage: " "});
})

app.get("/pickboyotp",function(req,res){
  res.render("pickboyotp")
})

app.get("/pickupNewPass",(req,res) => {
  res.render("pickupNewPass");
})

app.get("/PickUpBoyPage",(req,res) => {
    const name=req.session.pickupName;
  res.render("PickUpBoyPage");
})

let pickupname,pickupemail,pickuppassword,pickuppin,pickupaddress,pickupaadhar,pickupaccount,pickupcode;

app.post("/PickUpSignup", function (req, res) {
    pickuppin = req.body.pincode;
    pickupaddress = req.body.address;
    pickupaadhar = req.body.aadhar;
    pickupemail = req.body.email;
    pickupname = req.body.name;
    pickuppassword = req.body.password;
    let confirmpass = req.body.confpassword;
  
    console.log("Info");
    console.log(pickupname);
    console.log(pickupemail);
    console.log(pickuppassword);
  
    if (pickuppassword === confirmpass) {
      req.session.pickupName = pickupname;
      req.session.pickupEmail = pickupemail;
      req.session.pickupPassword = pickuppassword;
  
      pickupcode = Math.floor(Math.random() * 9000) + 1000;
      console.log("Redirecting to OTP page");
      console.log(pickupcode + " is the OTP");
  
      var mailOptions = {
        from: "anshuyadav202301jan@gmail.com",
        to: pickupemail,
        subject: "Confirmation code",
        text: "Your Sign-up code is " + pickupcode,
      };
  
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("Error in sending email: " + error.message);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
  
      req.session.otp = pickupcode;
      req.session.redirect = 1;
      res.redirect("pickboyotp");
    } else {
      res.render("pickupboysignup", { errorMessage: "Passwords do not match" });
    }
  });
  



app.post("/pickotp", async function (req, res) {
  const otp = req.body.otp;
  if (otp == req.session.otp) {
    if (req.session.redirect === 1) {
      const newuser = new pickupboy({
        Name: req.session.pickupName,
        Email: req.session.pickupEmail,
        Password: req.session.pickupPassword,
        Address: pickupaddress,
        Aadhar: pickupaadhar,
        Pincode: pickuppin,
      });

      try {
        await newuser.save();
        console.log("Data saved");
        res.redirect("pickupBoyLoginPage");
      } catch (err) {
        console.log("Error:", err);
      }
    } else {
      res.redirect("pickupNewPass");
    }
  } else {
    res.write("Wrong OTP");
  }
});


app.post("/pickupNewPass",async function(req,res){
  try {
      const user = await pickupboy.findOne({ Email: forgotemail });

      const newpass = req.body.newpass;

      user.Password = newpass;
      await user.save();

      return res.redirect("/pickupboylogin");
  } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).send("Server error occurred");
  }
})

app.post("/PickUpLogin", async function (req, res) {
    const loginemail = req.body.email;
    const loginpass = req.body.password;
    const forgetemail = req.body.forgetemail;

    if (forgetemail) {
        const user = await pickupboy.findOne({ Email: forgetemail });
        if (user) {
            pickupcode = Math.floor(Math.random() * 9000) + 1000;

            req.session.otp = pickupcode;
            req.session.redirect = 0;
            req.session.forgotEmail = forgetemail;

            console.log("Redirecting to OTP page");
            console.log(pickupcode + " is the OTP");

            var mailOptions = {
                from: "anshuyadav202301jan@gmail.com",
                to: forgetemail,
                subject: "Verification code",
                text: "Your Forget Password code is " + pickupcode,
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log("Error in sending email: " + error.message);
                } else {
                    console.log("Email sent: " + info.response);
                }
            });

            res.redirect("pickboyotp");
        } else {
            res.render("pickupboylogin", { errorMessage: "User not found" });
        }
    } else {
        try {
            const user = await pickupboy.findOne({ Email: loginemail });
            if (!user) {
                return res.render("pickupboylogin", {
                    errorMessage: "User not found",
                    email: "",
                    password: "",
                });
            }
            if (user.Password !== loginpass) {
                return res.render("pickupboylogin", {
                    errorMessage: "Incorrect Password",
                    email: "",
                    password: "",
                });
            }
            if (!user.approved) {
                return res.render("pickupboylogin", {
                    errorMessage: "Account not approved yet. Please contact admin.",
                    email: "",
                    password: "",
                });
            }

            // Successful login
            req.session.pickupEmail = user.Email;
            req.session.pickupName = user.Name;

            const allpickups = await pickmodel.find({ pincode: user.Pincode ,status:"Pending"});
            res.render("PickupBoyPage", { user, pickups: allpickups });
        } catch (err) {
            console.log(err);
            res.status(500).send("Server error");
        }
    }
});

  


// pickupboy
// app.get("/SchedulePickup",func(req,res){
//     res.render("SchedulePickup");
// })
app.post("/SchedulePickup", (req, res) => {
  console.log(req.session);  // Log the session data for debugging

  if (req.session.Name) {
      const username = req.session.Name;
      res.render("SchedulePickup", { username });
  } else {
      console.log("User not logged in");
      res.redirect('/LoginPage');
  }
});



app.get("/Profile", (req, res) => {
  if (req.session.Email) {
    const user = {
      Name: req.session.Name,
      Email: req.session.Email,
    };
    res.render('userProfile', { user });
  } else if (req.session.pickupEmail) {
      const user = {
        Name: req.session.pickupName,
        Email: req.session.pickupEmail,
    };
    res.render('pickupProfile', { user });
    
  }
  else if (req.session.adminName) {
    const user = {
      Name: req.session.adminName,
      Email: ADMIN_EMAIL,
  };
  res.render('AdminProfile', { user });
  
} else {
    res.redirect('/LoginPage');
  }
});

////////

app.get("/ScrapRates", (req, res) => {
    res.render("ScrapRates");
});
  
app.get("/Goback",function(req,res){
    res.redirect("ChooseOptionPage");
});



// app.get("/PriceCalculator",function(req,res){
//     res.render("PriceCalculator");
// })
app.post("/CreatePickup",async function(req,res){
    let {date,time,address,weight,remarks,pincode}=req.body;
    let newpickup=await pickmodel.create({
        date:date,
        time:time,
        address:address,
        weight:weight,
        remarks:remarks,
        pincode:pincode,
        email:req.session.Email
    })
    // console.log(newpickup.weight);
    res.redirect("Checkoptions");
})

app.get("/ScheduledPickups",async function(req,res){
    let allpickups=await pickmodel.find({email:req.session.Email,status:"Pending"});
    res.render("ScheduledPickups",{pickups:allpickups});
})

app.get("/CompletedPickups",async function(req,res){
    let allpickups=await pickmodel.find({email:req.session.Email,status:"Completed"});
    res.render("CompletedPickups",{pickups:allpickups});
})

app.get('/cancelPickup/:id', async (req, res) => {
    try {
        const pickupId = req.params.id;
        const deletedPickup = await pickmodel.findByIdAndDelete(pickupId);
        if (!deletedPickup) {
            return res.status(404).send('Pickup not found');
        }
        res.redirect('/ScheduledPickups');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.get('/MarkCompleted/:id', async (req, res) => {
    try {
        const pickupId = req.params.id;
        
        // Update the status of the specific pickup
        const updatedPickup = await pickmodel.findByIdAndUpdate(
            pickupId, 
            { status: 'Completed' }, 
            { new: true }
        );

        if (!updatedPickup) {
            return res.status(404).send('Pickup not found');
        }

        // Fetch all pending pickups for the current pickup boy's pincode
        const user = await pickupboy.findOne({ Email: req.session.pickupEmail });
        const allPickups = await pickmodel.find({ pincode: user.Pincode, status: "Pending" });

        // Render the PickupBoyPage with the updated list of pending pickups
        res.render("PickupBoyPage", { pickups: allPickups ,user});
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});



//........................................................................................................

//Hello Hello
// Admin Routes
app.get("/AdministratorLoginPage", (req, res) => {
    res.render("AdministratorLoginPage", { errorMessage: "" });
  });
  
  app.post("/AdminLogin", (req, res) => {
    const { email, password } = req.body;
  
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      account=nameAd;
      res.redirect("/AdminDashboard");
    } else {
      res.render("AdministratorLoginPage", { errorMessage: "Invalid login credentials!" });
    }
  });
  
  // app.get("/AdminDashboard", async (req, res) => {
  //   const allpickups = await pickmodel.find();
  //   res.render("AdminDashboard", { pickups: allpickups });
  // });
  
  // Logout
  app.get("/logout", (req, res) => {
    account = "Login";
    res.render("index", { Account: account });
  });
  
  
  
  //hello
  app.get('/Logout', (req, res) => {
      // Perform session clearing or logout actions
      res.redirect('/AskPage');
  });
  
  app.get("/AdminProfile", (req, res) => {
      if (account === "Login") {
        res.redirect("/LoginPage"); // Redirect to login page if not logged in
      } else {
        res.render("AdminProfile", { name: account });
      }
    });
    
    app.get("/", (req, res) => {
      res.redirect("index");
    });
    
    app.get("/index", (req, res) => {
      res.render("index", { Account: account });
    });
    
    // Logout for profile page
    app.get('/logout', (req, res) => {
      account = "Login"; // Reset the account variable
      res.redirect('/index'); // Redirect to the homepage
    });
    
  
    app.get("/AdminDashboard", async (req, res) => {
      const allpickups = await pickmodel.find();
      res.render("AdminDashboard", { pickups: allpickups, Account: account });
    });
    
  
  
    //Admin Functionality........................................................
  //   const app1 = express();
  
  
  
    //mongo connection
  //   mongoose.connect('mongodb://localhost:27017/scrapDB', {
  //     useNewUrlParser: true,
  //     useUnifiedTopology: true
  // }).then(() => console.log('MongoDB connected'))
  //   .catch(err => console.error('MongoDB connection error:', err));
  
    //Routes
  
    // Route to render the admin form for adding a new scrap item
  app.get('/admin/add-scrap-item', (req, res) => {
      res.render('addScrapItem'); // Ensure 'addScrapItem.ejs' exists in the views folder
  });
  
  // Route to handle form submission for adding a new scrap item
  app.post('/admin/add-scrap-item', async (req, res) => {
      const { category, name, price, unit, imageUrl } = req.body;
      try {
          const newItem = new ScrapItem({ category, name, price, unit, imageUrl });
          await newItem.save();
          res.redirect('/ScrapRates'); // Redirect to scrap rates page
      } catch (error) {
          console.error('Error saving scrap item:', error);
          res.status(500).send('Error adding scrap item');
      }
  });
  
  // Route to display scrap rates dynamically
  app.get('/scrap-rates', async (req, res) => {
      try {
          // Assuming you have a ScrapItem model
          const scrapItems = await ScrapItem.find(); // Fetch all scrap items
  
          // Pass the data to the EJS template
          res.render('ScrapRates', { scrapItems });
      } catch (error) {
          console.error(error);
          res.status(500).send('Something went wrong');
      }
  });

  app.get("/CheckPickupApplications",async (req,res)=>{
    let requests=await pickupboy.find({approved:false});
    res.render("CheckPickupApplications",{requests});
  })

app.get("/Verify/:_id",async (req,res)=>{
    const reqid=req.params._id;
    const updatedboy = await pickupboy.findByIdAndUpdate(
        reqid, 
        { approved:true }, 
        { new: true }
    );    
    if (!updatedboy) {
        return res.status(404).send('User not found');
    }
    let requests=await pickupboy.find({approved:false});
    res.render("CheckPickupApplications",{requests});

})

app.get("/CheckPickups",async (req,res)=>{
    let allpickups=await pickmodel.find();
    res.render("CheckPickups",{pickups:allpickups});
})





app.listen(3000,function(req,res){
    console.log("Server is running");
});
