import { db_prefix } from '../prefix';

cube(`SurveyExp`, {
  sql: `SELECT idx,scrip,customer,machine,username, servertime, from_unixtime(servertime,'%Y-%m-%d %H:%i:%s') as dtime,
         cast((text1->>'$.score') AS SIGNED) AS 'metric',
         'Survey' as 'metricname',
         '' AS 'other'
        from ${db_prefix()}event.Events
        where scrip = 241 
    and ${FILTER_PARAMS.SurveyExp.dtime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
  `,
  //  and ${FILTER_PARAMS.AIMX.dtime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
  title: `Survey Exp`,
  description: `Survey Exp`,

  joins: {
    CA: {
      relationship: 'belongsTo',
      sql: `${CA}.site = ${CUBE}.customer and ${CA}.host = ${CUBE}.machine`,
    },
    GA: {
      relationship: 'belongsTo',
      sql: `${GA}.host = ${CUBE}.machine`,
    },
    combinedassets: {
      relationship: 'belongsTo',
      sql: `${combinedassets}.site = ${CUBE}.customer and ${combinedassets}.host = ${CUBE}.machine`,
    },
  },

  measures: {
    count:{
      sql: `idx`,
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

    site: {
      sql: `customer`,
      type: `string`,
      title: `Site`,
    },

    machine: {
      sql: `machine`,
      type: `string`,
      title: `Machine`,
    },

    adesc: {
      type: `string`,
      sql: `adesc`,
      title: `Answer`,
    },

    alabel: {
      type: `string`,
      sql: `alabel`,
      title: `Answer Label`,
    },
    qdesc: {
      type: `string`,
      sql: `qdesc`,
      title: `Question`,
    },
    qlabel: {
      type: `string`,
      sql: `qlabel`,
      title: `Question Label`,
    },
    username: {
      sql: `username`,
      type: `string`,
      title: `Device User`,
    },

    clientver: {
      sql: `clientversion`,
      type: `string`,
      title: `Version`,
    },

    ETime: {
      type: `time`,
      sql: `dtime`,
      title: `Execution Time`,
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
    surveyexp: {
      type: `rollup`,
      measures: [count, metriccount],
      dimensions: [site, machine, adesc, alabel, qlabel, qdesc, manufacturer,
      chassistype,registeredprocessor,processorfamily,processormanufacturer,operatingsystem,memorysize],
      timeDimension: ETime,
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
