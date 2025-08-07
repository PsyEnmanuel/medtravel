import pool from "../databases/main.js";
import { permissions, tableWithNoAccountId } from "./constant.js";

export function joinPrivileges(table, action) {
  return ` LEFT OUTER JOIN (SELECT * FROM t_privilege GROUP BY c_related_uid) tbl_privilege ON tbl_privilege.c_related_table = '${table}' AND tbl_privilege.c_action = '${action}' AND ((tbl_privilege.c_type = 'object' and tbl_privilege.c_related_uid = ${table}.id))`;
}

export function hasPrivileges(privileges, require) {
  let index = privileges.findIndex((privilege) => {
    return privilege.c_title.toUpperCase() == require.toUpperCase();
  });
  return index != -1;
}

export async function objectPrivileges(obj_id, table, user) {
  try {
    const user_id = user.id;
    const user_roles = user.unixroles;
    let query = `
      select distinct ac.c_title
      from
         t_action as ac
         inner join ${table} as obj on obj.id = ${obj_id}
         inner join t_implemented_action as ia
            on ia.c_action = ac.c_title
               and ia.c_table = '${table}'
               and ((ia.c_status = 0) or (ia.c_status & obj.c_status <> 0))
         left outer join t_privilege as pr
            on pr.c_related_table = '${table}'
               and pr.c_action = ac.c_title
               and (
                  (pr.c_type = 'object' and pr.c_related_uid = ${obj_id})
                  or pr.c_type = 'global'
                  or (pr.c_group = 'self' and ${user_id} = ${obj_id} and '${table}' = 't_user'))
      where
         ac.c_apply_object`;
    query += ` AND account_id = ${user.account_id}`;
    query += `
         and (
            (${user_roles} & 1 <> 0)
            or (ac.c_title = 'read' and (
               (obj.c_unixperms & ${permissions.other_read} <> 0)
               or ((obj.c_unixperms & ${permissions.owner_read} <> 0)
                  and obj.c_owner = ${user_id})
               or ((obj.c_unixperms & ${permissions.role_read} <> 0)
                  and (${user_roles} & obj.c_roles <> 0))))
            or (ac.c_title = 'write' and (
               (obj.c_unixperms & ${permissions.other_write} <> 0)
               or ((obj.c_unixperms & ${permissions.owner_write} <> 0)
                  and obj.c_owner = ${user_id})
               or ((obj.c_unixperms & ${permissions.role_write} <> 0)
                  and (${user_roles} & obj.c_roles <> 0))))
            or (ac.c_title = 'delete' and (
               (obj.c_unixperms & ${permissions.other_delete} <> 0)
               or ((obj.c_unixperms & ${permissions.owner_delete} <> 0)
                  and obj.c_owner = ${user_id})
               or ((obj.c_unixperms & ${permissions.role_delete} <> 0)
                  and (${user_roles} & obj.c_roles <> 0))))
            or (pr.c_group = 'user' and pr.c_who = ${user_id})
            or (pr.c_group = 'owner' and obj.c_owner = ${user_id})
            or (pr.c_group = 'owner_role' and (obj.c_roles & ${user_roles} <> 0))
            or (pr.c_group = 'role' and (pr.c_who & ${user_roles} <> 0)))
            or pr.c_group = 'self';
      `;
    const result = await pool.query(query);
    return result.map((data) => data.c_title);
  } catch (error) {
    console.log(error);
  }
}

export async function tablePrivileges(table, user) {
  try {
    const query = `
      select ac.c_title
      from
          t_action as ac
          left outer join t_privilege as pr
              on pr.c_related_table = '${table}'
                  and pr.c_action = ac.c_title
                  and pr.c_type = 'table'
      where
          (ac.c_apply_object = 0) and (
              (${user.unixroles} & 1 <> 0)
              or (pr.c_group = 'user' and pr.c_who = ${user.id})
              or (pr.c_group = 'role' and (pr.c_who & ${user.unixroles} <> 0)))
      `;
    return await pool.query(query);
  } catch (error) {
    console.log(error);
  }
}

/**
 *
 * @param {string} table
 * @param {Object} user
 * @return {string}
 */
export function canRead(table, user) {
  let access = `AND (
      ((${table}.c_owner = ${user.id}) AND (${table}.c_unixperms & ${permissions["owner_read"]})) 
      OR ((${table}.c_roles & ${user.unixroles} ) AND ( ${table}.c_unixperms & ${permissions["role_read"]})) 
      OR (${table}.c_unixperms & ${permissions["other_read"]})
      OR (tbl_privilege.c_group = 'user' and tbl_privilege.c_who = ${user.id})
      OR (tbl_privilege.c_group = 'owner' and ${table}.c_owner = ${user.id})
      OR (tbl_privilege.c_group = 'owner_role' and (${table}.c_roles & ${user.unixroles} <> 0))
      OR (tbl_privilege.c_group = 'role' and (tbl_privilege.c_who & ${user.unixroles} <> 0))
      OR ${user.unixroles} & 1)`;
  if (tableWithNoAccountId.indexOf(table) === -1) {
    access += `AND ${table}.account_id = ${user.account_id}`;
  }
  return access;
}
/**
 *
 * @param {string} table
 * @param {Object} user
 * @return {string}
 */
export function canWrite(table, user) {
  let access = `AND ((( ${table}.c_owner = ${user.id} ) AND ( ${table}.c_unixperms & ${permissions["owner_write"]} )) 
   OR (( ${table}.c_roles & ${user.unixroles} ) AND ( ${table}.c_unixperms & ${permissions["role_write"]} )) 
   OR ( ${table}.c_unixperms & ${permissions["other_write"]} )
   OR (tbl_privilege.c_group = 'user' and tbl_privilege.c_who = ${user.id})
   OR (tbl_privilege.c_group = 'owner' and ${table}.c_owner = ${user.id})
   OR (tbl_privilege.c_group = 'owner_role' and (${table}.c_roles & ${user.unixroles} <> 0))
   OR (tbl_privilege.c_group = 'role' and (tbl_privilege.c_who & ${user.unixroles} <> 0))
   OR ${user.unixroles} & 1)`;
  if (tableWithNoAccountId.indexOf(table) === -1) {
    access += `AND ${table}.account_id = ${user.account_id}`;
  }
  return access;
}

/**
 *
 * @param {string} table
 * @param {Object} user
 * @return {string}
 */
export function can_delete(table, user) {
  let access = `AND ((( ${table}.c_owner = ${user.id} ) AND ( ${table}.c_unixperms & ${permissions["owner_delete"]} )) 
   OR (( ${table}.c_roles & ${user.unixroles} ) AND ( ${table}.c_unixperms & ${permissions["role_delete"]} )) 
   OR ( ${table}.c_unixperms & ${permissions["other_delete"]} )
   OR (tbl_privilege.c_group = 'user' and tbl_privilege.c_who = ${user.id})
   OR (tbl_privilege.c_group = 'owner' and ${table}.c_owner = ${user.id})
   OR (tbl_privilege.c_group = 'owner_role' and (${table}.c_roles & ${user.unixroles} <> 0))
   OR (tbl_privilege.c_group = 'role' and (tbl_privilege.c_who & ${user.unixroles} <> 0))
   )`;
  if (tableWithNoAccountId.indexOf(table) === -1) {
    access += `AND ${table}.account_id = ${user.account_id}`;
  }
  return access;
}
