const express = require("express");
const mongoose = require("mongoose");
const router = new express.Router();
const auth = require("../auth/auth");
const Account = require("../models/account");
const Request = require("../models/request");
const Post = require("../models/post");
const e = require("express");

router.get("/", auth, async (req, res) => {
  const email = req.session.email;
  try {
    const acc = await Account.findUserAccountbyEmail(email);
    const ownerFollowing = acc.following;
    let allData = [];
    let userData = [];
    let followingData = [];
    await acc.populate("allPostsOfThisAccount").execPopulate();
    let p = acc.allPostsOfThisAccount;
    if (p.length > 0) {
      let userObj = {
        userID: acc._id,
        username: acc.username,
        profileImage: acc.profileImage,
        post: p,
      };
      userData.push(userObj);
    } else {
      userData = [];
    }

    if (ownerFollowing.length > 0) {
      ownerFollowing.forEach(async (element, i) => {
        let followingAcc = await Account.findById({
          _id: mongoose.Types.ObjectId(element.accID),
        });
        await followingAcc.populate("allPostsOfThisAccount").execPopulate();
        let p2 = followingAcc.allPostsOfThisAccount;
        let followingObj = {
          userID: followingAcc._id,
          username: followingAcc.username,
          profileImage: followingAcc.profileImage,
          post: p2,
        };
        followingData.push(followingObj);
        if (i == ownerFollowing.length - 1) {
          allData = [...userData, ...followingData];
          console.log(allData);
          return res.render("dashboard/dashboard", {
            title: "home page",
            data: allData,
          });
        }
      });
    } else {
      followingData = [];
      allData = [...userData, ...followingData];
      console.log(allData);
      return res.render("dashboard/dashboard", {
        title: "home page",
        data: allData,
      });
    }
  } catch (e) {
    console.log(e.message);
    res.redirect("/");
  }
});

router.get("/explore", auth, async (req, res) => {
  try {
    const acc = await Account.find({ privacy: "public" });
    let publicData=[]
    if (acc.length>0) {
      acc.forEach(async (element, i) => {
        await element.populate("allPostsOfThisAccount").execPopulate();
        let p=element.allPostsOfThisAccount
        if(p.length<=0){}
        else{
            let obj = {
                userID: element._id,
                username: element.username,
                profileImage: element.profileImage,
                post: p,
              };
            publicData.push(obj)
        }
        
        if(i == acc.length - 1){
            console.log(publicData)
            res.end('done')
        }
      });
    } else {
      console.log("no public account found");
      publicData=[]
      console.log(publicData)
      res.send('done')
    }
  } catch (e) {
    console.log(e.message);
    res.redirect("/");
  }
});

router.get("/searchAccount/:username", auth, async (req, res) => {
  const ownerEmail = req.session.email;
  const username = req.params.username;
  try {
    console.log(username);
    var flag = false;
    const userAcc = await Account.findUserAccountbyUsername(username);
    const ownerAcc = await Account.findUserAccountbyEmail(ownerEmail);
    const ownerFollowing = ownerAcc.following;
    let posts = [];
    const followers = userAcc.followers;
    const followersCount = followers.length;
    const following = userAcc.following;
    const followingCount = following.length;
    const postArr = userAcc.posts;
    const postsCount = postArr.length;
    const stories = userAcc.stories;

    if (postArr.length > 0) {
      console.log("More then One Post");
      await postArr.forEach(async (element, i) => {
        let postID = element.postID;
        let p = await Post.findById({ _id: mongoose.Types.ObjectId(postID) });
        posts.push(p);

        if (i == postArr.length - 1) {
          if (userAcc.privacy == "public") {
            console.log("public Account");
            return res.render("profile/userAccount", {
              public: "true",
              ID: userAcc._id,
              username: userAcc.username,
              profileImage: userAcc.profileImage,
              //followers:followers,
              followersCount: followersCount,
              //following:following,
              followingCount: followingCount,
              post: posts,
              postsCount: postsCount,
              stories: stories,
            });
          } else {
            if (ownerFollowing.length > 0) {
              let temp = ownerFollowing;
              let flag = false;
              temp.forEach(async (element, i) => {
                if (element.accID == userAcc._id) {
                  flag = true;
                }
                if (i == temp.length - 1) {
                  if (flag == false) {
                    console.log("private Account not following");
                    return res.render("profile/userAccount", {
                      private: "true",
                      ID: userAcc._id,
                      username: userAcc.username,
                      profileImage: userAcc.profileImage,
                      //followers:followers,
                      followersCount: followersCount,
                      //following:following,
                      followingCount: followingCount,
                      post: posts,
                      postsCount: postsCount,
                      stories: stories,
                    });
                  } else {
                    console.log("private Account but following");
                    return res.render("profile/userAccount", {
                      public: "true",
                      ID: userAcc._id,
                      username: userAcc.username,
                      profileImage: userAcc.profileImage,
                      followers: followers,
                      followersCount: followersCount,
                      following: following,
                      followingCount: followingCount,
                      post: posts,
                      postsCount: postsCount,
                      stories: stories,
                    });
                  }
                }
              });
            } else {
              console.log("private Account not following");
              return res.render("profile/userAccount", {
                private: "true",
                ID: userAcc._id,
                username: userAcc.username,
                profileImage: userAcc.profileImage,
                //followers:followers,
                followersCount: followersCount,
                //following:following,
                followingCount: followingCount,
                post: posts,
                postsCount: postsCount,
                stories: stories,
              });
            }
          }
        }
      });
    } else {
      console.log("Zero posts");
      if (userAcc.privacy == "public") {
        console.log("public Account");
        return res.render("profile/userAccount", {
          private: "true",
          ID: userAcc._id,
          username: userAcc.username,
          profileImage: userAcc.profileImage,
          followersCount: followersCount,
          followingCount: followingCount,
          postsCount: postsCount,
          posts: posts,
        });
      } else {
        if (ownerFollowing.length > 0) {
          let temp = ownerFollowing;
          let flag = false;
          temp.forEach(async (element, i) => {
            if (element.accID == userAcc._id) {
              flag = true;
            }
            if (i == temp.length - 1) {
              if (flag == false) {
                console.log("private Account not following");
                return res.render("profile/userAccount", {
                  private: "true",
                  ID: userAcc._id,
                  username: userAcc.username,
                  profileImage: userAcc.profileImage,
                  followersCount: followersCount,
                  followingCount: followingCount,
                  postsCount: postsCount,
                  posts: posts,
                });
              } else {
                console.log("private Account  following");
                return res.render("profile/userAccount", {
                  private: "true",
                  ID: userAcc._id,
                  username: userAcc.username,
                  profileImage: userAcc.profileImage,
                  followersCount: followersCount,
                  followingCount: followingCount,
                  postsCount: postsCount,
                  posts: posts,
                });
              }
            }
          });
        } else {
          console.log("private Account not following");
          return res.render("profile/userAccount", {
            private: "true",
            ID: userAcc._id,
            username: userAcc.username,
            profileImage: userAcc.profileImage,
            followersCount: followersCount,
            followingCount: followingCount,
            postsCount: postsCount,
            posts: posts,
          });
        }
      }
    }
  } catch (e) {
    res.redirect("/searchAccount");
    console.log(e.message);
  }
});

