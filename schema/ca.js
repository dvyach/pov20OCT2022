import { db_prefix } from '../prefix';

cube(`CA`, {
  sql: `select C.id as cid, site,host, C.os,
  last AS 'ReportingTime',Cu.username as username
from ${db_prefix()}core.Census  as C join ${db_prefix()}core.Customers Cu on C.site = Cu.customer  `,

// and Cu.lastmodified is not null
 
  title: ` Location Cube`,
  description: `All Location cube`,
  joins: {},
  measures: {
      Count: {
      type: `count` // title: `Count`

    },
  },

  dimensions: {
    // The Census level dimensions like site name, operating system, host are here

    cid: {
      sql: `cid`,
      type: `number`,
      primaryKey: true,
      shown: true
    },
    site: {
      sql: `site`,
      type: `string`,
      title: 'site'
    },
    host: {
      sql: `host`,
      type: `string`,
      title: 'host'
    },
    os: {
      sql: `os`,
      type: `string`,
      title: 'os'
    },
    ReportingTime: {
      sql: `ReportingTime`,
      type: `string`,
      title: 'time'
    },
    username: {
      sql: `username`,
      type: `string`,
      title: 'name'
    },
  },
  preAggregations: {
    main: {
      type: `originalSql`,
      scheduledRefresh: true,
      refreshKey: {
        every: `1 hour`,
      },
      indexes: {
        machs: {
          columns: ['site', 'host'],
        },
      },
    },
  },
});
