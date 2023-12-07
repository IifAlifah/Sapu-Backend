import Users from "../models/UserModel.js";

export const adminOnly = async (req, res, next) =>{
    if(!req.session.userId){
         return res.status(401).json({msg: "Mohon login ke akun Anda"});
    }
    const user = await Users.findOne({
        where: {
            uuid: req.session.userId
        }
    });
    if(!user) return res.status(404).json({msg: "User tdak ditemukan"});
    if(user.role !== "admin") return res.status(403).json({msg: "akses terlarang"}); 
    next();
}