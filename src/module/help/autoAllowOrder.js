const dbPool = require("../../database/dbPool.js");
module.exports = autoAllowOrder = async function () {
  let conn;
  const selectOrderPage = `SELECT order_id FROM order_user_apply where order_time_start > ? AND order_state = 1`;
  const updateOrderSql = `UPDATE order_user_apply SET order_state = ?,order_last_updateing_time =? WHERE order_id = ?`;

  const d = new Date();

  try {
    conn = await dbPool.getConnection();
    const orderList = await conn.query(selectOrderPage, [d.getTime()]);
    const updateArray = [];
    for (let item in orderList) {
      updateArray.push([3, d.getTime(), orderList[item].order_id]);
    }
    const result = await conn.batch(updateOrderSql, updateArray);
    console.log("自动审批启动完成:",result);
  } catch (error) {
  } finally {
    if (conn) conn.end();
  }
};
