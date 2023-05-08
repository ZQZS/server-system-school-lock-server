const dbPool = require("../../../database/dbPool.js");
module.exports = selectTimeFindPlace = async function (req, res, next) {
  let conn;

  const updateOrderSql = `UPDATE order_user_apply SET  order_state = ?,order_reject_reason=?,order_rejecter=?,order_last_updateing_time =? WHERE order_id = ?`;

  const d = new Date();

  try {
    conn = await dbPool.getConnection();
    try {
      const sessionSql = `select d.user_no,power_list,over_date,session from (select user_no,power_list from (select * from user where user_no = ? LIMIT 1) as a left join (select * from init_power_role_setting) as b on a.user_power = b.power) as c RIGHT JOIN (SELECT * FROM user_session WHERE user_no = ? AND session = ? LIMIT 1) as d ON c.user_no = d.user_no`;
      const sessionRes = await conn.query(sessionSql, [
        req.session.user,
        req.session.user,
        req.session.mangeSession,
      ]);
      if (
        sessionRes.length === 0 ||
        sessionRes[0]?.over_date < d.getTime() ||
        !sessionRes[0].power_list.split(",").includes("mange")
      ) {
        res.send({
          loginInfo: { data: {}, msg: "账号已过期，请重新登录" },
        });
        return;
      }
    } catch (error) {
      console.log("sql:", error);
      res.send({
        loginInfo: { data: {}, msg: "账号已过期，请重新登录" },
      });
      return;
    }

    let aboutUserWhere = "",
      aboutRoleWhere = "",
      aboutOrderWhere = `where order_time_start >= ${d.getTime()} AND order_state = 1 `;

    for (let key in req.body) {
      if (req.body[key] == "" || req.body[key] == -1) {
        req.body[key] = null;
      }
      if (["role", "character"].includes(key)) {
        if (req.body[key] != "" && req.body[key] != -1 && req.body[key]) {
          if (key == "role")
            aboutRoleWhere += ` where ${key} = "${req.body[key]}"`;
          else
            aboutUserWhere += ` where user_power ${req.body[key]} ${req.body["power"]}`;
        }
      } else if (
        ["order_place_id", "order_time_start", "order_time_end"].includes(key)
      ) {
        if (req.body[key] != "" && req.body[key] != -1 && req.body[key]) {
          if (aboutOrderWhere.length == 0) {
            aboutOrderWhere += " where ";
          } else {
            aboutOrderWhere += " AND ";
          }
          if (key == "order_place_id")
            aboutOrderWhere += `${key} = "${req.body[key]}"`;
          else if (key == "order_time_start")
            aboutOrderWhere += `${key} >= ${
              req.body[key]
            } `;
          else if (key == "order_time_end")
            aboutOrderWhere += `${key} <= ${req.body[key]}`;
        }
      }
    }
    const getAllowOrderAllInfoSql = `Select order_id from (select * from (select * from user ${aboutUserWhere}) as a left join (select * from init_power_role_setting ${aboutRoleWhere}) as b on a.user_power = b.power) as c left join (select * from order_user_apply ${aboutOrderWhere}) as d on c.user_no = d.order_user_no`;
    console.log(getAllowOrderAllInfoSql);
    const orderList = await conn.query(getAllowOrderAllInfoSql);
    console.log(orderList);
    const updateArray = [];
    for (let item in orderList) {
      updateArray.push([
        req.body.order_state,
        req.body.order_reject_reason ?? "",
        req.body.order_state == 3 ? "" : req.body.order_rejecter ?? "",
        d.getTime(),
        orderList[item].order_id,
      ]);
    }
    console.log(updateArray);
    const result = await conn.batch(updateOrderSql, updateArray);
    res.send({
      data: {},
      msg: "success",
    });
  } catch (error) {
    console.log(req.session.user, ":", error);
    res.send({
      error: { data: {}, msg: "错误,无法更新该数据" },
    });
  } finally {
    if (conn) conn.end();
  }
};
