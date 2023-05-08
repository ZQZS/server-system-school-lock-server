const dbPool = require("../../../database/dbPool.js");
module.exports = selectTimeFindPlace = async function (req, res, next) {
  let conn;

  const getMonthAllOrderSql = `SELECT COUNT(*) as number FROM order_user_apply WHERE order_time_start >? AND order_time_end <? `;

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
    const starTimeAndEndTimeArray = [];
    for (let i = 0; i < 6; i++) {
      const startTemp = new Date(d.getFullYear(), d.getMonth() - i, 1, 0, 0);
      const endTemp = new Date(d.getFullYear(), d.getMonth() - i + 1, 0, 0, 0);
      let start = startTemp.getTime().toString(),
        end = endTemp.getTime().toString();
      try {
        const [monthAllOrderNumberRes] = await conn.query(getMonthAllOrderSql, [start,end]);
        starTimeAndEndTimeArray.push({
          data: `${startTemp.getFullYear()}-${startTemp.getMonth() + 1}`,
          num: parseInt(monthAllOrderNumberRes.number),
        });
      } catch (error) {
        console.log(req.session.user, ":", error);
      }
    }
    res.send({
      data: starTimeAndEndTimeArray,
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
