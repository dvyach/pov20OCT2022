import { db_prefix } from '../prefix';
cube(`Census`, {
  sql: `select C.id, site,host,os,last AS 'ReportingTime',Cu.username as username, clientversion as clientversion
from ${db_prefix()}core.Census  as C join ${db_prefix()}core.Customers Cu on C.site = Cu.customer `,
  joins: {
    GA: {
      relationship: 'belongsTo',
      sql: `${GA}.host = ${CUBE}.host`,
    },
  },
  measures: {
    count: {
      type: `countDistinct`,
      sql: `host`,
      title: `Count`,
    },
    deviceReported30: {
      sql: `host`,
      type: `countDistinct`,
      rollingWindow: {
        trailing: `31 day`,
        offset: `end`,
      },
      drillMembers: [site, host, os, ReportingTime],
      title: `Device Reported in last 30 days`,
    },
    deviceReported7: {
      sql: `host`,
      type: `countDistinct`,
      rollingWindow: {
        trailing: `8 day`,
        offset: `end`,
      },
      drillMembers: [site, host, os, ReportingTime],
      title: `Device Reported in last 7 days`,
    },
    deviceReported1: {
      sql: `host`,
      type: `countDistinct`,
      rollingWindow: {
        trailing: `2 day`,
        offset: `end`,
      },
      drillMembers: [site, host, os, ReportingTime],
      title: `Device Reported last 24 hours`,
    },
    deviceReportedN: {
      sql: `host`,
      type: `countDistinct`,
      drillMembers: [site, host, os, ReportingTime],
      title: `Device Reported Today`,
    },
    //TODO: to remove because this measure exists in DeviceReported cube
    deviceReportedAll: {
      sql: `id`, // @todo check for combined table
      type: `countDistinct`,
      rollingWindow: {
        trailing: `unbounded`,
        offset: `end`,
      },
      drillMembers: [site, host, os, ReportingTime],
      title: `Devices Reported`,
    },
    deviceNOTReported: {
      sql: `host`,
      type: `countDistinct`,
      title: `Devices Not Reported`,
      drillMembers: [site, host, os, ReportingTime],
      rollingWindow: {
        trailing: `unbounded`,
        offset: `end`,
      },
      filters: [
        {
          sql: `ReportingTime <= UNIX_TIMESTAMP(NOW() - INTERVAL 90 DAY)`,
        },
      ],
    },
  },
  dimensions: {
    idx: {
      sql: `id`,
      type: `number`,
      primaryKey: true,
    },
    host: {
      type: `string`,
      sql: `host`,
      title: `Machine`,
      shown: true,
    },
    clientversion: {
      type: `string`,
      sql: `clientversion`,
      title: `Client version`,
      shown: true,
    },
    site: {
      sql: `site`,
      type: `string`,
      title: `Site`,
      shown: true,
    },
    os: {
      sql: `os`,
      type: `string`,
      title: `OS`,
      shown: true,
    },
    ReportingTime: {
      sql: `from_unixtime(ReportingTime,'%Y-%m-%d %H:%M:%S')`,
      type: `time`,
      title: `ReportingTime`,
      shown: true,
    },
  },
  preAggregations: {
  },
});
