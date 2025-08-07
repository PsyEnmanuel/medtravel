(async function () {
  try {
    const items = await pool.query(`SELECT * FROM t_task`)

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      item.user = [{
        id: String(item.user_id),
        description: item.user_description
      }]

      await pool.query(`UPDATE t_task SET user=? WHERE id=?`, [JSON.stringify(item.user), item.id])

    }

    console.log('complete');
  } catch (error) {
    console.log(error);
  }
})