import { db_prefix, preparePreagregations } from '../prefix';

cube(`diskio`, {
  sql: `SELECT idx,customer, machine, scrip, username,servertime as stime,
  from_unixtime(servertime,'%Y-%m-%d %H:%i:%s') as dtime,
  cast((text1->>'$.avgQueueLength') AS SIGNED) AS 'averagequeuelength',
  cast((text1->>'$.drive') AS CHAR) AS 'drive',
  cast((text1->>'$.pctBusyTime') AS SIGNED) AS 'percentbusytime',
  cast((text1->>'$.readPerSecKb') AS SIGNED) AS 'readpersecond',
  cast((text1->>'$.writePerSecKb') AS SIGNED) AS 'writespersecond',
  cast((text1->>'$.realTimeDiskIOPct') AS SIGNED) AS 'dioper',
  clientversion as clientversion
  from  ${db_prefix()}event.Events
  where scrip = 97
  and ${FILTER_PARAMS.diskio.ETime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
  `,
  title: `DiskIO Performance`,
  description: 'Cube records Drivename, average Q length, read/write per sec, % busy time, and realtime Disk io %',

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
    },

    averagequeuelengthTotal: {
      type: `avg`,
      sql: `averagequeuelength`,
    },

    percentbusytimeTotal: {
      type: `avg`,
      sql: `percentbusytime`,
    },

    readpersecondTotal: {
      type: `avg`,
      sql: `readpersecond`,
    },

    writespersecondTotal: {
      type: `avg`,
      sql: `writespersecond`,
    },

    dioperTotal: {
      type: `avg`,
      sql: `dioper`,
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

    drive: {
      type: `string`,
      sql: `drive`,
      title: `Drive Name`,
    },

    ETime: {
      type: `time`,
      sql: `dtime`,
      title: `Converted Time`,
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
    MDCount: {
      type: `rollup`,
      measures: [dioperTotal, percentbusytimeTotal, readpersecondTotal, writespersecondTotal, averagequeuelengthTotal, count],
      dimensions: [site, group, clientver, drive,
      diskio.manufacturer,
      diskio.chassistype,
      diskio.registeredprocessor,
      diskio.processorfamily,
      diskio.processormanufacturer,
      diskio.memorysize,
      diskio.operatingsystem],
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

    MDAvg: {
      type: `rollup`,
      measures: [dioperTotal, percentbusytimeTotal, readpersecondTotal, writespersecondTotal, averagequeuelengthTotal,],
      dimensions: [site, group, clientver, drive,
      diskio.manufacturer,
      diskio.chassistype,
      diskio.registeredprocessor,
      diskio.processorfamily,
      diskio.processormanufacturer,
      diskio.memorysize,
      diskio.operatingsystem],
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