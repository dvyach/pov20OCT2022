//replace with 6/96

import { db_prefix, preparePreagregations } from '../prefix';

cube(`ProcessMemoryUtilExp`, {
  sql: `select idx, scrip,customer,machine,username, servertime,
  from_unixtime(servertime,'%Y-%m-%d %H:%i:%s') as dtime,
  cast((text3->>'$.memAvgPercentage') AS SIGNED) AS 'metric',
  SUBSTRING_INDEX(text3->>'$.processName','#',1) AS 'other',
  'Process Memory Usage' as 'metricname'
  from ${db_prefix()}event.Events
  where scrip = 310 and SUBSTRING_INDEX(text3->>'$.processName','#',1) is not NULL
  and ${FILTER_PARAMS.AIMX.dtime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
  and ${FILTER_PARAMS.ProcessMemoryUtilExp.dtime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
   `,
   //  and ${FILTER_PARAMS.AIMX.dtime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
  title: `Process Memory Utilzation`,
  description: `Process Memory Utilzation`,

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
    metriccount: {
      type: `count`,
      sql: `metric`
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

    metric: {
      sql: `metric`,
      type: `number`,
      title: `Average Memory Percentage`,
    },

    metricname: {
      sql: `metricname`,
      type: `string`,
      title: `Process Name`,
    },

    other: {
      sql: `other`,
      type: `string`,
      title: `other`,
    },

    // from dataid=5
    manufacturer: {
      sql: ` ${combinedassets.manufacturer}`,
      type: `string`,
      title: `manufacturer`,
    },

    chassistype: {
      sql: ` ${combinedassets.chassistype}`,
      type: `string`,
      title: `chassistype`,
    },

    // from dataid=20
    registeredprocessor: {
      sql: ` ${combinedassets.registeredprocessor}`,
      type: `string`,
      title: `registeredprocessor`,
    },

    processorfamily: {
      sql: ` ${combinedassets.processorfamily}`,
      type: `string`,
      title: `processorfamily`,
    },

    processormanufacturer: {
      sql: ` ${combinedassets.processormanufacturer}`,
      type: `string`,
      title: `processormanufacturer`,
    },

    // from dataid=16
    operatingsystem: {
      sql: ` ${combinedassets.operatingsystem}`,
      type: `string`,
      title: `operatingsystem`,
    },
    
    // from dataid=39
    memorysize: {
      sql: ` ${combinedassets.memorysize}`,
      type: `string`,
      title: `memorysize`,
    },
  },
  preAggregations: {
    mainHD: {
      type: `rollup`,
      measures: [metriccount],
      dimensions: [dtime,
        metricname,
        other,
        manufacturer,
        chassistype,
        registeredprocessor,
        processorfamily,
        processormanufacturer,
        memorysize],
      granularity: `day`,
      partitionGranularity: `month`,
      timeDimension: dtime,
      scheduledRefresh: true,
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
