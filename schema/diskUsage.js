import { db_prefix, preparePreagregations } from '../prefix';

cube(`DiskUsage`, {
  sql: `select idx,scrip,customer,machine,username,servertime as stime,
  from_unixtime(servertime,'%Y-%m-%d %H:%i:%s') as dtime,
  cast((text1->>'$.pctUsed') AS SIGNED) AS 'dusedper',
  (text1->>'$.drive') AS 'drive',
  clientversion as clientversion
  from  ${db_prefix()}event.Events
  where scrip = 95
  and ${FILTER_PARAMS.DiskUsage.ETime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
  `, // and ${USER_CONTEXT.machine.filter('machine')}
  title: `Disk Usage`,
  description: `Disk Usage %`,

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

    dusedperTotal: {
      type: `avg`,
      sql: `dusedper`,

    },
  },

  dimensions: {
    idx: {
      sql: `idx`,
      type: `number`,
      primaryKey: true,
      shown: true
    },

    drive: {
      sql: `drive`,
      type: `string`,
      title: `Drive`,
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
      title: `Group`,
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
      title: `Time`,
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
    DUCount: {
      type: `rollup`,
      // useOriginalSqlPreAggregations: true,
      measures: [dusedperTotal, count],
      dimensions: [drive,
        site,
        group,
        clientver,
        DiskUsage.manufacturer,
        DiskUsage.chassistype,
        DiskUsage.registeredprocessor,
        DiskUsage.processorfamily,
        DiskUsage.processormanufacturer,
        DiskUsage.memorysize,
        DiskUsage.operatingsystem
      ],
      timeDimension: ETime,
      granularity: `day`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      refreshKey: {
        every: `1800 seconds`,
        incremental: true,
        updateWindow: `6 hour`,
      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`,
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`,
      },
    },

    DUAvg: {
      type: `rollup`,
      // useOriginalSqlPreAggregations: true,
      measures: [dusedperTotal,],
      dimensions: [drive,
        site,
        group,
        clientver,
        DiskUsage.manufacturer,
        DiskUsage.chassistype,
        DiskUsage.registeredprocessor,
        DiskUsage.processorfamily,
        DiskUsage.processormanufacturer,
        DiskUsage.memorysize,
        DiskUsage.operatingsystem
      ],
      timeDimension: ETime,
      granularity: `day`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      refreshKey: {
        every: `1800 seconds`,
        incremental: true,
        updateWindow: `6 hour`,
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
