const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin/adminController");
const customerController = require("../controllers/admin/customerController");
const categoryController = require("../controllers/admin/categoryController");
// const brandController = require("../controllers/admin/brandController")
const productController = require("../controllers/admin/productController");
const {  adminAuth } = require("../middlewares/auth");
const multer = require("multer");
const storage = require("../helpers/multer");
const uploads = multer({ storage: storage });
// const uploads = multer({storage:storage})
//.............
const { upload } = require("../config/cloudinary");

router.get("/pageerror", adminController.pageError);
//LOGIN MANAGEMENT
router.get("/", adminController.loadLogin);
router.post("/adminlogin", adminController.adminlogin);
router.get("/dashboard", adminAuth, adminController.loadDashboard);
router.get("/adminlogout", adminController.adminLogout);

// CUSTOMER MANAGEMENT
router.get("/users", adminAuth, customerController.customerInfo);
router.get("/blockcustomer/:id", adminAuth, customerController.customerBlocked);
router.get(
  "/unblockcustomer/:id",
  adminAuth,
  customerController.customerUnblocked
);

//CATEGORY MANAGEMENT
router.get("/category", adminAuth, categoryController.categoryInfo);
router.post("/addCategory", adminAuth, categoryController.addCategory);
router.post(
  "/addCategoryOffer",
  adminAuth,
  categoryController.addCategoryOffer
);
router.post(
  "/removeCategoryOffer",
  adminAuth,
  categoryController.removeCategoryOffer
);
router.get("/listCategory", adminAuth, categoryController.getListCategory);
router.get("/unlistCategory", adminAuth, categoryController.getUnlistCategory);
router.get("/editCategory", adminAuth, categoryController.getEditCategory);
router.post("/editCategory/:id", adminAuth, categoryController.editCategory);

//PROODUCT MANAGEMENT
router.get("/addProducts", adminAuth, productController.getProductAddPage);
router.post(
  "/addProducts",
  adminAuth,
  uploads.any(),
  productController.addProducts
);
router.get('/products',adminAuth,productController.getallProducts)
router.post('/blockProduct',adminAuth,productController.blockProduct)
router.post('/unblockProduct',adminAuth,productController.unblockProduct)
router.get('/editProduct',adminAuth,productController.editProduct)
router.post('/ediProduct/:id',adminAuth,uploads.any(),productController.addEditProduct)

// ADD TO CART MANAGEMENT


module.exports = router;
