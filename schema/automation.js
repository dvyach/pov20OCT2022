import { db_prefix, preparePreagregations } from '../prefix';
cube(`Automation`, {
  sql: `SELECT idx,servertime as stime,
  from_unixtime(servertime,'%Y-%m-%d %H:%i:%s') as dtime,
  customer,machine,username,ctime as ctime,
  cast((REPLACE(REPLACE(text1->>'$.seqName',']',''),'[','')) as CHAR) AS 'tilename',
  cast((text1->>'$.seq') AS CHAR) AS 'statusText',
  cast((string1->>'$.log') AS CHAR) AS 'executedBy',
  CONV(SUBSTRING(CAST(SHA(CONCAT(json_keys(text1))) AS CHAR), 1, 16), 16, 10) as keylist,
  cast(SUBSTRING_INDEX(text2->>'$.log',':',-1) as CHAR) as 'log',
  cast((text1->>'$.seqDurationSec') as unsigned integer) AS 'duration',
  clientversion as clientversion
  from  ${db_prefix()}event.Events
  where scrip = 286 
  and ${FILTER_PARAMS.Automation.autoTime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
  `,
  //  and ${USER_CONTEXT.machine.filter('machine')}
  title: `Automation Analytics`,
  description: `Automation Analytics`,
  joins: {
    CA: {
      relationship: 'belongsTo',
      sql: `${CA.site} = ${CUBE}.customer and ${CA.host} = ${CUBE}.machine`
    },
    GA: {
      relationship: 'belongsTo',
      sql: `${GA.host} = ${CUBE}.machine`
    },
    combinedassets: {
      relationship: 'belongsTo',
      sql: `${combinedassets.site} = ${CUBE}.customer and ${combinedassets.host} = ${CUBE}.machine`
    }
  },
  measures: {
    AutomationCount: {
      type: `count`,
      sql: `idx` // title: `Count`

    },
    SuccessCount: {
      type: `count`,
      filters: [{
        sql: `${CUBE}.statusText = 'completed successfully'`
      }] // title: `Successeful(Count)`

    },
    TerminationCount: {
      type: `count`,
      filters: [{
        sql: `${CUBE}.statusText = 'Has been terminated'`
      }] // title: `Terminated(Count)`

    },
    ExecutionTime: {
      type: `avg`,
      sql: `duration` //  title: `Execution Time`

    },
    ExecutionDuration: {
      type: `avg`,
      sql: `duration`,
      filters: [{
        sql: `${CUBE}.statusText = 'completed successfully'`
      }] // title: `Execution Duration`

    },
    TerminatedAfter: {
      type: `avg`,
      sql: `duration`,
      filters: [{
        sql: `${CUBE}.statusText = 'Has been terminated'`
      }] //title: `Terminated After`

    },
    TileCount: {
      type: `countDistinct`,
      sql: `tilename` // title: `Distinct Count`

    },
    DeviceCount: {
      sql: `machine`,
      type: `countDistinct` //title: `Device`

    }
  },
  dimensions: {
    EventId: {
      sql: `idx`,
      type: `number`,
      primaryKey: true,
      shown: true //  title: `Event ID`

    },
    Site: {
      sql: `customer`,
      type: `string` //  title: `Site`

    },
    Device: {
      sql: `machine`,
      type: `string` //title: `Device`

    },
    group: {
      case: {
        when: [{
          sql: `${GA.name} is null`,
          label: `Un-Grouped`
        }],
        else: {
          label: {
            sql: `${GA.name}`
          }
        }
      },
      type: `string`
    },
    // OperatingSystem: {
    //   //   sql: `${CA}.os`,
    //   case: {
    //     when: [{
    //       sql: `${CA.os} is null`,
    //       label: `Windows10EnterpriseEdition64-bit`
    //     }],
    //     else: {
    //       label: {
    //         sql: `${CA.os}`
    //       }
    //     }
    //   },
    //   type: `string` // title: `Operating System`
    // },
    AutomationName: {
      type: `string`,
      sql: `tilename` //  title: `AutomationName`

    },
    TypeOfRun: {
      type: `string`,
      sql: `log` // title: `Type of Run`

    },
    Status: {
      type: `string`,
      sql: `statusText` //  title: `Status`

    },
    ExecutedBy: {
      type: `string`,
      sql: `executedBy` //  title: `Executed By`

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
      sql: ` ${combinedassets.manufacturer}`,
      type: `string`,
      title: `manufacturer`
    },
    chassistype: {
      sql: ` ${combinedassets.chassistype}`,
      type: `string`,
      title: `chassistype`
    },
    // from dataid=20
    registeredprocessor: {
      sql: ` ${combinedassets.registeredprocessor}`,
      type: `string`,
      title: `registeredprocessor`
    },
    processorfamily: {
      sql: ` ${combinedassets.processorfamily}`,
      type: `string`,
      title: `processorfamily`
    },
    processormanufacturer: {
      sql: ` ${combinedassets.processormanufacturer}`,
      type: `string`,
      title: `processormanufacturer`
    },
    // from dataid=16
    operatingsystem: {
      sql: ` ${combinedassets.operatingsystem}`,
      type: `string`,
      title: `operatingsystem`
    },
    // from dataid=39
    memorysize: {
      sql: ` ${combinedassets.memorysize}`,
      type: `string`,
      title: `memorysize`
    }
  },
  preAggregations: {
    autocountday: {
      type: `rollup`,
      measures: [Automation.AutomationCount, Automation.SuccessCount, Automation.TerminationCount],
      dimensions: [TypeOfRun, Site, group, AutomationName, Status, Version, manufacturer, chassistype, registeredprocessor, operatingsystem, processorfamily, processormanufacturer, memorysize],
      timeDimension: Automation.autoTime,
      granularity: `day`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      refreshKey: {
        every: `900 seconds`,
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
    distinct: {
      measures: [Automation.DeviceCount],
      dimensions: [Automation.AutomationName],
      timeDimension: Automation.autoTime,
      granularity: `day`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      refreshKey: {
        every: `900 seconds`,
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
    execduration: {
      measures: [Automation.ExecutionDuration, Automation.ExecutionTime, Automation.TerminatedAfter],
      dimensions: [Automation.AutomationName, Automation.TypeOfRun],
      timeDimension: Automation.autoTime,
      granularity: `day`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      refreshKey: {
        every: `900 seconds`,
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
    automationcount: {
      measures: [Automation.AutomationCount],
      dimensions: [Automation.autoTime],
      timeDimension: Automation.autoTime,
      granularity: `day`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      refreshKey: {
        every: `900 seconds`,
        incremental: true,
        updateWindow: `6 hour`
      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`
      }
    }
  }
});