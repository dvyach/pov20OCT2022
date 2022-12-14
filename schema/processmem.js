import { db_prefix, preparePreagregations } from '../prefix';

cube(`ProcessMEM`, {
  sql: `select idx,scrip,customer,machine,username,servertime, from_unixtime(servertime,'%Y-%m-%d %H:%i:%s') as dtime,
  text3->>'$.processName' AS 'ProcessName',
  cast((text3->>'$.memAvgPercentage') AS UNSIGNED INTEGER) AS 'ProcessMEM',
  cast((text3->>'$.windowName') AS CHAR ) AS 'Window'
   from ${db_prefix()}event.Events
  where scrip = 310
  and ${FILTER_PARAMS.ProcessMEM.dtime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
   `,
  title: `Process MEM Utilzation`,
  description: `Process MEM Utilzation`,

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
    // ProcessName is not null to be used in filter when viz is created
    count: {
      type: `count`,
      //  shown: false,
    },

    ProcessMEMavg: {
      type: `avg`,
      sql: `ProcessMEM`,
      //   shown: false,
    },

    // use avergae instead of SQL calculation
    // ProcessMEMTotal: {
    //   type: `sum`,
    //   sql: `ProcessMEM`,
    //   shown: false,
    // },
    // ProcessMEM: {
    //   type: `number`,
    //   sql: `${ProcessMEMTotal} / NULLIF(${count}, 0)`,
    //   title: `MEM Usage `,
    // },
  },
  dimensions: {
    idx: {
      sql: `idx`,
      type: `number`,
      primaryKey: true,
      shown: true
    },

    // site: {
    //   sql: `${CA}.site`,
    //   type: `string`,
    //   title: `Site`,
    // },

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

    // Not needed
    // os: {
    //   sql: `${CA}.os`,
    //   type: `string`,
    //   title: `Operating System`,
    // },

    ProcessName: {
      sql: `ProcessName`,
      type: `string`,
      title: `Process`,
    },
    WindowName: {
      sql: `Window`,
      type: `string`,
      title: `Window Name`,
    },
    machine: {
      sql: `machine`,
      type: `string`,
      title: `Machine`,
    },

    username: {
      sql: `username`,
      type: `string`,
      title: `Username`,
    },

    dtime: {
      sql: `dtime`,
      type: `time`,
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
    SHCount: {
      type: `rollup`,
      measures: [ProcessMEMavg, count],
      dimensions: [site, group, ProcessName, WindowName,
        manufacturer,
        chassistype,
        registeredprocessor,
        processorfamily,
        processormanufacturer,
        memorysize,
        operatingsystem
      ],
      timeDimension: dtime,
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
    pmem1: {
      measures: [
        ProcessMEM.ProcessMEMavg
      ],
      dimensions: [
        ProcessMEM.chassistype,
        ProcessMEM.site
      ],
      timeDimension: ProcessMEM.dtime,
      granularity: `hour`,
      partitionGranularity: `day`,
      scheduledRefresh: true,
      type: `rollup`,
      refreshKey: {
        every: `1800 seconds`,
        incremental: true,
        updateWindow: `6 hour` // sql: `SELECT MAX(dtime) FROM ${db_prefix()}event.Events`,

      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`
      }
    },
    Pmem2: {
      measures: [
        ProcessMEM.ProcessMEMavg
      ],
      dimensions: [
        ProcessMEM.manufacturer,
        ProcessMEM.site
      ],
      timeDimension: ProcessMEM.dtime,
      granularity: `hour`,
      partitionGranularity: `day`,
      scheduledRefresh: true,
      type: `rollup`,
      refreshKey: {
        every: `1800 seconds`,
        incremental: true,
        updateWindow: `6 hour` // sql: `SELECT MAX(dtime) FROM ${db_prefix()}event.Events`,

      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`
      }
    },
    Pmem3: {
      measures: [
        ProcessMEM.ProcessMEMavg
      ],
      dimensions: [
        ProcessMEM.registeredprocessor,
        ProcessMEM.site
      ],
      timeDimension: ProcessMEM.dtime,
      granularity: `hour`,
      partitionGranularity: `day`,
      scheduledRefresh: true,
      type: `rollup`,
      refreshKey: {
        every: `1800 seconds`,
        incremental: true,
        updateWindow: `6 hour` // sql: `SELECT MAX(dtime) FROM ${db_prefix()}event.Events`,

      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`
      }
    },
    Pmem4: {
      measures: [
        ProcessMEM.ProcessMEMavg
      ],
      dimensions: [
        ProcessMEM.processorfamily,
        ProcessMEM.site
      ],
      timeDimension: ProcessMEM.dtime,
      granularity: `hour`,
      partitionGranularity: `day`,
      scheduledRefresh: true,
      type: `rollup`,
      refreshKey: {
        every: `1800 seconds`,
        incremental: true,
        updateWindow: `6 hour` // sql: `SELECT MAX(dtime) FROM ${db_prefix()}event.Events`,

      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`
      }
    },
    Pmem5: {
      measures: [
        ProcessMEM.ProcessMEMavg
      ],
      dimensions: [
        ProcessMEM.processormanufacturer,
        ProcessMEM.site
      ],
      timeDimension: ProcessMEM.dtime,
      granularity: `hour`,
      partitionGranularity: `day`,
      scheduledRefresh: true,
      type: `rollup`,
      refreshKey: {
        every: `1800 seconds`,
        incremental: true,
        updateWindow: `6 hour` // sql: `SELECT MAX(dtime) FROM ${db_prefix()}event.Events`,

      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`
      }
    },
    Pmem6: {
      measures: [
        ProcessMEM.ProcessMEMavg
      ],
      dimensions: [
        ProcessMEM.memorysize,
        ProcessMEM.site
      ],
      timeDimension: ProcessMEM.dtime,
      granularity: `hour`,
      partitionGranularity: `day`,
      scheduledRefresh: true,
      type: `rollup`,
      refreshKey: {
        every: `1800 seconds`,
        incremental: true,
        updateWindow: `6 hour` // sql: `SELECT MAX(dtime) FROM ${db_prefix()}event.Events`,

      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`
      }
    },
    Pmem7: {
      measures: [
        ProcessMEM.ProcessMEMavg
      ],
      dimensions: [
        ProcessMEM.operatingsystem,
        ProcessMEM.site
      ],
      timeDimension: ProcessMEM.dtime,
      granularity: `hour`,
      partitionGranularity: `day`,
      scheduledRefresh: true,
      type: `rollup`,
      refreshKey: {
        every: `1800 seconds`,
        incremental: true,
        updateWindow: `6 hour` // sql: `SELECT MAX(dtime) FROM ${db_prefix()}event.Events`,

      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`
      }
    },

    Pmem8: {
      measures: [
        ProcessMEM.ProcessMEMavg
      ],
      dimensions: [
        ProcessMEM.site
      ],
      timeDimension: ProcessMEM.dtime,
      granularity: `hour`,
      partitionGranularity: `day`,
      scheduledRefresh: true,
      type: `rollup`,
      refreshKey: {
        every: `1800 seconds`,
        incremental: true,
        updateWindow: `6 hour` // sql: `SELECT MAX(dtime) FROM ${db_prefix()}event.Events`,

      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`
      }
    }
  },
});
