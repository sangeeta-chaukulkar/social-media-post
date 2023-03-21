const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');
const authMiddleware = require('../middleware/auth');


const router = express.Router();

router.post('/signup', adminController.postUser);
router.post('/login', adminController.login);
router.get('/logout',authMiddleware.authenticate, adminController.userLogout);
router.get('/getUser',authMiddleware.authenticate,adminController.getUser);

router.post('/post', authMiddleware.authenticate,adminController.createPost);
router.get('/posts', authMiddleware.authenticate,adminController.getPosts);

router.put('/editPost/:postid', authMiddleware.authenticate,adminController.editPost);
router.delete('/deletePost/:postid', authMiddleware.authenticate, adminController.deletePost)


module.exports = router;
