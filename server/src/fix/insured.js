function padToEleven(num) {
  return num.toString().padStart(11, '0');
}

(async function () {
  try {
    const items = await pool.query(`select * from t_insured`)
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.relations) {
        item.relations = JSON.parse(item.relations);
        console.log(item.relations);
        for (let i = 0; i < item.relations.length; i++) {
          const relation = item.relations[i];
          const [cat] = await pool.query(`select * from t_category where id=?`, [relation.$relationship_id])
          if (cat) {
            relation.relationship = cat.description
          }
        }
        await pool.query(`update t_insured set relations=? where id=?`, [JSON.stringify(item.relations), item.id])

      }
    }
    console.log('complete');
  } catch (error) {
    console.log(error);
  }
});

(async function () {
  try {

    const columnsKeys = ["policy_number", "customer_description", "titular_description", "insured_type", "relationship", "insured_description", "insured_code", "ident_no", "sex", "birthdate", "age", "email", "insurance_plan", "insurance_plan_type", "frequency", "policy_type", "policy_branch", "deductible", "validity_date_start", "validity_date_end"];

    const excel = excelToJson({
      header: {
        rows: 1,
      },
      columnToKey: _utility.mapColumnsToLetters(columnsKeys),
      sourceFile: path.resolve('../server/src/BMI.xlsx'),
    });

    const [sheet] = Object.keys(excel);

    const bmi_items = excel[sheet];

    function splitFullName(fullName) {
      // Normalize spaces around the comma
      fullName = fullName.replace(/\s*,\s*/g, ", ");

      // Split into parts and trim spaces
      const [lastName, firstName] = fullName.split(", ").map(s => s.trim());

      return { firstName, lastName };
    }

    for (let i = 0; i < bmi_items.length; i++) {
      const item = bmi_items[i];

      await pool.query(`select * from t_insured where policies LIKE ?`, [`%${item.insured_code}%`])

      item.ident_no_original = item.ident_no
      if (item.ident_no) {

        item.ident_no = padToEleven(item.ident_no);
        item.ident_no = _utility.fixString(item.ident_no);

        let [cedulado] = await pool_utility.query(
          `SELECT * FROM t_cedulados WHERE Cedula=? LIMIT 1`,
          [item.ident_no]
        );

        if (cedulado) {
          item.$ident_type_id = 7;
          item.birthdate = _date.mysqlDateTime(cedulado.FechaNacimiento);
          item.age = _date.calculateReadableAge(cedulado.FechaNacimiento);
          item.$sex_id = cedulado.IdSexo === "M" ? 5 : cedulado.IdSexo === "F" ? 6 : null;
          item.sex = cedulado.IdSexo === "M" ? 'Masculino' : cedulado.IdSexo === "F" ? 'Femenino' : null;
          item.firstname = `${cedulado.Nombres}`;
          item.lastname = `${cedulado.Apellido1 || ""} ${cedulado.Apellido2 || ""}`;
          item.fullname = `${item.firstname} ${item.lastname}`;
          await pool.query(`UPDATE t_insured set birthdate=?, $sex_id=?, sex=?, firstname=?, lastname=?, fullname=?, age=?, ident_no=? where policies LIKE ?`, [item.birthdate, item.$sex_id, item.sex, item.firstname, item.lastname, item.fullname, item.age, item.ident_no, `%${item.insured_code}%`])
          continue;
        } else {
          if (item.sex) {
            item.$sex_id = item.sex === "M" ? 5 : item.sex === "F" ? 6 : null;
            item.sex = item.sex === "M" ? 'Masculino' : item.sex === "F" ? 'Femenino' : null;
          }
          if (item.birthdate) {
            item.birthdate = _date.mysqlDateTime(item.birthdate);
            item.age = _date.calculateReadableAge(item.birthdate);
          }
          item.ident_no = item.ident_no_original
          if (item.titular_description) {

            const { firstName, lastName } = splitFullName(item.titular_description)

            item.firstname = `${firstName}`;
            item.lastname = `${lastName}`;
            item.fullname = `${firstName} ${lastName}`;
          }
          await pool.query(`UPDATE t_insured set birthdate=?, $sex_id=?, sex=?, firstname=?, lastname=?, fullname=?, age=?, ident_no=? where policies LIKE ?`, [item.birthdate, item.$sex_id, item.sex, item.firstname, item.lastname, item.fullname, item.age, item.ident_no, `%${item.insured_code}%`])
          continue;
        }
      } else {
        if (item.sex) {
          item.$sex_id = item.sex === "M" ? 5 : item.sex === "F" ? 6 : null;
          item.sex = item.sex === "M" ? 'Masculino' : item.sex === "F" ? 'Femenino' : null;
        }
        if (item.birthdate) {
          item.birthdate = _date.mysqlDateTime(item.birthdate);
          item.age = _date.calculateReadableAge(item.birthdate);
        }
        item.ident_no = item.ident_no_original
        if (item.titular_description) {

          const { firstName, lastName } = splitFullName(item.titular_description)

          item.firstname = `${firstName}`;
          item.lastname = `${lastName}`;
          item.fullname = `${firstName} ${lastName}`;
        }
        await pool.query(`UPDATE t_insured set birthdate=?, $sex_id=?, sex=?, firstname=?, lastname=?, fullname=?, age=?, ident_no=? where policies LIKE ?`, [item.birthdate, item.$sex_id, item.sex, item.firstname, item.lastname, item.fullname, item.age, item.ident_no, `%${item.insured_code}%`])
        continue;
      }
    }
    console.log('complete');

  } catch (error) {
    console.log(error);
  }
});