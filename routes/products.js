var express = require('express');
var router = express.Router();
let productModel = require('../schemas/products');
let categoryModel = require('../schemas/category');
let slug = require('slugify');

/* API: Lấy danh sách sản phẩm */
router.get('/view', async function (req, res, next) {
  try {
    let products = await productModel.find({ isDeleted: false }).populate('category');
    res.render('products', { title: 'Product List', products });
  } catch (error) {
    next(error);
  }
});

/* Giao diện: Hiển thị form thêm sản phẩm */
router.get('/add', async function (req, res, next) {
  try {
    let categories = await categoryModel.find({ isDeleted: false });
    res.render('addProduct', { title: 'Add Product', categories });
  } catch (error) {
    next(error);
  }
});

/* API: Thêm sản phẩm mới */
router.post('/', async function (req, res, next) {
  try {
    let body = req.body;
    let newProduct = new productModel({
      name: body.name,
      price: body.price,
      quantity: body.quantity,
      description: body.description,
      urlImg: body.urlImg,
      category: body.category,
      slug: slug(body.name, { lower: true }),
    });
    await newProduct.save();
    res.redirect('/products/view'); // Chuyển hướng về danh sách sản phẩm
  } catch (error) {
    next(error);
  }
});

/* Giao diện: Hiển thị form sửa sản phẩm */
router.get('/edit/:id', async function (req, res, next) {
  try {
    let product = await productModel.findById(req.params.id).populate('category');
    let categories = await categoryModel.find({ isDeleted: false });
    if (!product) {
      return res.status(404).send('Product not found');
    }
    res.render('editProduct', { title: 'Edit Product', product, categories });
  } catch (error) {
    next(error);
  }
});

/* API: Sửa sản phẩm */
router.post('/edit/:id', async function (req, res, next) {
  try {
    let body = req.body;
    let updatedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      {
        name: body.name,
        price: body.price,
        quantity: body.quantity,
        description: body.description,
        urlImg: body.urlImg,
        category: body.category,
        slug: slug(body.name, { lower: true }),
      },
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).send('Product not found');
    }
    res.redirect('/products/view');
  } catch (error) {
    next(error);
  }
});

/* API: Xóa sản phẩm */
router.get('/delete/:id', async function (req, res, next) {
  try {
    let deletedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!deletedProduct) {
      return res.status(404).send('Product not found');
    }
    res.redirect('/products/view');
  } catch (error) {
    next(error);
  }
});

module.exports = router;