import { db_prefix, preparePreagregations } from '../prefix';

cube(`USBblock`, {
  sql: `select idx,scrip,customer,machine,username,servertime as stime,
  from_unixtime(servertime,'%Y-%m-%d %H:%i:%s') as dtime,
  cast((text1->>'$.USBStatus') AS CHAR) AS 'status',
  ${db_prefix()}event.Events.clientversion as clientversion,
  C.os as os
  from  ${db_prefix()}event.Events, ${db_prefix()}core.Census as C
  where C.site=customer and C.host= machine
  and scrip = 296 and (text1) is not null
  and ${FILTER_PARAMS.USBblock.ETime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
  `,
  title: `USB Block`,
  description: `USB Block`,

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
    count: {
      type: `count`,
      shown: false,
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
    },

    machine: {
      sql: `machine`,
      type: `string`,
    },

    group: {
      case: {
        when: [
          {
            sql: `${GA}.name is null`,
            label: `Un-Grouped`,
          },
        ],
        else: {
          label: {
            sql: `${GA}.name`,
          },
        },
      },
      type: `string`,
    },

    status: {
      type: `string`,
      sql: `status`,
    },

    username: {
      sql: `username`,
      type: `string`,
    },

    clientver: {
      sql: `clientversion`,
      type: `string`,
    },

    ETime: {
      type: `time`,
      sql: `dtime`,
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
      type: `rollup`,
      measures: [count],
      dimensions: [site, group, status, ETime,clientver,
      USBblock.manufacturer,
      USBblock.chassistype,
      USBblock.registeredprocessor,
      USBblock.processorfamily,
      USBblock.processormanufacturer,
      USBblock.memorysize,
      USBblock.operatingsystem
        ],
      granularity: `day`,
      partitionGranularity: `month`,
      timeDimension: ETime,
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
