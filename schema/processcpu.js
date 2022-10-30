import { db_prefix, preparePreagregations } from '../prefix';

cube(`ProcessCPU`, {
  sql: `select idx,scrip,customer,machine,username,servertime, from_unixtime(servertime,'%Y-%m-%d %H:%i:%s') as dtime,
  text3->>'$.processName' AS 'ProcessName',
  cast((text3->>'$.cpuAvgPercentage') AS UNSIGNED INTEGER) AS 'ProcessCPU',
  cast((text3->>'$.windowName') AS CHAR ) AS 'Window'
  from ${db_prefix()}event.Events
  where scrip = 310
  and ${FILTER_PARAMS.ProcessCPU.dtime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
   `,
  title: `Process CPU Utilzation`,
  description: `Process CPU Utilzation`,

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
      //   shown: false,
    },

    ProcessCPUavg: {
      type: `avg`,
      sql: `ProcessCPU`,
      //   shown: false,
    },

    // use avergae instead of SQL calculation
    // ProcessCPUTotal: {
    //   type: `sum`,
    //   sql: `ProcessCPU`,
    //   shown: false,
    // },
    // ProcessCPU: {
    //   type: `number`,
    //   sql: `${ProcessCPUTotal} / NULLIF(${count}, 0)`,
    //   title: `CPU Usage `,
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
      measures: [ProcessCPUavg, count],
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
      scheduledRefresh: true,
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
    pcpu1: {
      measures: [
        ProcessCPU.ProcessCPUavg
      ],
      dimensions: [
        ProcessCPU.ProcessName, ProcessCPU.site
      ],
      timeDimension: ProcessCPU.dtime,
      granularity: `day`,
      partitionGranularity: `day`,
      scheduledRefresh: true,
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
    pcpu2: {
      measures: [
        ProcessCPU.ProcessCPUavg
      ],
      dimensions: [
        ProcessCPU.chassistype,
        ProcessCPU.site,
      ],
      timeDimension: ProcessCPU.dtime,
      granularity: `day`,
      partitionGranularity: `day`,
      scheduledRefresh: true,
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
    pcpu3: {
      measures: [
        ProcessCPU.ProcessCPUavg
      ],
      dimensions: [
        ProcessCPU.manufacturer,
        ProcessCPU.site,
      ],
      timeDimension: ProcessCPU.dtime,
      granularity: `day`,
      partitionGranularity: `day`,
      scheduledRefresh: true,
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
    pcpu4: {
      measures: [
        ProcessCPU.ProcessCPUavg
      ],
      dimensions: [
        ProcessCPU.registeredprocessor,
        ProcessCPU.site,
      ],
      timeDimension: ProcessCPU.dtime,
      granularity: `day`,
      partitionGranularity: `day`,
      scheduledRefresh: true,
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
    pcpu5: {
      measures: [
        ProcessCPU.ProcessCPUavg
      ],
      dimensions: [
        ProcessCPU.processorfamily,
        ProcessCPU.site,
      ],
      timeDimension: ProcessCPU.dtime,
      granularity: `day`,
      partitionGranularity: `day`,
      scheduledRefresh: true,
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
    pcpu6: {
      measures: [
        ProcessCPU.ProcessCPUavg
      ],
      dimensions: [
        ProcessCPU.processormanufacturer,
        ProcessCPU.site,
      ],
      timeDimension: ProcessCPU.dtime,
      granularity: `day`,
      partitionGranularity: `day`,
      scheduledRefresh: true,
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
    pcpu7: {
      measures: [
        ProcessCPU.ProcessCPUavg
      ],
      dimensions: [
        ProcessCPU.memorysize,
        ProcessCPU.site,
      ],
      timeDimension: ProcessCPU.dtime,
      granularity: `day`,
      partitionGranularity: `day`,
      scheduledRefresh: true,
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

    pcpu8: {
      measures: [
        ProcessCPU.ProcessCPUavg
      ],
      dimensions: [
        ProcessCPU.operatingsystem,
        ProcessCPU.site,
      ],
      timeDimension: ProcessCPU.dtime,
      granularity: `day`,
      partitionGranularity: `day`,
      scheduledRefresh: true,
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
