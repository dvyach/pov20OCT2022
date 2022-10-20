//replace with 6/96

import { db_prefix, preparePreagregations } from '../prefix';

cube(`MemoryUtilizationExperience`, {
  sql: `select idx,scrip,customer,machine,username,servertime, from_unixtime(servertime,'%Y-%m-%d %H:%i:%s') as dtime,
  cast((text1->>'$.sysMemUsagePercentageAvg') AS SIGNED) AS 'metric',
  '' AS 'other',
  'Memory Utilization' as 'metricname'
  from ${db_prefix()}event.Events
  where scrip = 310 and text1->>'$.sysMemUsagePercentageAvg' is not null
  and ${FILTER_PARAMS.AIMX.dtime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
  and ${FILTER_PARAMS.MemoryUtilizationExperience.dtime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
  `,
  title: `Memory Utilization`,
  description: `Memory Utilization`,

  joins: {
    combinedassets: {
      relationship: 'belongsTo',
      sql: `${combinedassets}.site = ${CUBE}.customer and ${combinedassets}.host = ${CUBE}.machine`,
    },
  },
  measures: {
    count:{
      type: `count`,
      sql: `idx`,
    },
    metriccount:{
      sql: `metric`,
      type: `count`,
    },
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

    other:{
      sql: `other`,
      type: `string`,
      title: `other`,
    },

    // from dataid=5
    manufacturer: {
      sql: ` ${combinedassets}.manufacturer`,
      type: `string`,
      title: `manufacturer`,
    },

    chassistype: {
      sql: ` ${combinedassets}.chassistype`,
      type: `string`,
      title: `chassistype`,
    },

    // from dataid=20
    registeredprocessor: {
      sql: ` ${combinedassets}.registeredprocessor`,
      type: `string`,
      title: `registeredprocessor`,
    },

    processorfamily: {
      sql: ` ${combinedassets}.processorfamily`,
      type: `string`,
      title: `processorfamily`,
    },

    processormanufacturer: {
      sql: ` ${combinedassets}.processormanufacturer`,
      type: `string`,
      title: `processormanufacturer`,
    },

    // from dataid=16
    operatingsystem: {
      sql: ` ${combinedassets}.operatingsystem`,
      type: `string`,
      title: `operatingsystem`,
    },
    
    // from dataid=39
    memorysize: {
      sql: ` ${combinedassets}.memorysize`,
      type: `string`,
      title: `memorysize`,
    },
  },
  preAggregations: {
    mainHD: {
      measures: [count,metriccount,],
      dimensions: [dtime,metricname,other,
      DR.manufacturer,
      DR.chassistype,
      DR.registeredprocessor,
      DR.processorfamily,
      DR.processormanufacturer,
      DR.memorysize,
      DR.operatingsystem],
      granularity: `day`,
      partitionGranularity: `month`,
      timeDimension: dtime,
      scheduledRefresh: true,
      type: `rollup`,
      refreshKey: {
        every: `1800 seconds`,
        incremental: true,
      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`,
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`,
      },
    },
  },
});
