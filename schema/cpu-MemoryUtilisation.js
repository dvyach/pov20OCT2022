import { db_prefix } from '../prefix';
cube(`CPUMemoryUtilization`, {
  sql: `select idx,scrip,customer,machine,username,servertime as stime,
  from_unixtime(servertime,'%Y-%m-%d %H:%i:%s') as dtime,
  cast((text1->>'$.sysCpuUsagePercentageAvg') AS SIGNED) AS 'avgCPUpctg',
  cast((text1->>'$.sysMemUsagePercentageAvg') AS SIGNED) AS 'avgMEMpctg',
  cast((text1->>'$.sysVirMemUsagePercentageAvg') AS SIGNED) AS 'avgVirMEMpctg',
  cast((text1->>'$.sysSwapMemUsagePercentageAvg') AS SIGNED) AS 'avgswapMEMpctg',
  clientversion as clientversion
  from  ${db_prefix()}event.Events
  where scrip = 310 and text1 is not null
  and ${FILTER_PARAMS.CPUMemoryUtilization.ETime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
  `,
  title: `Memory Utilization`,
  description: `Memory Utilization`,
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
    count: {
      type: `count`,
      shown: true
    },
    machinedistcount: {
      type: `countDistinct`,
      sql: `machine`,
      title: `Distinct Count`
    },
    avgCPUpctgTotal: {
      type: `avg`,
      sql: `avgCPUpctg`
    },
    avgMEMpctgTotal: {
      type: `avg`,
      sql: `avgMEMpctg`
    },
    avgVirMEMpctgTotal: {
      type: `avg`,
      sql: `avgVirMEMpctg`
    },
    avgswapMEMpctgTotal: {
      type: `avg`,
      sql: `avgswapMEMpctg`
    }
    /*CPUpctg: {
      type: `number`,
      sql: `${avgCPUpctgTotal} / NULLIF(${count}, 0)`,
      title: `Average CPU %`,
    },
    mempctg: {
      type: `number`,
      sql: `${avgMEMpctgTotal} / NULLIF(${count}, 0)`,
      title: `Average Memory %`,
    },
    virmempctg: {
      type: `number`,
      sql: `${avgVirMEMpctgTotal} / NULLIF(${count}, 0)`,
      title: `Virtual Memory %`,
    },
    swapmempctg: {
      type: `number`,
      sql: `${avgswapMEMpctgTotal} / NULLIF(${count}, 0)`,
      title: `Swap Memory %`,
    },*/

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
      title: `Site`
    },
    machine: {
      sql: `machine`,
      type: `string`,
      title: `Device`
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
    username: {
      sql: `username`,
      type: `string`,
      title: `Device User`
    },
    clientver: {
      sql: `clientversion`,
      type: `string`,
      title: `Version`
    },
    ETime: {
      type: `time`,
      sql: `dtime`,
      title: `Time`
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
    DramCount: {
      measures: [count],
      dimensions: [site, machine, group, username, clientver, ETime, manufacturer, chassistype, registeredprocessor, processorfamily, processormanufacturer, memorysize, operatingsystem],
      granularity: `day`,
      partitionGranularity: `day`,
      timeDimension: ETime,
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
    DramAvg: {
      measures: [avgCPUpctgTotal, avgMEMpctgTotal, avgVirMEMpctgTotal, avgswapMEMpctgTotal],
      dimensions: [site, machine, group, username, clientver, ETime, manufacturer, chassistype, registeredprocessor, processorfamily, processormanufacturer, memorysize, operatingsystem],
      granularity: `day`,
      partitionGranularity: `day`,
      timeDimension: ETime,
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
    Dramdistcount: {
      measures: [machinedistcount],
      dimensions: [site, machine, group, username, clientver, ETime, manufacturer, chassistype, registeredprocessor, processorfamily, processormanufacturer, memorysize, operatingsystem],
      granularity: `day`,
      partitionGranularity: `day`,
      timeDimension: ETime,
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
    measuresonly: {
      measures: [avgCPUpctgTotal, avgMEMpctgTotal, avgVirMEMpctgTotal, avgswapMEMpctgTotal, machinedistcount],
      dimensions: [
        CPUMemoryUtilization.site
      ],
      granularity: `second`,
      partitionGranularity: `day`,
      timeDimension: ETime,
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
    cpumem1: {
      measures: [
        CPUMemoryUtilization.avgCPUpctgTotal
      ],
      dimensions: [
        CPUMemoryUtilization.chassistype,
        CPUMemoryUtilization.site
      ],
      timeDimension: CPUMemoryUtilization.ETime,
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
    cpumem2: {
      measures: [
        CPUMemoryUtilization.avgCPUpctgTotal
      ],
      dimensions: [
        CPUMemoryUtilization.manufacturer,
        CPUMemoryUtilization.site
      ],
      timeDimension: CPUMemoryUtilization.ETime,
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
    cpumem3: {
      measures: [
        CPUMemoryUtilization.avgCPUpctgTotal
      ],
      dimensions: [
        CPUMemoryUtilization.registeredprocessor,
        CPUMemoryUtilization.site
      ],
      timeDimension: CPUMemoryUtilization.ETime,
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
    cpumem4: {
      measures: [
        CPUMemoryUtilization.avgCPUpctgTotal
      ],
      dimensions: [
        CPUMemoryUtilization.processorfamily,
        CPUMemoryUtilization.site
      ],
      timeDimension: CPUMemoryUtilization.ETime,
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
    cpumem5: {
      measures: [
        CPUMemoryUtilization.avgCPUpctgTotal
      ],
      dimensions: [
        CPUMemoryUtilization.processormanufacturer,
        CPUMemoryUtilization.site
      ],
      timeDimension: CPUMemoryUtilization.ETime,
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
    cpumem6: {
      measures: [
        CPUMemoryUtilization.avgCPUpctgTotal
      ],
      dimensions: [
        CPUMemoryUtilization.memorysize,
        CPUMemoryUtilization.site
      ],
      timeDimension: CPUMemoryUtilization.ETime,
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
    cpumem7: {
      measures: [
        CPUMemoryUtilization.avgCPUpctgTotal
      ],
      dimensions: [
        CPUMemoryUtilization.operatingsystem,
        CPUMemoryUtilization.site
      ],
      timeDimension: CPUMemoryUtilization.ETime,
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
    cpumem8: {
      measures: [
        DiskIOPerformance.dioperTotal
      ],
      dimensions: [
        DiskIOPerformance.site
      ],
      timeDimension: DiskIOPerformance.ETime,
      granularity: `second`,
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
    cpumem9: {
      measures: [
        CPUMemoryUtilization.avgCPUpctgTotal
      ],
      dimensions: [
        CPUMemoryUtilization.site
      ],
      timeDimension: CPUMemoryUtilization.ETime,
      granularity: `second`,
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
    cpumem10: {
      measures: [
        CPUMemoryUtilization.avgMEMpctgTotal
      ],
      dimensions: [
        CPUMemoryUtilization.site
      ],
      timeDimension: CPUMemoryUtilization.ETime,
      granularity: `second`,
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
    cpumem11: {
      measures: [
        CPUMemoryUtilization.avgVirMEMpctgTotal
      ],
      dimensions: [
        CPUMemoryUtilization.site
      ],
      timeDimension: CPUMemoryUtilization.ETime,
      granularity: `second`,
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
    cpumem12: {
      measures: [
        CPUMemoryUtilization.machinedistcount
      ],
      dimensions: [
        CPUMemoryUtilization.site
      ],
      timeDimension: CPUMemoryUtilization.ETime,
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









  }
});