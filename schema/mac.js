import { db_prefix } from '../prefix';

cube(`MAC`, {
  sql: `select M.machineid as idm, M.cust as cust,M.host as host,Cu.username as username
  from ${db_prefix()}asset.Machine M join ${db_prefix()}core.Customers Cu on Cu.customer = M.cust `, // where ${SECURITY_CONTEXT.machine.filter('M.host')} and ${SECURITY_CONTEXT.username.filter('Cu.username')}
  title: `Machines Cube`,
  description: `Machines cube`,

  joins: { 
    GA: {
      relationship: 'belongsTo',
      sql: `${GA.host} = ${CUBE}.machine`
    },

  },
  measures: {
  },

  dimensions: {
    // The Census level dimensions like site name, operating system, host are here

    idm: {
      sql: `machineid`,
      type: `number`,
      primaryKey: true,
      shown: false,
    },
    location: {
      sql: `cust`,
      type: `string`,
    },
    grp: {
      case: {
        when: [
          {
            sql: `${GA}.name is null`,
            label: `Un-Grouped`,
          },
        ],
        else: {
          label: {
            sql: `${GA}.name`,
          },
        },
      },
      type: `string`,
      title: `Group`,
    },
    host: {
      sql: `host`,
      type: `string`,
    },

  },
  preAggregations: {
  },
});
