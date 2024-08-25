import express from 'express'
import {registerController,loginController,testController, forgotPasswordController, updateProfileController, setOrders, verifyOrder, getOrdersController, getAllOrdersController, orderStatusController} from '../controllers/authController.js';
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';
//router object
const router = express.Router()

//routing
//Register || method Post
router.post('/register',registerController)

// LOGIN ||POST
router.post('/login',loginController)

//Forgot Password || POST
router.post('/forgot-password',forgotPasswordController)

//test route
router.get('/test', requireSignIn,isAdmin, testController);

//protected user route auth
router.get('/user-auth',requireSignIn,(req,res) =>{
    res.status(200).send({ok:true});
})
//protected Admin route auth
router.get('/admin-auth',requireSignIn,isAdmin,(req,res) =>{
    res.status(200).send({ok:true});
})

// update profile
router.put('/profile',requireSignIn,updateProfileController)
// payment
router.post('/setOrders',requireSignIn,setOrders)
router.post('/verifyOrder',requireSignIn,verifyOrder)

// orders
router.get('/orders',requireSignIn,getOrdersController)
// All orders
router.get('/all-orders',requireSignIn,isAdmin,getAllOrdersController)

// order StatusUpdate
router.put("/order-status/:orderId",requireSignIn,isAdmin,orderStatusController)

export default router 




