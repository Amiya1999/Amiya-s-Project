const Product = require('../models/product');
const Cart=require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.fetchAll().then(([rows,fieldData])=>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  })
  
  .catch(err=>console.log(err));
};

exports.getProduct=(req,res,next)=>{
  const prodId= req.params.productId;
  Product.findByID(prodId).then(([product])=>{
    res.render('shop/product-list', {
      prods: product[0],
      pageTitle: product.title,
      path: '/products'
    }
  );
  }).catch(err=>console.log(err));
  // res.redirect('/'); 
}

exports.getIndex = (req, res, next) => {
  Product.fetchAll().then(([rows,fieldData])=>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  }).catch(err=>console.log(err));


};
exports.getCart = (req, res, next) => {
  res.render('shop/cart', {
    path: '/cart',
    pageTitle: 'Your Cart'
  });
};

exports.postCart=(req,res,next)=>{
  const prodId=req.body.productId;
Product.findByID(prodId,(product)=>{
  Cart.addProduct(prodId,product.price); 
})
  res.redirect('/cart');
}
exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
