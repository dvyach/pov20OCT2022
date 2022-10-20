import { db_prefix } from '../prefix';

// Are we use it?
cube(`survey`, {
  sql: `SELECT idx,servertime as stime,
   from_unixtime(servertime,'%Y-%m-%d %H:%i:%s') as dtime,
  customer,machine,username,
  cast((text1->>'$.adesc') AS CHAR) AS 'adesc',
  cast((text1->>'$.alabel') as CHAR) AS 'alabel',
  cast((text1->>'$.qlabel') as CHAR) AS 'qlabel',
  cast((text1->>'$.qdesc') as CHAR) AS 'qdesc',
  cast((text1->>'$.score') as UNSIGNED INTEGER) AS 'score',
  clientversion as clientversion
  from  ${db_prefix()}event.Events
  where  scrip = 241
  and ${FILTER_PARAMS.survey.ETime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
   `,
  title: `survey`,
  description: `Experience Survey`,

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
    response: {
      type: `count`,
      sql: `idx`,
      drillMembers: [machine, adesc, alabel, ETime],
      title: `Response`,
    },
    score: {
      type: `number`,
      sql: `score`,
      drillMembers: [machine, adesc, alabel, ETime],
      title: `Score`,
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

   group: {
      case: {
        when: [
          {
            sql: `${GA.name} is null`,
            label: `Un-Grouped`,
          },
        ],
        else: {
          label: {
            sql: `${GA.name}`,
          },
        },
      },
      type: `string`,
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
    MDCount: {
      type: `rollup`,
      // useOriginalSqlPreAggregations: true,
      measures: [response, score],
      dimensions: [site, group, machine, adesc, alabel, qlabel, qdesc, manufacturer,
      chassistype,registeredprocessor,processorfamily,processormanufacturer,operatingsystem,memorysize  ],
      timeDimension: ETime,
      granularity: `hour`,
      partitionGranularity: `day`,
      scheduledRefresh: true,
      refreshKey: {
        every: `3600 seconds`,
        incremental: true,
        // updateWindow: `6 hour`,
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
