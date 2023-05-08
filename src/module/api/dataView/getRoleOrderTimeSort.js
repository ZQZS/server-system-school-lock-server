const dbPool = require("../../../database/dbPool.js");
module.exports = selectTimeFindPlace = async function (req, res, next) {
  let conn;

  const getRoleOrderTimeSortSql = `Select role,SUM(used_time) AS all_used_time from (select * from (select * from user) as a left join (select * from init_power_role_setting) as b on a.user_power = b.power) as c right join (select * from user_used_order_time where year_and_month = ?) as d on c.user_no = d.user_no GROUP BY role order by used_time desc`;

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
        console.log(sessionRes[0].power_list.split(",").includes("mange"));
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

    const userListRes = await conn.query(getRoleOrderTimeSortSql, [
      d.getFullYear() + "-" + (d.getMonth() + 1),
    ]);
    res.send({
      data: userListRes,
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
