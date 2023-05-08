const express = require("express");
const login = require("../module/api/mange/login.js");
const mangeInfo = require("../module/api/mange/mangeInfo.js");
const updateMangeInfo = require("../module/api/mange/updateMangeInfo.js");

//数据屏接口
const hotPlace = require("../module/api/dataView/getHotPlace.js");
const userUsedTimeSort = require("../module/api/dataView/getUserUsedTimeOrderSort.js");
const monthAllOrder = require("../module/api/dataView/getMonthAllOrder.js");
const getUserAvgUsedTime = require("../module/api/dataView/getUserAvgUsedTime.js");
const getRoleOrderTimeSort = require("../module/api/dataView/getRoleOrderTimeSort.js");
//地点管理接口
const getPlaceInitMange = require("../module/api/placeMange/getPlaceInitMange.js");
const updatePlaceMange = require("../module/api/placeMange/updatePlaceMange.js");
const addPlaceMange = require("../module/api/placeMange/addPlaceMange.js");
const deletePlaceMange = require("../module/api/placeMange/deletePlaceMange.js");
//订单管理接口
const getOrderMange = require("../module/api/OrderMange/getOrderMange.js");
const updateOrderMange = require("../module/api/OrderMange/updateOrderMange.js");
const deleteOrderMange = require("../module/api/OrderMange/deleteOrderMange.js");
//审批管理接口
const getNeedAllowOrderMange = require("../module/api/OrderMange/getNeedAllowOrderMange.js");
const updateAllowOrderStateMange = require("../module/api/OrderMange/updateAllowOrderStateMange.js");
const oneButtonAllowAllOrderMange = require("../module/api/OrderMange/oneButtonAllowAllOrderMange.js");


//权限管理接口
const getRoleMange = require("../module/api/RoleMange/getRoleMange.js");
const updateRoleMange = require("../module/api/RoleMange/updateRoleMange.js");
const addRoleMange = require("../module/api/RoleMange/addRoleMange.js");
const deleteRoleMange = require("../module/api/RoleMange/deleteRoleMange.js");

//用户管理接口
const getUserMange = require("../module/api/UserMange/getUserMange.js");
const updateUserMange = require("../module/api/UserMange/updateUserMange.js");
const addUserMange = require("../module/api/UserMange/addUserMange.js");
const deleteUserMange = require("../module/api/UserMange/deleteUserMange.js");

//设置管理接口
const getSettingMange2 = require("../module/api/settingMange/getSettingMange2.js");
const updateSettingMange = require("../module/api/settingMange/updateSettingMange.js");

const router = express.Router();

/* GET users listing. */
router.post("/login", login);
router.get("/getMangeInfo", mangeInfo);
router.post("/updateMangeInfo", updateMangeInfo);

//数据屏接口
router.get("/getHotPlace", hotPlace);
router.get("/getUserUsedTimeSort", userUsedTimeSort);
router.get("/getMonthAllOrder", monthAllOrder);
router.get("/getUserAvgUsedTime", getUserAvgUsedTime);
router.get("/getRoleOrderTimeSort", getRoleOrderTimeSort);
//地点管理接口
router.post("/getPlaceInitMange", getPlaceInitMange);
router.post("/updatePlaceMange", updatePlaceMange);
router.post("/addPlaceMange", addPlaceMange);
router.post("/deletePlaceMange", deletePlaceMange);
//订单管理接口
router.post("/getOrderMange", getOrderMange);
router.post("/updateOrderMange", updateOrderMange);
router.post("/deleteOrderMange", deleteOrderMange);
//审批管理接口
router.post("/getNeedAllowOrderMange", getNeedAllowOrderMange);
router.post("/updateAllowOrderStateMange", updateAllowOrderStateMange);
router.post("/oneButtonAllowAllOrderMange", oneButtonAllowAllOrderMange);

//权限管理接口
router.post("/getRoleMange", getRoleMange);
router.post("/updateRoleMange", updateRoleMange);
router.post("/deleteRoleMange", deleteRoleMange);
router.post("/addRoleMange", addRoleMange);
//用户管理接口
router.post("/getUserMange", getUserMange);
router.post("/updateUserMange", updateUserMange);
router.post("/addUserMange", addUserMange);
router.post("/deleteUserMange", deleteUserMange);

//设置管理接口
router.get("/getSettingMange2", getSettingMange2);
router.post("/updateSettingMange", updateSettingMange);

module.exports = router;
