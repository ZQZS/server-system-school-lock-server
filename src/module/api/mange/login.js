const dbPool = require("../../../database/dbPool.js");
const judge = require("../../help/requireJudge.js");
const tool = require("../../help/tool.js");
module.exports = login = async function (req, res, next) {
  if (!judge(req.body)) {
    // console.log(res);
    res.send({
      loginInfo: { data: {}, msg: "账号或密码错误" },
    });
    return;
  }
  let user_no = req.body.userName;
  /** 查询用户列表 */
  const selectUserPasswordAndRoleSql = `select * from (select * from user where user_no = ?) as a left join (select * from init_power_role_setting) as b on a.user_power = b.power`;
  /** session初始化或更新 */
  const sessionSql = `REPLACE INTO user_session (user_no, session, over_date) VALUE (?, ?, ?)`;
  /** 查询用户已使用时间 */
  const usedTimeSql = `select * from user_used_order_time where user_no = ? AND year_and_month = ?`;
  /** 初始化用户已使用时间 */
  const initUserTimeSql = `REPLACE INTO user_used_order_time (user_no, year_and_month,used_time) VALUE (?, ?, ?)`;
  /** session过期天数 */
  const over_date = 7;
  /** session长度 */
  const sessionLength = 32;
  let conn, userResult, userUsedTime;

  // function sleep() {
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       resolve();
  //     }, 3000);
  //   });
  // }
  // await sleep();
  try {
    conn = await dbPool.getConnection();
    [userResult] = await conn.query(selectUserPasswordAndRoleSql, [user_no]);
    console.log(userResult);
    if (
      userResult?.user_password === req.body.password &&
      userResult.power_list.split(",").includes("mange")
    ) {
      const session = tool.getNanoid(sessionLength);
      req.session.user = user_no; // 将用户信息存储到session中
      req.session.mangeSession = session;
      const timeOver = tool.daysAgo(over_date).getTime();
      /** session初始化或更新 */
      const sessionRes = await conn.query(sessionSql, [
        user_no,
        session,
        timeOver,
      ]);

      const nowYearMonth = tool.getNowYearMonth();
      /** 用户已使用时间查询或初始化 */
      const userTimeRes = await conn.query(usedTimeSql, [
        user_no,
        nowYearMonth,
      ]);
      if (userTimeRes.length === 0) {
        const iniTimeRes = await conn.query(initUserTimeSql, [
          user_no,
          nowYearMonth,
          0,
        ]);
        userUsedTime = 0;
      } else {
        userUsedTime = userTimeRes[0].used_time;
      }

      res.send({
        loginInfo: {
          data: {
            user_no: userResult.user_no,
            user_name: userResult.user_name,
            user_phone: userResult.user_phone,
            user_hour: userResult.hours - userUsedTime,
            user_power_list: userResult.power_list,
          },
          msg: "success",
        },
      });
      console.log(userResult, sessionRes, new Date());
    } else {
      res.send({
        loginInfo: { data: {}, msg: "账号或密码错误，或权限不足" },
      });
    }
    console.log(userResult);
  } catch (error) {
    console.log(error);
    res.send({
      loginInfo: { data: {}, msg: "账号或密码错误，或权限不足" },
    });
  } finally {
    if (conn) conn.end();
  
  }
};
