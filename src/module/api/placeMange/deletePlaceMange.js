const dbPool = require("../../../database/dbPool.js");
const judge = require("../../help/requireJudge.js");
module.exports = selectTimeFindPlace = async function (req, res, next) {
  let conn;
  if (!judge(req.body)) {
    // console.log(res);
    res.send({
      error: { data: {}, msg: "错误，填写不能为空" },
    });
    return;
  }
  const deletePlace = `DELETE FROM init_place_setting  WHERE  place_id  = ?`;

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
    try {
      const placeListRes = await conn.query(deletePlace, [req.body.place_id]);
      res.send({
        data: {},
        msg: "success",
      });
    } catch (error) {
      res.send({
        error: {
          data: {},
          msg: "删除失败",
        },
      });
    }
  } catch (error) {
    console.log(req.session.user, ":", error);
    res.send({
      error: { data: {}, msg: "错误,无法更新该数据" },
    });
  } finally {
    if (conn) conn.end();
  }
};
