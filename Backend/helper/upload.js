const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.API_KEY,
    api_secret : process.env.API_SECRET
})

// for public
const uploadfile = async (filepath) => {
    try{
        const result = await cloudinary.uploader.upload(filepath,{
            folder : 'posts',
            resource_type : 'auto'
        });
        return result;
    }catch(err){
        console.log(err.message);
    }
}

// for private
// const uploadfileForPrivate = async (filepath) => {
//     try{
//         const result = await cloudinary.uploader.upload(filepath,{
//             type : 'private',
//             folder : 'posts',
//             resource_type : 'auto'
//         });
//         return result;
//     }catch(err){
//         console.log(err.message);
//     }
// }

const deletePost = async (
  publicId,
  mediaType,
) => {

  const result =
    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: mediaType,
        // type: cloudinaryType,
        invalidate: true
      }
    );

  console.log(result);

  return result;
};


module.exports = {
    uploadfile,
    deletePost
}