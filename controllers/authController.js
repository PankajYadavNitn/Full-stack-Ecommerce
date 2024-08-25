import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/usermodel.js";
import JWT from "jsonwebtoken";
import ordermodel from "../models/orderModel.js";
export const registerController = async(req,res) => {
    try {
      const {name,email,password,phone,address,answer} = req.body
      //validation
      if(!name){
        return res.send({error:"Name is Required"})
      }
      if(!email){
        return res.send({message:"Email is Required"})
      }
      if(!password){
        return res.send({message:"Password is Required"})
      }
      if(!phone){
        return res.send({message:"Phone No is Required"})
      }
      if(!address){
        return res.send({message:"Address is Required"})
      }
      if(!answer){
        return res.send({message:"Answer is Required"})
      }


     //check user
      const exisitinguser = await userModel.findOne({email})
    // exisiting user
    if(exisitinguser){
        return res.status(200).send({
            success:false,
            message:'Already Registered please Login',
        })
    }
    //register user
    const hashedPassword = await hashPassword(password)
    //save
    const user = await new userModel({name,email,phone,address,password:hashedPassword,answer}).save()

    res.status(201).send({
        success:true,
        message:'User Register Successfully',
        user
    })



    } catch (error) {
      console.log(error)
      res.status(500).send({
        success:false,
        message: 'Error in Registeration ',
        error
      })
    }
};


//POST login
export const loginController = async(req,res) => {
  try{
     const {email,password} = req.body
     //validation
     if(!email || !password){
      return res.status(404).send({
        success:false,
        message:'Invalid email or password'
      })
     }
     //check user
     const user = await userModel.findOne({email})
     if (!user){
      return res.status(404).send({
        success:false,
        message:"Email is not registered"
      })
     }
     const match = await comparePassword(password,user.password)
     if (!match){
      return res.status(200).send({
        success:false,
        message:"Wrong password"

      })
     }
     // Token
     const token = await JWT.sign({_id:user._id},process.env.JWT_SECRET, {expiresIn:"7d",});
     res.status(200).send({
      success:true,
      message:'login successfully',
      user:{
        name:user.name,
        email:user.email,
        phone:user.phone,
        address:user.address,
        role:user.role,
        id:user._id
      },
      token,
     });
  } catch (error){
    console.log(error)
    res.status(500).send({
      success:false,
      message:'Error in login',
      error
    })
  }
};

//forgotPasswordController
export const forgotPasswordController = async (req,res) => {
  try {
    const {email,answer,newPassword} = req.body
    if(!email){
      res.status(400).send({message:'Email is required'})
    }
    if(!answer){
      res.status(400).send({message:'answer is required'})
    }
    if(!newPassword){
      res.status(400).send({message:' New Password is required'})
    }
   //check answer
   const user = await userModel.findOne({email,answer})
   //validation
   if(!user){
    return res.status(404).send({
      success:false,
      message:'Wrong Email or Answer'
    })
   }
   const hashed =await hashPassword(newPassword)
   await userModel.findByIdAndUpdate(user._id,{password:hashed})
   res.status(200).send({
    success:true,
    message:"Password Reset Successfully",

   })
  } catch (error) {
    console.log(error)
    res.status(500).send({
    success:false,
    message:"Something went wrong",
    error
  })
  }
};

//test controller
export const testController = (req,res) => {
  res.send("Protected Route");
}

// update user profile
export const updateProfileController = async(req,res) => {
  try {
    const {name,email,password,address,phone}=req.body
    const user = await userModel.findById(req.user._id)
    // password
    if(password && password.length <6){
      return res.json({error:'Password is required and atlest 6 character long'})
    }
    const hashedPassword = password ? await hashPassword(password) : undefined
    const updatedUser = await userModel.findByIdAndUpdate(req.user._id,{
     name:name || user.name,
     password:hashedPassword || user.password,
     phone: phone || user.phone,
     address: address || user.address
    },
      {new:true})
    res.status(200).send({
      success:true,
      message:'User Profile updated Successfully',
      updatedUser
    })
  } catch (error) {
    console.log(error)
    res.status(400).send({
      success:false,
      message:'Error While Update profile',
      error
    })
  }
}

// payment getway
//set orders
 export const setOrders=async (req,res)=>{
  try{
    const m=req.body;
//m={products,payment,buyer,paymentStatus,status,session_id}
 const get=await ordermodel.create(m)
if(!get){
  return res.status(400).send({
    success:false,
    message:'Error While Update profile',
    error
  })
}
res.status(200).json({
  success:true,
  message:'created order'
})
  }
  catch(err){
    return res.status(400).send({
      success:false,
      message:'Error While Update profile',
      err
    })
  }
}

//verify created order
 export const verifyOrder=async (req,res,next)=>{
  try{
    const {sessionId}=req.body;
//m={products,payment,buyer,paymentStatus,status,session_id}
const get=await ordermodel.findOne({session_id:sessionId})
if(!get){
  return send.status(400).send({
    success:false,
    message:'Error While Update profile',
    error
  })
}
get.paymentStatus='Completed';
await get.save();
res.status(200).json({
  success:true,
  message:'payment done'
})
  }
  catch(err){
    console.log(err.message)
    return res.status(400).send({
      success:false,
      message:'Error While Update profile',
      err
    })
  }
}

// Orders
export const getOrdersController = async(req,res) => {
  try {
    console.log(req.user._id)
    const orders = await ordermodel.find({buyer:req.user._id}).populate("products","-photo").populate("buyer","name")
    res.status(200).json(orders)
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success:false,
      message:"error While getting orders",
      error
    })
  }
}
// Orders
export const getAllOrdersController = async(req,res) => {
  try {
    console.log(req.user._id)
    const orders = await ordermodel.find({}).populate("products","-photo").populate("buyer","name")
    res.status(200).json(orders)
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success:false,
      message:"error While getting orders",
      error
    })
  }
}

// order status update
export const orderStatusController = async(req,res) => {
  try {
    const {orderId} = req.params
    const {status} = req.body
    const orders = await ordermodel.findByIdAndUpdate(orderId,{status},{new:true})
    res.json(orders)
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success:false,
      message:'Error While Updating Order Status',
      error
    })
  }
}