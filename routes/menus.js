var express = require('express');
var router = express.Router();
var menuSchema = require('../schemas/menu');
let slug = require('slugify');

/* GET home page. */
router.get('/', async function (req, res, next) {
  let all = await menuSchema.find({ isDeleted: false });
  let parents = [];
  for (const menu of all) {
    if (!menu.parent) {
      let childrenQ = await menuSchema.find({
        parent: menu._id,
        isDeleted: false
      });
      let children = childrenQ.map(c => ({
        text: c.text,
        URL: c.URL
      }));
      parents.push({
        text: menu.text,
        URL: menu.URL,
        children: children
      });
    }
  }
  res.send(parents);
});

router.post('/', async function (req, res, next) {
  let itemMenu = {
    text: req.body.text,
    URL: `/${slug(req.body.text, { lower: true })}`,
  };
  if (req.body.parent) {
    let parentItem = await menuSchema.findOne({
      text: req.body.parent
    });
    itemMenu.parent = parentItem._id;
  }
  let newMenu = new menuSchema(itemMenu);
  await newMenu.save();
  res.send(newMenu);
});

// Giao diện chính danh sách menu
router.get('/view-page', async (req, res, next) => {
  let allMenus = await menuSchema.find({ isDeleted: false });
  let parents = [];

  for (const menu of allMenus) {
    if (!menu.parent) {
      let childrenQ = await menuSchema.find({ parent: menu._id, isDeleted: false });
      let children = childrenQ.map(c => ({
        text: c.text,
        URL: c.URL
      }));

      parents.push({
        _id: menu._id,
        text: menu.text,
        URL: menu.URL,
        children: children
      });
    }
  }

  res.render('menusView', { title: 'Menu ', menus: parents });
});

/* API: Xóa menu (soft delete) */
router.delete('/:id', async function (req, res, next) {
  try {
    let menuId = req.params.id;
    let deletedMenu = await menuSchema.findByIdAndUpdate(
      menuId,
      { isDeleted: true },
      { new: true }
    );
    if (!deletedMenu) {
      return res.status(404).send({ success: false, message: 'Menu not found' });
    }
    res.status(200).send({ success: true, data: deletedMenu });
  } catch (error) {
    next(error);
  }
});

module.exports = router;