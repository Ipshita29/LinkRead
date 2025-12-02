const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalPosts = await Post.countDocuments({
      author: req.user.id,
      isDraft: false
    });

    const posts = await Post.find({ author: req.user.id, isDraft: false });
    const totalUpvotes = posts.reduce((sum, post) => sum + (post.upvotes?.length || 0), 0);

    const publishedPosts = await Post.find({
      author: req.user.id,
      isDraft: false
    }).sort({ createdAt: -1 });

    let streak = 0;
    if (publishedPosts.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let currentDate = new Date(today);
      let foundGap = false;

      for (let i = 0; i < publishedPosts.length && !foundGap; i++) {
        const postDate = new Date(publishedPosts[i].createdAt);
        postDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((currentDate - postDate) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0 || daysDiff === 1) {
          if (daysDiff === 1) {
            streak++;
            currentDate = new Date(postDate);
          }
        } else {
          foundGap = true;
        }
      }

      const lastPostDate = new Date(publishedPosts[0].createdAt);
      lastPostDate.setHours(0, 0, 0, 0);
      if (lastPostDate.getTime() === today.getTime()) {
        streak++;
      }
    }

    res.json({
      ...user.toObject(),
      stats: {
        totalPosts,
        totalUpvotes,
        streak
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = req.body.username || user.username;
    user.profilePic = req.body.profilePic || user.profilePic;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;

    if (req.body.password) {

    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
      bio: updatedUser.bio,
      streak: updatedUser.streak
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const getUserComments = async (req, res) => {
  try {
    const comments = await Comment.find({ author: req.params.userId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const searchUsers = async (req, res) => {
  try {
    const query = req.query.q || "";

    const users = await User.find({
      username: { $regex: query, $options: "i" }
    }).select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getUserProfile,
  getMyProfile,
  updateUserProfile,
  getUserPosts,
  getUserComments,
  searchUsers
};