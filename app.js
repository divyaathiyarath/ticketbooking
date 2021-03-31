const Express = require('express');
const app = new Express();
app.use(Express.json());
app.use(Express.urlencoded({extended:true}));
const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/ticket");
//user collection
var userModel = mongoose.model("user",{
    name: String,
    mailId: String,
    password: String
});

//booking collection
var bookingModel = mongoose.model("booking",{
    userId: String,
    trainId: String,
    tickets:{    
        type: Number,
        default: 0
    }
});

//ticket collection
var ticketModel = mongoose.model("ticket",{
    train: String,
    availableTickets:{    
        type: Number,
        default: 10
    }
});
//api to register user
app.post('/register',(req,res) => {
    var reg = new userModel(req.body);
    reg.save((error)=>{
        if (error) {
            throw error;
        } else {
            res.send(reg);
        }
    })
})
//api for adding tickets to ticket collection
app.post('/tickets',(req,res) => {
    var ticketReg = new ticketModel(req.body);
    ticketReg.save((error)=>{
        if (error) {
            throw error;
        } else {
            res.send(ticketReg);
        }
    })
})
//api for booking
app.post('/booking',(req,res)=>{
    var btickets = 0;
    // read data from booking collection
    var userId=req.body.userId;
    bookingModel.findOne({userId:userId},(error,data)=>{
        if(error)
        {
            throw error
        }
        else{
            if(data!=null){
                btickets = data.tickets
                console.log("tickets "+btickets)
            }
            
        }
    })
    //read data from ticket collection
    var trainId=req.body.trainId;
    ticketModel.findOne({_id:trainId},(error,data)=>{
        if(error)
        {
            throw error
        }
        else{
            console.log("ticket details "+data.availableTickets)
            let count = data.availableTickets-req.body.tickets
            if(count>=0)
            {
                let tcount = btickets+req.body.tickets;
                bookingModel.findOneAndUpdate({userId:req.body.userId},{tickets:tcount},{upsert:true},(error,response)=>
                {
                    if(error)
                    {
                      console.log(error);
                      throw error;
                    }
                })
                ticketModel.findOneAndUpdate({_id:req.body.trainId},{availableTickets:count},{upsert:true},(error,response)=>
                {
                    if(error)
                    {
                      console.log(error);
                      throw error;
                    }
                })
                res.send("booked "+req.body.tickets +"remaining "+ count);
            }
            // res.send(data);

            else {
                res.send("declined "+req.body.tickets +" booked "+btickets+" remaining "+data.availableTickets);
            }
        }
    })
})
//Api to cancel ticket
app.post('/cancel',(req,res)=>{
    var tickets=0;
    var booked=0;
    // read data from ticket collection
    var trainId=req.body.trainId;
    ticketModel.findOne({_id:trainId},(error,data)=>{
        if(error)
        {
            throw error
        }
        else{
            if(data!=null){
                tickets = parseInt(data.availableTickets)+parseInt(req.body.tickets);
                console.log("tickets "+tickets)
            }
            
        }
    })
    //read data from booking collection
    var userId=req.body.userId;
    bookingModel.findOne({userId:userId},(error,data)=>{
        if(error)
        {
            throw error
        }
        else{
            //console.log("ticket details "+data.availableTickets)
            booked = data.tickets;
            let count = data.tickets-req.body.tickets
            if(count>=0)
            {
                //let tcount = btickets+req.body.tickets;
                bookingModel.findOneAndUpdate({userId:req.body.userId},{tickets:count},{upsert:true},(error,response)=>
                {
                    if(error)
                    {
                      console.log(error);
                      throw error;
                    }
                })
                ticketModel.findOneAndUpdate({_id:req.body.trainId},{availableTickets:tickets},{upsert:true},(error,response)=>
                {
                    if(error)
                    {
                      console.log(error);
                      throw error;
                    }
                })
                res.send("canceld "+req.body.tickets +"remaining "+tickets);
            }
            // res.send(data);

            else {
                res.send("declined "+req.body.tickets +" booked "+booked+" remaining "+tickets);
            }
        }
    })
})
app.listen(3000,(req,res)=>{
    console.log("Server is running on port 3000");
});