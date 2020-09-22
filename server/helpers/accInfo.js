const Account=require('../models/account')


const findPersonalAcc=async(email)=>{
    
    
    const followers=user.followers
    const followersCount=followers.length
    const following=user.following
    const followingCount=following.length
    const posts=user.posts
    const postsCount=posts.length
    const savedPosts=user.savedPosts
    const savedPostsCount=savedPosts.length
    const profileImage=user.profileImage

}

const findPersonalAcc=async(email)=>{
    
    const user=await Account.findUserAccountbyEmail(email)
    const followers=user.followers
    const followersCount=followers.length
    const following=user.following
    const followingCount=following.length
    const posts=user.posts
    const postsCount=posts.length
    const savedPosts=user.savedPosts
    const savedPostsCount=savedPosts.length
    const profileImage=user.profileImage

}