import slugify from "slugify"
import productModel from "../models/productModel.js";
import categoryModel from '../models/categoryModel.js'
import fs from 'fs'

export const createProductController = async(req,res) => {
    try {
      const {name,slug,description,price,category,quantity,shipping} = req.fields
      const {photo} = req.files
      //validation
      switch(true){
          case !name:
            return res.status(500).send({error:'Name is Required'})
          case !description:
            return res.status(500).send({error:'description is Required'})
          case !price:
            return res.status(500).send({error:'price is Required'})
          case !category:
                return res.status(500).send({error:'Category is Required'})
          case !quantity:
                return res.status(500).send({error:'quantity is Required'})
          case photo && photo.size<10000:
                return res.status(500).send({error:'photo is Required less than 1MB'})
      }
      const products = new productModel({...req.fields,slug:slugify(name)})
      if(photo){
        products.photo.data = fs.readFileSync(photo.path)
        products.photo.contentType = photo.type
      }
      await products.save()
      res.status(201).send({
        success:true,
        message:'Product Created successfully',
        products,
      })
    } catch (error) {
      console.log(error)
      res.status(500).send({
        success:false,
        message:'Error in creating product',
        error,
      })
    }
}


// get all product

export const getProductController = async(req,res) => {
    try {
      const products = await productModel.find({}).populate('category').select('-photo').limit(12).sort({createdAt:-1})
      res.status(200).send({
        success:true,
        Totalcount:products.length,
        message:'All Products',
        products,
      })
    } catch (error) {
    console.log(error)
    res.status(500).send({
        success:false,
        message:'Erorr in getting Products',
        error:error.message
    })
    }
}

// get Single Product
export const getSingleProductController = async(req,res) => {
    try {
      const product = await productModel.findOne({slug:req.params.slug}).select("-photo").populate('category');
      res.status(200).send({
        success:true,
        message:'Single Product Fetched',
        product
      })
    } catch (error) {
      console.log(error)
      res.status(500).send({
        success:false,
        message:'Error in getting Single product',
        error:error.message
      })
    }
};

// get photo

export const productPhotoController = async(req,res) => {
    try {
      const product = await productModel.findById(req.params.pid).select('photo')
      if(product.photo.data){
        res.set("Content-type",product.photo.contentType);
        return res.status(200).send(product.photo.data);
      }
    } catch (error) {
      console.log(error)
      res.status(500).send({
        success:false,
        message:'Error while getting Photo',
        error


      })
    }
} ;
//delete product
export const deleteProductController = async(req,res) => {
    try {
       await productModel.findByIdAndDelete(req.params.pid).select("-photo")
       res.status(200).send({
        success:true,
        message:'Product Deleted successfully'
       })
    } catch (error) {
      console.log(error)
      res.status(500).send({
        success:true,
        message:'Error in deletion',
        error
      })
    }
};

//update product
export const updateProductController = async(req,res) => {
    try {
        const {name,slug,description,price,category,quantity,shipping} = req.fields
        const {photo} = req.files
        console.log(category)
        //validation
        switch(true){
            case !name:
              return res.status(500).send({error:'Name is Required'})
            case !description:
              return res.status(500).send({error:'description is Required'})
            case !price:
              return res.status(500).send({error:'price is Required'})
            case !category:
                  return res.status(500).send({error:'Category is Required'})
            case !quantity:
                  return res.status(500).send({error:'quantity is Required'})
            case photo && photo.size<10000:
                  return res.status(500).send({error:'photo is Required less than 1MB'})
        }
        const products = await productModel.findByIdAndUpdate(req.params.pid,
            {...req.fields, slug:slugify(name)},{new:true}
        )
        if(photo){
          products.photo.data = fs.readFileSync(photo.path)
          products.photo.contentType = photo.type
        }
        await products.save()
        res.status(201).send({
          success:true,
          message:'Product updated successfully',
          products,
        })
      } catch (error) {
        console.log(error)
        res.status(500).send({
          success:false,
          message:'Error in updating product',
          error,
        })
      }
  
};

// filter product
export const productFiltersController = async(req,res) => {
    try {
      const {checked,radio} = req.body
      let args = {}
      if(checked.length>0) args.category = checked
      if (radio.length) args.price = {$gte:radio[0],$lte:radio[1]}
      const products = await productModel.find(args)
      res.status(200).send({
        success:true,
        products
      })
    } catch (error) {
      console.log(error)
      res.status(400).send({
        success:false,
        message:'Error while Filtering Products',
        error
      })
      
    }
};

// product count

export const productCountController = async(req,res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount()
    res.status(200).send({
      success:true,
      total,
    })
  } catch (error) {
    console.log(error)
    res.status(400).send({
      success:false,
      message:'Error in product count',
      error,
    })
    
  }
};

// product-list per page
export const productListController = async(req,res) => {
  try{
     const perPage = 2
     const page= req.params.page ? req.params.page:1
     const products = await productModel.find({}).select("-photo").skip((page-1)*perPage).limit(perPage);
     res.status(200).send({
      success:true,
      products,
     })
  } catch(error){
    console.log(error)
    res.status(400).send({
      success:false,
      message:'error in per page controller',
      error
    })
  }
};


// search product controller
export const searchProductController = async(req,res) => {
  try {
    const {keyword} = req.params
    const result = await productModel.find({
      $or:[
        {name:{$regex :keyword,$options:"i"}},
        {description:{$regex :keyword,$options:"i"}}
      ]
    }).select("-photo")
    res.json(result)
  } catch (error) {
    console.log(error)
    res.status(400).send({
      success:false,
      message:'Error In Search Product API',
      error
    })
  }
}

// related products

export const relatedProductController= async(req,res) => {
  try {
    const {pid,cid} = req.params
    const products = await productModel.find({
      category:cid,
      _id:{$ne:pid}
    }).select("-photo").limit(3).populate("category")
    res.status(200).send({
        success:true,
        products,
    })
  } catch (error) {
    console.log(error)
    res.status(400).send({
      success:false,
      message:'error while geting related product',
      error
    })
  }
}

// category product
export const productCategoryController = async(req,res) =>  {
  try {
    const category = await categoryModel.findOne({slug:req.params.slug})
    const products = await productModel.find({category}).populate('category')
    res.status(200).send({
      success:true,
      category,
      products
    })
  } catch (error) {
    console.log(error)
    res.send(400).send({
      success:false,
      error,
      message:'Error While Getting products'
    })
  }
}