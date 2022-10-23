import { db_prefix } from '../prefix';
cube(`AIMX2`, {
  sql: `select * from ${BootTimeExp.sql()} as BootTimeExp
  UNION
  select * from ${CPUMemoryUtilExp.sql()} as CPUMemoryUtiliExp
  UNION
  select * from ${DiskUsageExp.sql()} as DiskUsageExp
  UNION
  select * from ${LogonTimeExp.sql()} as LogonTimeExp
  UNION
  select * from ${MemoryUtilExp.sql()} as MemoryUtilExp
  UNION
  select * from ${RunningProcessExp.sql()} as RunningProcessExp
  UNION
  select * from ${ProcessCPUUtilExp.sql()} as ProcessCPUUtilzationExperience
  UNION
  select * from ${ProcessMemoryUtilExp.sql()} as ProcessMemoryUtilExp
  UNION
  select * from ${DiskIOExp.sql()} as DiskIOExp
  UNION
  select * from ${SurveyExp.sql()} as SurveyExp
`,
  title: `AIM-X`,
  description: `AIM-X Experience`,
  joins: {
    CA: {
      relationship: 'belongsTo',
      sql: `${CA.site} = ${CUBE}.customer and ${CA.host} = ${CUBE}.machine`
    },
    scores: {
      relationship: 'belongsTo',
      sql: `${scores.MetricName} = ${CUBE}.metricname and ${scores.SpecificInfo} = ${CUBE}.other and ${scores.varfrom} <= ${CUBE}.metric and ${scores.varto} > ${CUBE}.metric`
    },
    GA: {
      relationship: 'belongsTo',
      sql: `${GA.host} = ${CUBE}.machine`
    },
    combinedassets: {
      relationship: 'belongsTo',
      sql: `${combinedassets.site} = ${CUBE}.customer and ${combinedassets.host} = ${CUBE}.machine`,
    },
  },
  measures: {
    count: {
      type: `count`,
      shown: true,
    },
    machcount: {
      type: `countDistinct`,
      sql: `machine`,
     // shown: false,
    },

    MetricTotal: {
      type: `sum`,
      sql: `metric`,
    //  shown: false,
    },

    // lastTotal: {
    //   type: `sum`,
    //   sql: `last`,
    //   shown: false,
    // },

    ActualScoreTotal: {
      type: `sum`,
      sql: `${scores.sc}`,
     // shown: false,
    },

    MetricWt: {
      type: `sum`,
      sql: `${scores.mw}`,
     // shown: false,
    },

    SubCatWt: {
      type: `sum`,
      sql: `${scores.scw}`,
   //   shown: false,
    },

    CatWt: {
      type: `sum`,
      sql: `${scores.cw}`,
     // shown: false,
    },

    // changeTotal: {
    //   type: `sum`,
    //   sql: `metric-last`,
    //   shown: false,
    // },

    MetricWtTotal: {
      type: `sum`,
      sql: `${scores.sc} * ${scores.mw}`,
     // shown: false,
    },

    SubCatWtTotal: {
      type: `sum`,
      sql: `${scores.sc} * ${scores.scw}`,
    //  shown: false,
    },
    CatWtTotal: {
      type: `sum`,
      sql: `${scores.sc} * ${scores.cw}`,
     // shown: false,
    },

    Metric: {
      type: `number`,
      sql: `${MetricTotal} / NULLIF(${count}, 0)`,
      //  drillMembers: [machine, Metric, last, change, ActualScore],
      title: `Metric`,
    },

    MetricWtScore: {
      type: `number`,
      sql: `${MetricWtTotal} / NULLIF(${count}, 0)`,
      //  drillMembers: [machine, Metric, MetricWtScore, last, change, ActualScore],
      title: `Metric Score`,
    },

    SubCatWtScore: {
      type: `number`,
      sql: `${SubCatWtTotal} / NULLIF(${count}, 0)`,
      //  drillMembers: [machine, Metric, SubCatWtScore, last, change, ActualScore],
      title: `Sub Category Score`,
    },

    CatWtScore: {
      type: `number`,
      sql: `${CatWtTotal} / NULLIF(${count}, 0)`,
      //  drillMembers: [machine, Metric, CatWtScore, last, change, ActualScore],
      title: `Category Score`,
    },

    ActualScore: {
      type: `number`,
      sql: `${ActualScoreTotal} / NULLIF(${count}, 0)`,
     // drillMembers: [machine, Category, subcategory, MetricDesc, ActualScore, MetricName, Metric, last, change],
      title: `Score`,
    },

    // last: {
    //   type: `number`,
    //   sql: `${lastTotal} / NULLIF(${count}, 0)`,
    //   title: `Previous Metric`,
    // },

    mcount: {
      type: `number`,
      sql: `${machcount}`,
      title: `Device Count`,
    },

    // change: {
    //   type: `number`,
    //   sql: `${changeTotal} / NULLIF(${count}, 0)`,
    //   title: `Metric Change`,
    // },
    // measures with average - new
    // count: {
    //   type: `count`,
    //   shown: true
    // },
    // machcountgood: {
    //   type: `countDistinct`,
    //   sql: `machine`,
    //   filters: [{
    //     sql: `${scores.sc} >= 7.5`
    //   }]
    // },
    // machcountbd: {
    //   type: `countDistinct`,
    //   sql: `machine`,
    //   filters: [{
    //     sql: `${scores.sc} <= 3.5`
    //   }]
    // },
    // machcountavg: {
    //   type: `countDistinct`,
    //   sql: `machine`,
    //   filters: [{
    //     sql: `${scores.sc} > 3.5 and ${scores.sc} < 7.5`
    //   }]
    // },
    // machcount: {
    //   type: `countDistinct`,
    //   sql: `machine`,
    // },

    // Metric: {
    //   type: `avg`,
    //   sql: `metric`
    // },
    // ActualScore: {
    //   type: `avg`,
    //   sql: `${scores.sc}`
    // },
    // MetricWt: {
    //   type: `avg`,
    //   sql: `${scores.sc} * ${scores.mw}`
    // },
    // SubCatWt: {
    //   type: `avg`,
    //   sql: `${scores.sc} * ${scores.scw}`
    // },
    // CatWt: {
    //   type: `avg`,
    //   sql: `${scores.sc} * ${scores.cw}`
    // }
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
//old preagg
MDCount: {
      type: `rollup`,
      measures: [
        MetricTotal,
      //  lastTotal,
       // changeTotal,
        ActualScoreTotal,
        count,
        CatWt,
        SubCatWt,
        MetricWt,
        MetricWtTotal,
        SubCatWtTotal,
        CatWtTotal,
        mcount,
        machcount,
      ],
      dimensions: [site, scrip, machine, group, username, MetricName, MetricDesc, Category, subcategory, Other],
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
//new preagg
    // AIMXcatScore: {
    //   measures: [AIMX.ActualScore, AIMX.machcount, AIMX.machcountavg, AIMX.machcountbd, AIMX.machcountgood],
    //   dimensions: [AIMX.Category],
    //   timeDimension: AIMX.dtime,
    //   granularity: `day`,
    //   partitionGranularity: `month`,
    //   scheduledRefresh: true,
    //   refreshKey: {
    //     every: `3600 seconds`,
    //     incremental: true
    //   },
    //   buildRangeStart: {
    //     sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
    //   },
    //   buildRangeEnd: {
    //     sql: `SELECT NOW()`
    //   }
    // },
    // AIMXsubcatScore: {
    //   measures: [AIMX.ActualScore, AIMX.machcount, AIMX.machcountavg, AIMX.machcountbd, AIMX.machcountgood],
    //   dimensions: [AIMX.subcategory],
    //   timeDimension: AIMX.dtime,
    //   granularity: `day`,
    //   partitionGranularity: `month`,
    //   scheduledRefresh: true,
    //   refreshKey: {
    //     every: `3600 seconds`,
    //     incremental: true
    //   },
    //   buildRangeStart: {
    //     sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
    //   },
    //   buildRangeEnd: {
    //     sql: `SELECT NOW()`
    //   }
    // },
    // AIMXMnameScore: {
    //   measures: [AIMX.ActualScore, AIMX.machcount, AIMX.machcountavg, AIMX.machcountbd, AIMX.machcountgood],
    //   dimensions: [AIMX.MetricName],
    //   timeDimension: AIMX.dtime,
    //   granularity: `day`,
    //   partitionGranularity: `month`,
    //   scheduledRefresh: true,
    //   refreshKey: {
    //     every: `3600 seconds`,
    //     incremental: true
    //   },
    //   buildRangeStart: {
    //     sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
    //   },
    //   buildRangeEnd: {
    //     sql: `SELECT NOW()`
    //   }
    // },
    // AIMXMdescScore: {
    //   measures: [AIMX.ActualScore, AIMX.machcount, AIMX.machcountavg, AIMX.machcountbd, AIMX.machcountgood],
    //   dimensions: [AIMX.MetricDesc],
    //   timeDimension: AIMX.dtime,
    //   granularity: `day`,
    //   partitionGranularity: `month`,
    //   scheduledRefresh: true,
    //   refreshKey: {
    //     every: `3600 seconds`,
    //     incremental: true
    //   },
    //   buildRangeStart: {
    //     sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
    //   },
    //   buildRangeEnd: {
    //     sql: `SELECT NOW()`
    //   }
    // },
    // AIMXsite: {
    //   measures: [AIMX.ActualScore, AIMX.machcount, AIMX.machcountavg, AIMX.machcountbd, AIMX.machcountgood],
    //   dimensions: [AIMX.site],
    //   timeDimension: AIMX.dtime,
    //   granularity: `day`,
    //   partitionGranularity: `month`,
    //   scheduledRefresh: true,
    //   refreshKey: {
    //     every: `3600 seconds`,
    //     incremental: true
    //   },
    //   buildRangeStart: {
    //     sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
    //   },
    //   buildRangeEnd: {
    //     sql: `SELECT NOW()`
    //   }
    // },
    // AIMXgroup: {
    //   measures: [AIMX.ActualScore, AIMX.machcount, AIMX.machcountavg, AIMX.machcountbd, AIMX.machcountgood],
    //   dimensions: [AIMX.group],
    //   timeDimension: AIMX.dtime,
    //   granularity: `day`,
    //   partitionGranularity: `month`,
    //   scheduledRefresh: true,
    //   refreshKey: {
    //     every: `3600 seconds`,
    //     incremental: true
    //   },
    //   buildRangeStart: {
    //     sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`
    //   },
    //   buildRangeEnd: {
    //     sql: `SELECT NOW()`
    //   }
    // },
    // AIMXcatsubcat: {
    //   measures: [AIMX.ActualScore],
    //   dimensions: [AIMX.Category, AIMX.subcategory],
    //   timeDimension: AIMX.dtime,
    //   granularity: `day`,
    //   partitionGranularity: `month`,
    //   scheduledRefresh: true,
    //   refreshKey: {
    //     every: `3600 seconds`,
    //     incremental: true
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