//fix postnominal
(async function () {
  try {
    const items = await pool.query('SELECT *  FROM `t_doctor` WHERE `postnominal` like "%MD%" and `$postnominal_ids` not like "%195%"')
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.postnominal) {
        item.postnominal = item.postnominal.replace(/\s/g, '');
        item.postnominal = JSON.parse(item.postnominal)
        item.$postnominal_ids = JSON.parse(item.$postnominal_ids)
        const index = item.postnominal.indexOf('MD​');
        item.postnominal[index] = "MD"
        item.$postnominal_ids[index] = 195
        await pool.query(`update t_doctor set postnominal=?, $postnominal_ids=? where id=?`, [JSON.stringify(item.postnominal), JSON.stringify(item.$postnominal_ids), item.id])
      }
    }
    console.log('complete');
  } catch (error) {
    console.log(error);
  }
});