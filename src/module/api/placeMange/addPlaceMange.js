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
  const selectPlaceIngoSql = `select place_id from init_place_setting WHERE place_id  = ?`;
  const addPlaceSql =
    "INSERT INTO init_place_setting ( place_id ,  place_name ,  place_label ,  place_introduction ,  place_early_open_time ) VALUES (?, ?, ?, ?, ?)";

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
    const selectRes = await conn.query(selectPlaceIngoSql, [req.body.place_id]);
    if (selectRes.length > 0) {
      res.send({
        error: { data: {}, msg: "已存在房间id" },
      });
      return;
    }
    const placeListRes = await conn.query(addPlaceSql, [
      req.body.place_id,
      req.body.place_name,
      req.body.place_label,
      req.body.place_introduction,
      req.body.place_early_open_time,
    ]);
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
