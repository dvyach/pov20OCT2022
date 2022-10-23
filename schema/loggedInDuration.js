import { db_prefix, preparePreagregations } from '../prefix';

cube(`LoggedinDuration`, {
  sql: `select idx,scrip,customer,machine,username,servertime as stime,
  from_unixtime(servertime,'%Y-%m-%d %H:%i:%s') as dtime,
  cast((string1->>'$.logonTime') AS CHAR) AS 'logonTime',
  cast((string2->>'$.logoffTime') AS CHAR) AS 'logoffTime',
  cast((text1->>'$.UserWasLoggedInFor') AS UNSIGNED INTEGER) AS 'UserWasLoggedInFor',
  cast((text1->>'$.UserLogOffDetected') AS CHAR) AS 'UserInfo',
  clientversion as clientversion
  from  ${db_prefix()}event.Events
  where scrip = 174 and string2 is not null
  and ${FILTER_PARAMS.LoggedinDuration.ETime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
  `, // and ${USER_CONTEXT.machine.filter('machine')}

  title: `Logged in Duration`,
  description: `Logged in Duration`,

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

    UserWasLoggedInForTotal: {
      type: `avg`,
      sql: `UserWasLoggedInFor`,
    },
  },
  dimensions: {
    idx: {
      sql: `idx`,
      type: `number`,
      primaryKey: true,
      shown: true
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
    },

    clientver: {
      sql: `clientversion`,
      type: `string`,
    },

    UserInfo: {
      type: `string`,
      sql: `UserInfo`,
    },

    logoffTime: {
      type: `string`,
      sql: `logoffTime`,
    },

    logonTime: {
      type: `string`,
      sql: `logonTime`,
    },

    ETime: {
      type: `time`,
      sql: `dtime`,
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
    logindurationcount: {
      type: `rollup`,
      measures: [count,],
      dimensions: [site,  clientver, UserInfo, logoffTime, logonTime, ETime,
        manufacturer,
        chassistype,
        registeredprocessor,
        processorfamily,
        processormanufacturer,
        memorysize],
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

    logindurationAvg: {
      type: `rollup`,
      measures: [UserWasLoggedInForTotal],
      dimensions: [site,  clientver, UserInfo, logoffTime, logonTime, ETime,
        manufacturer,
        chassistype,
        registeredprocessor,
        processorfamily,
        processormanufacturer,
        memorysize],
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
