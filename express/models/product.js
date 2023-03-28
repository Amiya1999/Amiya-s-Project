const db=require('../util/database');

const cart=require('./cart');

module.exports = class Product {
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    return db.execute(
      'INSERT INTO products (title,price,imageUrl,description) VALUES[?,?,?,?]',
      [this.title,this.price,this.imageUrl,this.description]
    );
}
  static deleteById(id){

  }

  static fetchAll() {
    db.execute('SELECT * FROM products');    
  }
  static findByID(id){
  return db.execute('SELECT * FROM products WHERE products.id=?',[id]);
  }
};
