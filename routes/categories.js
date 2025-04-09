var express = require('express');
var router = express.Router();
let categoryModel = require('../schemas/category');
let { CreateErrorRes, CreateSuccessRes } = require('../utils/responseHandler');
let slug = require('slugify');

/* API: Lấy danh sách danh mục */
router.get('/', async function (req, res, next) {
  try {
    let categories = await categoryModel.find({ isDeleted: false });
    CreateSuccessRes(res, categories, 200);
  } catch (error) {
    next(error);
  }
});

/* Giao diện: Hiển thị danh sách danh mục */
router.get('/view', async function (req, res, next) {
  try {
    let categories = await categoryModel.find({ isDeleted: false });
    res.render('categories', { title: 'Category List', categories });
  } catch (error) {
    next(error);
  }
});

/* Giao diện: Hiển thị form thêm danh mục */
router.get('/add', function (req, res, next) {
  res.render('addCategory', { title: 'Add Category' });
});

/* API: Thêm danh mục mới */
router.post('/', async function (req, res, next) {
  try {
    let body = req.body;
    let newCategory = new categoryModel({
      name: body.name,
      description: body.description,
      slug: slug(body.name, { lower: true }),
    });
    await newCategory.save();
    res.redirect('/categories/view'); // Chuyển hướng về danh sách danh mục
  } catch (error) {
    next(error);
  }
});

/* Giao diện: Hiển thị form sửa danh mục */
router.get('/edit/:id', async function (req, res, next) {
  try {
    let category = await categoryModel.findById(req.params.id);
    if (!category) {
      return res.status(404).send('Category not found');
    }
    res.render('editCategory', { title: 'Edit Category', category });
  } catch (error) {
    next(error);
  }
});

/* API: Sửa danh mục */
router.post('/edit/:id', async function (req, res, next) {
  try {
    let body = req.body;
    let updatedCategory = await categoryModel.findByIdAndUpdate(
      req.params.id,
      {
        name: body.name,
        description: body.description,
        slug: slug(body.name, { lower: true }),
      },
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).send('Category not found');
    }
    res.redirect('/categories/view');
  } catch (error) {
    next(error);
  }
});

/* API: Xóa danh mục */
router.get('/delete/:id', async function (req, res, next) {
  try {
    let deletedCategory = await categoryModel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!deletedCategory) {
      return res.status(404).send('Category not found');
    }
    res.redirect('/categories/view');
  } catch (error) {
    next(error);
  }
});

module.exports = router;