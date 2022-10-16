import { db_prefix } from '../prefix';

cube(`GA`, {
  sql: `
  SELECT Census.host as host,Census.site as site, Census.os as os, MachineGroups.mgroupid as gid,
  MachineGroups.name as name ,MachineGroups.style as style,
  MachineGroups.username as username FROM ${db_prefix()}core.Census,${db_prefix()}core.MachineGroupMap,${db_prefix()}core.MachineGroups
  WHERE
  Census.censusuniq = MachineGroupMap.censusuniq
  AND
  MachineGroups.mgroupuniq=MachineGroupMap.mgroupuniq
  AND
  MachineGroups.style <> 1`,
  title: `Personas`,
  description: `List of Personas`,

  joins: {},

  segments: {
    style_2: {
      sql: `${CUBE}.style = 2`,
    },
    style_3: {
      sql: `${CUBE}.style= 3`,
    },
  },

  measures: {},

  dimensions: {
    name: {
      sql: `name`,
      type: `string`,
    },

    host: {
      sql: `host`,
      type: `string`,
    },

    gid: {
      sql: `gid`,
      type: `number`,
      primaryKey: true,
    },

    gname: {
      case: {
        when: [{ sql: `name is null`, label: `Un-Grouped` }],
        else: { label: { sql: `name` } },
      },
      type: `string`,
    },
  },

  preAggregations: {},
});
