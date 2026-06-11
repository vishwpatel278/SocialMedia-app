import axios from "axios";

export const api = axios.create({
    baseURL : "http://localhost:3000"
});

// export const getHeader = () => {
// 	const token = sessionStorage.getItem("token")
//     console.log(token);
// 	return {
// 		Authorization: `Bearer ${token}`,
// 		"Content-Type": "application/json"
// 	}
// }

export const SignUpApi = async (data) => {
    try{
        const response = await api.post("/user/signup",data);
        return response;
    }catch(e){
        console.log(e);
    }
}

export const LoginApi = async (data) => {
    try{
        const response = await api.post("/user/login",data,{
            withCredentials:true
        });
        return response;
    }catch(e){
        console.log(e);
    }
}

export const homepage = async () => {
    try{
        const response = await api.get("/home/home-page",{
            withCredentials:true
        });
        return response;
    }catch(e){
        console.log(e);
    }
}

export const profile = async () => {
    try{
        const response = await api.get("/profile",{
            withCredentials:true
        });
        return response;
    }catch(e){
        console.log(e);
    }
}

export const uploadProfile = async (formData) => {
    try{
        const response = await api.post(
            "/profile/upload-profile",
            formData,
            {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );

        return response;
    }catch(e){
        console.log(e);
    }
};

export const updateBio = async (bio) => {
    try{
        const response = await api.post(
            "/profile/update-bio",
            { bio },
            {
                withCredentials: true
            }
        );

        return response;
    }catch(e){
        console.log(e);
    }
};

// export const updateFollowers = async (follower_id) => {
//     try{
//         const response = await api.put(
//             `/profile/followers/${follower_id}`,
//             {},
//             {
//                 withCredentials: true
//             }
//         );

//         return response;
//     }catch(e){
//         console.log(e);
//     }
// };

// export const updateFollowing = async (following_id) => {
//     try{
//         const response = await api.put(
//             `/profile/following/${following_id}`,
//             {},
//             {
//                 withCredentials: true
//             }
//         );

//         return response;
//     }catch(e){
//         console.log(e);
//     }
// };

export const getFollowing = async () => {
    try{
        const response = await api.get(
            "/profile/following",
            {
                withCredentials: true
            }
        );

        return response;
    }catch(e){
        console.log(e);
    }
};

export const getFollowers = async () => {
    try{
        const response = await api.get(
            "/profile/followers",
            {
                withCredentials: true
            }
        );

        return response;
    }catch(e){
        console.log(e);
    }
};

export const getProfileById = async (id) => {
    try{
        const response = await api.get(
            `/profile/profile/${id}`,
            {
                withCredentials: true
            }
        );

        return response;
    }catch(e){
        console.log(e);
    }
};

//post section 


export const uploadPost = async (formData) => {
    try{
        const response = await api.post(
            "/post/upload-post",
            formData,
            {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );

        return response;

    }catch(e){
        console.log(e);
    }
};

export const getPosts = async () => {
    try{
        const response = await api.get(
            "/post/get-posts",
            {
                withCredentials: true
            }
        );

        return response;

    }catch(e){
        console.log(e);
    }
};

export const getPostsById = async (id) => {
    try{
        const response = await api.get(
            `/post/posts/${id}`,
            {
                withCredentials: true
            }
        );

        return response;

    }catch(e){
        console.log(e);
    }
};

export const getComments = async (postid) => {
    try{
        const response = await api.get(
            `/post/get-comments/${postid}`,
            {
                withCredentials: true
            }
        );

        return response;

    }catch(e){
        console.log(e);
    }
};

export const getProfile = async (username) => {

    try {

        const response = await api.get(
            `/search?username=${username}`,
            {
                withCredentials: true
            }
        );

        return response;

    } catch (e) {

        console.log(e);
    }
};

export const likePost = async (postid) => {

    try {

        const response = await api.put(
            `/post/like/${postid}`,
            {},
            {
                withCredentials: true
            }
        );

        return response;

    } catch (e) {

        console.log(e);
    }
};

export const getReels = async (skip = 0) => {

    try {

        const response = await api.get(
            `/post/reels?skip=${skip}`,
            {
                withCredentials: true
            }
        );

        return response;

    } catch (e) {

        console.log(e);
    }
};

export const addComment = async (postid, text) => {

    try {

        const response = await api.post(
            `/post/comments/${postid}`,
            {
                text
            },
            {
                withCredentials: true
            }
        );

        return response;

    } catch (e) {

        console.log(e);
    }
};

export const getLikes = async (postid) => {

    try {

        const response = await api.get(
            `/post/likes/${postid}`,
            {
                withCredentials: true
            }
        );

        return response;

    } catch (e) {

        console.log(e);
    }
};

export const isLogin = async () => {
    try {

        const response = await api.get(
            "/user/isLogin",
            {
                withCredentials: true
            }
        );

        return response.data;

    } catch (e) {
        console.log(e);
        return false;
    }
};

export const getPrivateStatus = async () => {
    try {

        const response = await api.get(
            "/user/private",
            {
                withCredentials: true
            }
        );

        return response;

    } catch (e) {
        console.log(e);
    }
};

export const updatePrivateStatus = async (isPrivate) => {
    try {

        const response = await api.post(
            "/user/private",
            { isPrivate },
            {
                withCredentials: true
            }
        );

        return response;

    } catch (e) {
        console.log(e);
    }
};

export const resetPassword = async (
    emailOrUsername,
    password
) => {
    try {

        const response = await api.post(
            `/user/reset-pass/${emailOrUsername}`,
            {
                password
            },
            {
                withCredentials: true
            }
        );

        return response;

    } catch (e) {
        console.log(e);
        throw e;
    }
};

// Follow Public Account
export const followUser = async (userid) => {
  try {
    const response = await api.put(
      `/profile/following/${userid}`,
      {},
      {
        withCredentials: true,
      }
    );

    return response;
  } catch (e) {
    console.log(e);
  }
};

// Unfollow Public Account
export const unfollowUser = async (userid) => {
  try {
    const response = await api.delete(
      `/profile/following/${userid}`,
      {
        withCredentials: true,
      }
    );

    return response;
  } catch (e) {
    console.log(e);
  }
};

// Send Follow Request (Private Account)
export const sendFollowRequest = async (userid) => {
  try {
    const response = await api.put(
      `/profile/following/request/${userid}`,
      {},
      {
        withCredentials: true,
      }
    );

    return response;
  } catch (e) {
    console.log(e);
  }
};

// Cancel Follow Request
export const cancelFollowRequest = async (userid) => {
  try {
    const response = await api.delete(
      `/profile/following/request/${userid}`,
      {
        withCredentials: true,
      }
    );

    return response;
  } catch (e) {
    console.log(e);
  }
};

// Check Account Privacy
export const getAccountPrivacy = async (profileid) => {
  try {
    const response = await api.get(
      `/search/account/${profileid}`,
      {
        withCredentials: true,
      }
    );

    return response;
  } catch (e) {
    console.log(e);
  }
};

export const removeFollower = async (userid) => {
  try {
    const response = await api.delete(
      `/profile/followers/${userid}`,
      {
        withCredentials: true,
      }
    );

    return response;
  } catch (e) {
    console.log(e);
  }
};

export const getFollowRequests = async () => {
  try {
    const response = await api.get(
      "/profile/requests",
      {
        withCredentials: true,
      }
    );

    return response;
  } catch (e) {
    console.log(e);
  }
};

export const updateRequest = async (userid, flag) => {
  try {

    const response = await api.post(
      `/profile/request/${userid}`,
      {
        flag,
      },
      {
        withCredentials: true,
      }
    );

    return response;

  } catch (e) {
    console.log(e);
  }
};

export const deletePost = async (postid) => {

    try {

        const response = await api.delete(
            `/post/${postid}`,
            {
                withCredentials: true
            }
        );

        return response;

    } catch (e) {

        console.log(e);

        throw e;
    }
};

export const verifyOTP = async (
  email,
  otp
) => {

  try {

    const response = await api.post(
      "/user/verify-otp",
      {
        email,
        otp,
      },
      {
        withCredentials: true,
      }
    );

    return response;

  } catch (e) {

    console.log(e);

    throw e;
  }
};

export const resendOTP = async (
  email
) => {

  try {

    const response = await api.post(
      "/user/resend-otp",
      {
        email,
      },
      {
        withCredentials: true,
      }
    );

    return response;

  } catch (e) {

    console.log(e);

    throw e;
  }
};

export const logoutUser = async () => {

    try {

        const response = await api.post(
            "/user/logout",
            {},
            {
                withCredentials: true,
            }
        );

        return response;

    } catch (e) {

        console.log(e);

        throw e;
    }
};

export const deleteComment = async (
    postid,
    username,
    commentid
) => {

    try {

        const response = await api.delete(
            `/post/comments/${postid}`,
            {
                data: {
                    username,
                    id: commentid
                },
                withCredentials: true
            }
        );

        return response;

    } catch (e) {

        console.log(e);
        throw e;

    }

};

export const getUserId = async () => {

    try {

        const response = await api.get(
            "/user/userid",
            {
                withCredentials: true
            }
        );

        return response.data;

    } catch (e) {

        console.log(e);
        throw e;

    }

};