router.get("/request", auth, async (req, res) => {
  const email = req.session.email;
  try {
    let acc = {};
    let accID;
    let allAcc = [];
    const userAcc = await Account.findUserAccountbyEmail(email);
    const requests = await Request.find({ requestedTo: userAcc._id });

    if (requests.length > 0) {
      requests.forEach(async (element, i) => {
        //console.log(element.requestedBy)
        accID = element.requestedBy;
        acc = await Account.findById({ _id: mongoose.Types.ObjectId(accID) });
        acc.requestID = element._id;
        allAcc.push(acc);

        if (i === requests.length - 1) {
          return res.render("info/request", {
            title: "Requests",
            acc: allAcc,
          });
        }
      });
    } else {
      return res.render("info/request", {
        title: "Requests",
      });
    }
  } catch (e) {
    console.log(e.message);
    res.redirect("/");
  }
});

router.get("/requestToFollow/:id", auth, async (req, res) => {
  const accID = req.params.id;
  const email = req.session.email;
  try {
    const userAcc = await Account.findUserAccountbyEmail(email);
    var request = new Request();
    request.requestedTo = accID;
    request.requestedBy = userAcc._id;
    await request.save();

    console.log("requested");
    res.redirect("/");
  } catch (e) {
    console.log(e.message);
    res.redirect("/");
  }
});

router.get("/acceptFollowRequest/:id", auth, async (req, res) => {
  const requestID = req.params.id;
  const email = req.session.email;
  try {
    const userAcc = await Account.findUserAccountbyEmail(email);
    const request = await Request.findById({
      _id: mongoose.Types.ObjectId(requestID),
    });
    var requestedByID = request.requestedBy;
    userAcc.followers = userAcc.followers.concat({ accID: requestedByID });
    await userAcc.save();
    var requestedByAcc = await Account.findById({
      _id: mongoose.Types.ObjectId(requestedByID),
    });
    requestedByAcc.following = requestedByAcc.following.concat({
      accID: userAcc._id,
    });
    await requestedByAcc.save();
    await Request.findByIdAndDelete({
      _id: mongoose.Types.ObjectId(requestID),
    });
    console.log("request accepted");
    res.redirect("/");
  } catch (e) {
    console.log(e.message);
    res.redirect("/");
  }
});

router.get("/deleteFollowRequest/:id", auth, async (req, res) => {
  const requestID = req.params.id;
  const email = req.session.email;
  try {
    const request = await Request.findByIdAndDelete({
      _id: mongoose.Types.ObjectId(requestID),
    });

    console.log("request Cancelled");
    res.redirect("/");
  } catch (e) {
    console.log(e.message);
    res.redirect("/");
  }
});

router.get("/logout", auth, (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/login");
  });
});

module.exports = router;
