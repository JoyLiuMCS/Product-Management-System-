import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db.js';
import Product from './models/Product.js';
import User from './models/User.js';

const app = express();
const PORT = 5500;

dotenv.config();      // 加载 .env 文件
connectDB();          // 连接 MongoDB
// ✅ 手动添加 CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

app.post('/api/products', async (req, res) => {
    try {
      const { name, price, description, category, quantity, imageUrl } = req.body;
  
      const product = new Product({
        name,
        price,
        description,
        category,
        quantity: quantity ?? 50, // 👈 如果没传就设为 50
        imageUrl
      });
      
  
      const savedProduct = await product.save();
  
      console.log('✅ 已保存产品：', savedProduct);
  
      res.status(201).json(savedProduct);
    } catch (err) {
      console.error('❌ 保存失败：', err.message);
      res.status(500).json({ error: '创建产品失败' });
    }
  });
  

  app.get('/api/products', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;    // 当前页码
      const limit = parseInt(req.query.limit) || 10; // 每页产品数量
      const sortOrder = req.query.sort || 'asc';

      let sortObj = { createdAt: -1 }; // ✅ 默认
      if (sortOrder === 'asc') sortObj = { price: 1 };
      else if (sortOrder === 'desc') sortObj = { price: -1 };
      else if (sortOrder === 'latest') sortObj = { createdAt: -1 };
      
  
      const skip = (page - 1) * limit;
  
      const total = await Product.countDocuments(); // 产品总数
      const products = await Product.find().sort(sortObj).skip(skip).limit(limit);
  
      res.json({
        products,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      });
    } catch (err) {
      console.error('❌ 获取产品失败：', err.message);
      res.status(500).json({ error: '获取产品失败' });
    }
  });
  

  // 获取单个产品
app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: '找不到该产品' });
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: '获取产品失败' });
    }
  });
  
  // 更新产品
  app.put('/api/products/:id', async (req, res) => {
    try {
      const { name, price, description, category, quantity, imageUrl } = req.body;
  
      const updated = await Product.findByIdAndUpdate(
        req.params.id,
        { name, price, description, category, quantity, imageUrl },
        { new: true }
      );
  
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: '更新产品失败' });
    }
  });
  
  
  app.delete('/api/products/:id', async (req, res) => {
    try {
      const deleted = await Product.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: '产品未找到' });
      }
      res.json({ message: '产品已删除' });
    } catch (err) {
      console.error('❌ 删除失败：', err.message);
      res.status(500).json({ error: '删除失败' });
    }
  });

  // 注册接口
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: 'Email already in use' });

    const newUser = new User({ email, password });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ error: 'Error creating user', details: err.message });
  }
});

// 登录接口
app.post('/api/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password)
      return res.status(401).json({ error: 'Invalid email or password' });

    res.json({ message: 'Sign-in successful', user });
  } catch (err) {
    res.status(500).json({ error: 'Error during sign-in', details: err.message });
  }
});
  

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});

