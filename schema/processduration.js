import { db_prefix, preparePreagregations } from '../prefix';

cube(`procdur`, {
  sql: `select idx,scrip,customer,machine,username,servertime as stime,
  from_unixtime(servertime,'%Y-%m-%d %H:%i:%s') as dtime,
  cast((text3->>'$.process') AS CHAR) AS 'processname',
  cast((text3->>'$.procDurationSec') AS SIGNED) AS 'procduration',
  cast((text1->>'$.procDurationSec') AS SIGNED) AS 'winprocduration',
  cast((text1->>'$.process') AS CHAR) AS 'winprocessname',
  cast((text1->>'$.window') AS CHAR) AS 'procwindows',
  clientversion as clientversion
  from  ${db_prefix()}event.Events
  where scrip = 308 and text1 is not null
  and ${FILTER_PARAMS.procdur.ETime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
  `,
  title: `Process durataion`,
  description: `Process durataion`,

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
      //   shown: false,
    },

    procdurationTotal: {
      type: `sum`,
      sql: `procduration`,
      //   shown: false,
    },
    procduration: {
      type: `number`,
      sql: `${procdurationTotal} / NULLIF(${count}, 0)`,
      title: `Process Duration`,
    },
    winprocdurationTotal: {
      type: `sum`,
      sql: `winprocduration`,
      //   shown: false,
    },
    winprocduration: {
      type: `number`,
      sql: `${winprocdurationTotal} / NULLIF(${count}, 0)`,
      title: `Process Duration for a Window`,
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
      title: `Device`,
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

    processname: {
      type: `string`,
      sql: `processname`,
      title: `Process Name`,
    },

    procwindows: {
      type: `string`,
      sql: `procwindows`,
      title: `Windows Name`,
    },

    ETime: {
      type: `time`,
      sql: `dtime`,
      title: `Converted Time`,
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
    SHCount: {
      type: `rollup`,
      measures: [procdurationTotal, count, winprocdurationTotal],
      dimensions: [site, group, processname, procwindows, manufacturer,
        chassistype,
        registeredprocessor,
        processorfamily,
        processormanufacturer,
        memorysize,
        operatingsystem
      ],
      timeDimension: ETime,
      granularity: `hour`,
      partitionGranularity: `day`,
      scheduledRefresh: preparePreagregations(),
      refreshKey: {
        every: `3600 seconds`,
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
