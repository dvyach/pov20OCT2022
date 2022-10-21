import { db_prefix, preparePreagregations } from '../prefix';

cube(`BootTimeExp`, {
  sql: `select idx,scrip,customer,machine,username, servertime,
  from_unixtime(servertime,'%Y-%m-%d %H:%i:%s') as dtime,
  round(cast((text1->>'$.systemboottimeinmsec') AS SIGNED)/1000) AS 'metric',
  '' AS 'other',
  'System Startup' as 'metricname'
  from ${db_prefix()}event.Events
  where scrip = 31 and text1->>'$.systemboottimeinmsec' is not null
  and ${FILTER_PARAMS.AIMX.dtime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
  and ${FILTER_PARAMS.BootTimeExp.dtime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
  `,
  //  and ${FILTER_PARAMS.AIMX.dtime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
  title: `Boot Time Experience`,
  description: `Boot Time Experience`,

  joins: {
    CA: {
      relationship: 'belongsTo',
      sql: `${CA.site} = ${CUBE}.customer and ${CA.host} = ${CUBE}.machine`,
    },
    GA: {
      relationship: 'belongsTo',
      sql: `${GA.host} = ${CUBE}.machine`,
    },
    combinedassets: {
      relationship: 'belongsTo',
      sql: `${combinedassets.site} = ${CUBE}.customer and ${combinedassets.host} = ${CUBE}.machine`,
    },
  },
  measures: {
    count: {
      type: `count`,
      sql: `idx`,
    },
    metriccount:{
      sql: `metric`,
      type: `count`
    }
  },
  dimensions: {
    idx: {
      sql: `idx`,
      type: `number`,
      primaryKey: true,
    },
    dtime: {
      sql: `dtime`,
      type: `time`,
      title: `Time`,
    },
    metricname:{
      sql: `metricname`,
      type: `string`,
      title: `metricname`
    },
    metric:{
      sql: `metric`,
      type: `number`,
      title: `metric`
    },
    other:{
      sql: `other`,
      type: `string`,
      title: `other`
    }
  },
  preAggregations: {
    boottime: {
      type: `rollup`,
      measures: [count,metriccount],
      dimensions: [
        dtime,
        metricname,
        metric,
        other,
        ],
      timeDimension: dtime,
      granularity: `day`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      refreshKey: {
        every: `1800 seconds`,
        incremental: true,
        updateWindow: `6 hour`
      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`
      }
    },
  },
});
