import { db_prefix } from '../prefix';

cube(`antivirus`, {
  sql: `  
  SELECT idx,servertime as stime,
  from_unixtime(servertime,'%Y-%m-%d %H:%i:%s') as dtime,
  customer,machine,username,ctime as ctime,
  cast((text3->>'$.avDisplayName') AS CHAR) AS 'avDisplayName',
  cast((text3->>'$.avOnOffStatus') AS CHAR) AS 'avOnOffStatus',
  cast((text3->>'$.avUpdateStatus') AS CHAR) AS 'avUpdateStatus',
  cast(SUBSTRING_INDEX(text2->>'$.log',':',-1) as CHAR) as 'TypeOfRun',
  clientversion as clientversion
  from  ${db_prefix()}event.Events
  where scrip = 263 
  and ${FILTER_PARAMS.antivirus.autoTime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)
    }
  `,
  //  and ${USER_CONTEXT.machine.filter('machine')}
  title: `AntiVirus Details`,
  description: `AntiVirus Details`,
  joins: {
    CA: {
      relationship: 'belongsTo',
      sql: `${CA}.site = ${CUBE}.customer and ${CA}.host = ${CUBE}.machine`
    },
    GA: {
      relationship: 'belongsTo',
      sql: `${GA}.host = ${CUBE}.machine`
    },
    combinedassets: {
      relationship: 'belongsTo',
      sql: `${combinedassets}.site = ${CUBE}.customer and ${combinedassets}.host = ${CUBE}.machine`,
    },
  },
  measures: {
    Count: {
      type: `countDistinct`,
      sql: `machine` // title: `Count`

    },
    AVOnCount: {
      type: `count`,
      filters: [{
        sql: `${CUBE}.avOnOffStatus = 'On'`
      }] // title: `Successeful(Count)`

    },
    AVOffCount: {
      type: `count`,
      filters: [{
        sql: `${CUBE}.avOnOffStatus = 'Off'`
      }] // title: `Terminated(Count)`
    },
  },
  dimensions: {
    EventId: {
      sql: `idx`,
      type: `number`,
      primaryKey: true,
      shown: false //  title: `Event ID`

    },
    Site: {
      sql: `customer`,
      type: `string` //  title: `Site`

    },
    Device: {
      sql: `machine`,
      type: `string` //title: `Device`

    },
    Group: {
      case: {
        when: [{
          sql: `${GA}.name is null`,
          label: `Un-Grouped`
        }],
        else: {
          label: {
            sql: `${GA}.name`
          }
        }
      },
      type: `string` // title: `Group`

    },
    
    avDisplayName: {
      type: `string`,
      sql: `avDisplayName` //  title: `AVName`

    },
    TypeOfRun: {
      type: `string`,
      sql: `TypeOfRun` // title: `Type of Run`

    },
    Status: {
      type: `string`,
      sql: `avOnOffStatus`,
      title: `Status`, //  title: `Status`

    },

    AVUpdateStatus: {
      type: `string`,
      sql: `avUpdateStatus`,
      title: `AVUpdateStatus`,
      //  title: `Status`

    },

    Username: {
      sql: `username`,
      type: `string` //  title: `Device User`

    },
    Version: {
      sql: `clientversion`,
      type: `string` // title: `Version`

    },
    autoTime: {
      type: `time`,
      sql: `dtime` //  title: `Time`

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
    // antivirusday: {
    //   type: `rollup`,
    //   measures: [Count, AVOnCount, AVOffCount],
    //   dimensions: [Device,
    //     Status,
    //     AVUpdateStatus,
    //     avDisplayName,
    //     TypeOfRun, 
    //     Site, 
    //     Version,
    //     manufacturer,
    //     chassistype,
    //     registeredprocessor,
    //     processorfamily,
    //     processormanufacturer,
    //     memorysize,
    //     operatingsystem,
    //     ],
    //   timeDimension: autoTime,
    //   granularity: `day`,
    //   partitionGranularity: `day`,
    //   scheduledRefresh: true,
    //   refreshKey: {
    //     every: `1800 seconds`,
    //     incremental: true,
    //     updateWindow: `6 hour`
    //   },
    //   buildRangeStart: {
    //     sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
    //   },
    //   buildRangeEnd: {
    //     sql: `SELECT NOW()`
    //   }
    // },
  }
});