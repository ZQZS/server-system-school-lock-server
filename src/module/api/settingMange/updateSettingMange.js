const dbPool = require("../../../database/dbPool.js");
const autoAllowOrder = require("../../help/autoAllowOrder.js");
module.exports = selectTimeFindPlace = async function (req, res, next) {
  let conn;

  const updateRoleInfo = `UPDATE init_book_time_setting SET cells = ?, start_time= ?, cell_time = ?, early_open_time = ?, is_register_open = ?, examine = ? WHERE cells = ?`;
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
    const result = await conn.query(updateRoleInfo, [
      req.body.cells,
      req.body.start_time,
      req.body.cell_time,
      req.body.early_open_time,
      req.body.is_register_open,
      req.body.examine,
      req.body.change_id,
    ]);
    if (req.body.examine == 0) {
      autoAllowOrder();
    }
    res.send({
      data: {},
      msg: "success",
    });
  } catch (error) {
    console.log(req.session.user, ":", error);
    res.send({
      loginInfo: { data: {}, msg: "服务器错误" },
    });
  } finally {
    if (conn) conn.end();
  }
};
