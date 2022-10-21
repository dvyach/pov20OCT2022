//replace with 6/96

import { db_prefix, preparePreagregations } from '../prefix';

cube(`RunningProcessExperience`, {
  sql: `select idx,scrip,customer,machine,username, servertime,from_unixtime(servertime,'%Y-%m-%d %H:%i:%s') as dtime,
  cast((text1->>'$.noOfProcessesRunning') AS SIGNED) AS 'metric',
  '' AS 'other',
  'Processes Running' as 'metricname'
 from ${db_prefix()}event.Events
  where Events.scrip = 310 and text1->>'$.noOfProcessesRunning' is not null
  and ${FILTER_PARAMS.RunningProcessExperience.dtime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
  `,
  //  and ${FILTER_PARAMS.AIMX.dtime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
  title: `Process Analysis Exp`,
  description: `Process Analysis Exp`,

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
    NOPCount: {
      measures: [count,metriccount],
      dimensions: [metricname,other,dtime,
        manufacturer,
        chassistype,
        registeredprocessor,
        processorfamily,
        processormanufacturer,
        memorysize],
      timeDimension: dtime,
      granularity: `day`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      type: 'rollup',
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
