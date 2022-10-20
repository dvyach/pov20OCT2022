import { db_prefix } from '../prefix';
cube(`AIMX`, {
  sql: `select * from ${BootTimeExperience.sql()} as BootTimeExperience
  UNION
  select * from ${DiskIOPerformanceExperience.sql()} as DiskIOPerformanceExperience
  UNION
  select * from ${DiskUsageExperience.sql()} as DiskUsageExperience
  UNION
  select * from ${LogonTimeExpereince.sql()} as LogonTimeExpereince
  UNION
  select * from ${CPUMemoryUtilizationExperience.sql()} as CPUMemoryUtilizationExperience
  UNION
  select * from ${MemoryUtilizationExperience.sql()} as MemoryUtilizationExperience
  UNION
  select * from ${RunningProcessExperience.sql()} as RunningProcessExperience
  UNION
  select * from ${ProcessCPUUtilzationExperience.sql()} as ProcessCPUUtilzationExperience
  UNION
  select * from ${ProcessMemoryUtilzationExperience.sql()} as ProcessMemoryUtilzationExperience
  UNION
  select * from ${SurveyExperience.sql()} as SurveyExperience
`,
  title: `AIM-X`,
  description: `AIM-X Experience`,
  joins: {
    CA: {
      relationship: 'belongsTo',
      sql: `${CA.site} = {CUBE}.customer and ${CA.host} = ${CUBE}.machine`
    },
    scores: {
      relationship: 'belongsTo',
      sql: `${scores.MetricName} = ${CUBE}.metricname and ${scores.SpecificInfo} = ${CUBE}.other and ${scores.varfrom} <= ${CUBE}.metric and ${scores.varto} > ${CUBE}.metric`
    },
    GA: {
      relationship: 'belongsTo',
      sql: `${GA.host} = ${CUBE}.machine`
    }
  },
  measures: {
    count: {
      type: `count`,
      shown: true
    },
    machcountgood: {
      type: `countDistinct`,
      sql: `machine`,
      filters: [{
        sql: `${scores.sc} >= 7.5`
      }]
    },
    machcountbd: {
      type: `countDistinct`,
      sql: `machine`,
      filters: [{
        sql: `${scores.sc} <= 3.5`
      }]
    },
    machcountavg: {
      type: `countDistinct`,
      sql: `machine`,
      filters: [{
        sql: `${scores.sc} > 3.5 and ${scores.sc} < 7.5`
      }]
    },
    machcount: {
      type: `countDistinct`,
      sql: `machine`,
    },

    Metric: {
      type: `avg`,
      sql: `metric`
    },
    ActualScore: {
      type: `avg`,
      sql: `${scores.sc}`
    },
    MetricWt: {
      type: `avg`,
      sql: `${scores.sc} * ${scores.mw}`
    },
    SubCatWt: {
      type: `avg`,
      sql: `${scores.sc} * ${scores.scw}`
    },
    CatWt: {
      type: `avg`,
      sql: `${scores.sc} * ${scores.cw}`
    }
  },
  dimensions: {
    idx: {
      sql: `idx`,
      type: `number`,
      primaryKey: true
    },
    site: {
      sql: `customer`,
      type: `string` //    title: `Site`,

    },
    scrip: {
      sql: `scrip`,
      type: `string` //   title: `Dart`,

    },
    machine: {
      sql: `machine`,
      type: `string` //   title: `Machine`,

    },
    MetricName: {
      type: `string`,
      sql: `metricname` //    title: `Metric Name`,

    },
    MetricDesc: {
      type: `string`,
      case: {
        when: [{
          sql: `${scores.MetricDesc} is null`,
          label: 'Others'
        }],
        else: {
          label: {
            sql: `${scores.MetricDesc}`
          }
        }
      } //   title: `Component`,

    },
    Other: {
      type: `string`,
      sql: `other` // title: `Services`,

    },
    Category: {
      type: `string`,
      case: {
        when: [{
          sql: `${scores.Category} is null`,
          label: 'Others'
        }],
        else: {
          label: {
            sql: `${scores.Category}`
          }
        }
      } //    title: `Category`,

    },
    subcategory: {
      type: `string`,
      case: {
        when: [{
          sql: `${scores.subcategory} is null`,
          label: 'Others'
        }],
        else: {
          label: {
            sql: `${scores.subcategory}`
          }
        }
      },
      title: `Sub Category`
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
      type: `string` //    title: `Group`,

    },
    username: {
      sql: `username`,
      type: `string` //    title: `Username`,

    },
    dtime: {
      sql: `dtime`,
      type: `time` //  title: `Time`,

    }
  },
  preAggregations: {
    AIMXcatScore: {
      measures: [AIMX.ActualScore, AIMX.machcount, AIMX.machcountavg, AIMX.machcountbd, AIMX.machcountgood],
      dimensions: [AIMX.Category],
      timeDimension: AIMX.dtime,
      granularity: `day`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      refreshKey: {
        every: `3600 seconds`,
        incremental: true
      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`
      }
    },
    AIMXsubcatScore: {
      measures: [AIMX.ActualScore, AIMX.machcount, AIMX.machcountavg, AIMX.machcountbd, AIMX.machcountgood],
      dimensions: [AIMX.subcategory],
      timeDimension: AIMX.dtime,
      granularity: `day`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      refreshKey: {
        every: `3600 seconds`,
        incremental: true
      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`
      }
    },
    AIMXMnameScore: {
      measures: [AIMX.ActualScore, AIMX.machcount, AIMX.machcountavg, AIMX.machcountbd, AIMX.machcountgood],
      dimensions: [AIMX.MetricName],
      timeDimension: AIMX.dtime,
      granularity: `day`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      refreshKey: {
        every: `3600 seconds`,
        incremental: true
      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`
      }
    },
    AIMXMdescScore: {
      measures: [AIMX.ActualScore, AIMX.machcount, AIMX.machcountavg, AIMX.machcountbd, AIMX.machcountgood],
      dimensions: [AIMX.MetricDesc],
      timeDimension: AIMX.dtime,
      granularity: `day`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      refreshKey: {
        every: `3600 seconds`,
        incremental: true
      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`
      }
    },
    AIMXsite: {
      measures: [AIMX.ActualScore, AIMX.machcount, AIMX.machcountavg, AIMX.machcountbd, AIMX.machcountgood],
      dimensions: [AIMX.site],
      timeDimension: AIMX.dtime,
      granularity: `day`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      refreshKey: {
        every: `3600 seconds`,
        incremental: true
      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`
      }
    },
    AIMXgroup: {
      measures: [AIMX.ActualScore, AIMX.machcount, AIMX.machcountavg, AIMX.machcountbd, AIMX.machcountgood],
      dimensions: [AIMX.group],
      timeDimension: AIMX.dtime,
      granularity: `day`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      refreshKey: {
        every: `3600 seconds`,
        incremental: true
      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`
      }
    },
      AIMXcatsubcat: {
      measures: [AIMX.ActualScore],
      dimensions: [AIMX.Category, AIMX.subcategory],
      timeDimension: AIMX.dtime,
      granularity: `day`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      refreshKey: {
        every: `3600 seconds`,
        incremental: true
      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`
      }
    },
    
  }
});