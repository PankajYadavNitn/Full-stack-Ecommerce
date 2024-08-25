import mongoose from 'mongoose'
let order_schema=new mongoose.Schema({
products:[
          {
                    product: {
                              type: mongoose.Schema.Types.ObjectId,
                              ref: "Product"
                            },
                            quantity: {
                              type: Number,
                              required: true,
                              min: 1
                            },
                            photo:{
                              type:String
                            },
                            name:{
                              type:String
                            },
                            price:{
                              type:Number
                            }
         }
          
],
payment:{
          type:Number,
          required:true
},
session_id:{
          type:String,
          required:true
},
buyer:{
          type:mongoose.ObjectId,
          ref:"user"
},

paymentStatus: {
          type: String,
          default: 'Pending',
          enum: ['Pending', 'Completed', 'Failed']
        },

status:{
          type:String,
          default:'Not Processed',
          enum:['Not Processed','Processing','Shipped','delievered','cancelled']
},
address:{
  type:String,
}
},{timestamps:true})

let ordermodel=mongoose.model('order',order_schema);
export default ordermodel;