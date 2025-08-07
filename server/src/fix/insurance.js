(async function () {
    try {
        const policies = await pool.query(`SELECT id, insured_id FROM t_policy WHERE insurance_id=35 AND c_status=4 group by insured_id`);
        const ids = policies.map(i => i.insured_id)
        // let count = 0;
        // for (let i = 0; i < ids.length; i++) {
        //   const id = ids[i];
        //   const [item] = await pool.query(`select * from t_insured where id =?`, [id])
        //   // console.log(id, item);
        //   if (item) {
        //     // console.log(item.policies);
        //     item.policies = JSON.parse(item.policies)
        //     for (let j = 0; j < item.policies.length; j++) {
        //       const policy = item.policies[j];
        //       if (policy.insurance_id == 35) {
        //         // console.log(1);
        //         ++count
        //       }
        //     }
        //   }
        // }

        const insureds = await pool.query(`SELECT id  FROM t_insured  WHERE 1 AND c_status = '4' AND high_profile = '0' AND JSON_SEARCH(policies, 'all', '35', NULL, '$[*].insurance_id') IS NOT NULL AND t_insured.account_id = 1  GROUP BY t_insured.code  ORDER BY code ASC`);

        const ids2 = insureds.map(i => i.id)


        const difference = ids.filter(num => !ids2.includes(num));

        // console.log(difference); // Output: [1]
        console.log(difference);
        for (let i = 0; i < difference.length; i++) {
            const diff = difference[i];
            const [item] = await pool.query(`select * from t_insured where id=?`, [diff])
            if (item) {
                if (item.policies) {
                    item.policies = JSON.parse(item.policies)
                    console.log(item.id, item.policies);
                } else {
                    console.log(item);
                }
            }
        }

    } catch (error) {
        console.log(error);
    }
});

(async function () {
    try {
        const items = await pool.query(`select * from t_policy_insured`)

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            const insured = await pool.query(`select * from insured where id=?`, [item.insured_id])
            console.log(insured);
            if (item.policies) {
                item.policies = JSON.parse(item.policies)
            } else {
                item.policies = []
            }
            // for (let j = 0; j < item.policies.length; j++) {
            //     const policy = item.policies[j];
            //     if (!policy.policy_id) {
            //         const [p] = await pool.query(`select * from t_policy where insured_id=?`, [item.id])
            //         console.log(item.id, p);
            //         if (p) {
            //             policy.policy_id = p.id
            //             policy.policy_number = p.policy_number
            //             policy.insured_code = p.insured_code
            //             policy.insurance_id = String(p.insurance_id)
            //             policy.insurance = p.insurance
            //             // await pool.query(`update t_insured set policies=? where id=?`, [JSON.stringify(item.policies), item.id])
            //         }
            //     } else if (policy.policy_id && policy.insurance_id === 'undefined') {
            //         const [p] = await pool.query(`select * from t_policy where id=?`, [policy.policy_id])
            //         policy.insurance_id = String(p.insurance_id)
            //         // await pool.query(`update t_insured set policies=? where id=?`, [JSON.stringify(item.policies), item.id])
            //     }
            // }

        }

        console.log('complete');
    } catch (error) {
        console.log(error);
    }
})();