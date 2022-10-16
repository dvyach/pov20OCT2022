import { db_prefix, preparePreagregations } from '../prefix';
cube(`DeviceOnline`, {
  sql: `SELECT host as host, last as last, from_unixtime(last,'%Y-%m-%d %H:%i:%s') as dateTime
  from  ${db_prefix()}core.Census
  where last > unix_timestamp(date_sub(now(), INTERVAL 4 hour))
`,
  title: `Devices Online`,
  measures: {
    count: {
      type: `count`,
      sql: `host`,
      title: `count`,
    },
  },
  dimensions: {
    host: {
      type: `string`,
      sql: `host`,
      title: `Machine`,
      shown: true,
    },
    last: {
      sql: `last`,
      type: `string`,
      title: `Last Online`,
      shown: true,
    },
    dateTime: {
      sql: `dateTime`,
      type: `time`,
      title: `DateTime`,
      shown: true,
    },
  },
  preAggregations: {
   Onlinedevicecount: {
      measures: [count,],
      dimensions: [dateTime, last, host],
      granularity: `day`,
      partitionGranularity: `month`,
      timeDimension: dateTime,
      scheduledRefresh: true,
      type: `rollup`, 
      refreshKey: {
        every: `1800 seconds`,
      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`
      },
    },
  },
});
