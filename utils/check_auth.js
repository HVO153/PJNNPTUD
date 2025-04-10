//menu dong
//slug

let jwt = require('jsonwebtoken')
let constants = require('../utils/constants')
let userController = require('../controllers/users');
const e = require('express');
module.exports = {
    check_authentication: async function (req, res, next) {
        let token;
        if (!req.headers || !req.headers.authorization) {
            if (req.signedCookies.token) {
                token = req.signedCookies.token
            }
        } else {
            let authorization = req.headers.authorization;
            if (authorization.startsWith("Bearer")) {
                token = authorization.split(" ")[1];
            }
        }
        if (!token) {
            next(new Error("ban chua dang nhap"))
        } else {
            let result = jwt.verify(token, constants.SECRET_KEY);
            if (result.expire > Date.now()) {
                let user = await userController.GetUserByID(result.id);
                req.user = user;
                next();
            } else {
                next(new Error("ban chua dang nhap"))
            }
        }

    },
    check_authorization: function (roles = []) {
        return function (req, res, next) {
          try {
            let roleName = req.user?.role?.name || req.user?.role;
            if (!roleName || !roles.includes(roleName)) {
              return next(new Error(`Bạn không có quyền. Quyền hiện tại: ${roleName}`));
            }
            next();
          } catch (error) {
            next(new Error("Xác thực quyền thất bại"));
          }
        };
      }
      
}