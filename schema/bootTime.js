import { db_prefix, preparePreagregations } from '../prefix';

cube(`BootTime`, {
  sql: `select idx,scrip,customer,machine,username, servertime as 'stime',
   from_unixtime(servertime,'%Y-%m-%d %H:%i:%s') as dtime,
  cast((text1->>'$.systemboottimeinmsec') AS SIGNED) AS 'systemboottime',
  cast((text1->>'$.systemosloadertimeinmsec') AS SIGNED) AS 'systemosloadertime',
  cast((text1->>'$.systempostboottimeinmsec') AS SIGNED) AS 'systempostboottime',
  cast((text1->>'$.systemsmssinittimeinmsec') AS SIGNED) AS 'systemsmssinittime',
  cast((text1->>'$.systemuserlogontimeinmsec') AS SIGNED) AS 'systemuserlogontime',
  cast((text1->>'$.systemdriverinittimeinmsec') AS SIGNED) AS 'systemdriverinittime',
  cast((text1->>'$.systemkernelinittimeinmsec') AS SIGNED) AS 'systemkernelinittime',
  cast((text1->>'$.systemexplorerinittimeinmsec') AS SIGNED) AS 'systemexplorerinittime',
  cast((text1->>'$.systemuserprofileprocessingtimeinmsec') AS SIGNED) AS 'systemuserprofiletime',
  clientversion as clientversion
  from  ${db_prefix()}event.Events
  where scrip = 31 and text1->>'$.systemboottimeinmsec' is not null
  and ${FILTER_PARAMS.BootTime.ETime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
  `,
   title: `Boot Time Details`,
  description: `Boot Time Details`,

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

    systemboottime: {
      type: `avg`,
      sql: `systemboottime`,
    },

    systemosloadertime: {
      type: `avg`,
      sql: `systemosloadertime`,
    },

    systempostboottime: {
      type: `avg`,
      sql: `systempostboottime`,
    },

    systemsmssinittime: {
      type: `avg`,
      sql: `systemsmssinittime`,
    },

    systemkernelinittime: {
      type: `avg`,
      sql: `systemkernelinittime`,
    },

    systemuserlogontime: {
      type: `avg`,
      sql: `systemuserlogontime`,
    },

    systemdriverinittime: {
      type: `avg`,
      sql: `systemdriverinittime`,
    },

    systemexplorerinittime: {
      type: `avg`,
      sql: `systemexplorerinittime`,
    },

    systemuserprofiletime: {
      type: `avg`,
      sql: `systemuserprofiletime`,
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
        when: [{ sql: `${GA.name} is null`, label: `Un-Grouped` }],
        else: { label: { sql: `${GA.name}` } },
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
    Bootcount: {
      type: `rollup`,
      measures: [
        count,
      ],
      dimensions: [site, 
      group,  
      clientver, 
      BootTime.manufacturer,
      BootTime.chassistype,
      BootTime.registeredprocessor,
      BootTime.processorfamily,
      BootTime.processormanufacturer,
      BootTime.memorysize,
      BootTime.operatingsystem
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

    Bootaverage: {
      type: `rollup`,
      measures: [
        systemuserprofiletime,
        systemexplorerinittime,
        systemdriverinittime,
        systemuserlogontime,
        systemkernelinittime,
        systemsmssinittime,
        systempostboottime,
        systemosloadertime,
        systemboottime,
      ],
      dimensions: [site, 
      group,  
      clientver, 
      BootTime.manufacturer,
      BootTime.chassistype,
      BootTime.registeredprocessor,
      BootTime.processorfamily,
      BootTime.processormanufacturer,
      BootTime.memorysize,
      BootTime.operatingsystem
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
