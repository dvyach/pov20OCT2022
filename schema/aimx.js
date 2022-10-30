import { db_prefix } from '../prefix';
cube(`AIMX`, {
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
    }
  },
  measures: {
    count: {
      type: `count`,
      shown: true
    },
    machcountgood: {
      type: `countDistinct`,
      sql: `${CUBE}.machine`,
      //  This was added as a test - 
      // sql: `${CA.host}`,
      //sql: `${CA.host} where ${scores.sc} >= 7.5`,
      filters: [{
        sql: `${scores.sc} >= 7.5`
      }]
    },
    machcountbd: {
      type: `countDistinct`,
      sql: `${CUBE}.machine`,
      //  This was added as a test - 
      // sql: `${CA.host}`,
      //${CA.host} where ${scores.sc} <= 3.5`,
      filters: [{
        sql: `${scores.sc} <= 3.5`
      }]
    },
    machcountavg: {
      type: `countDistinct`,
      sql: `${CUBE}.machine`,
      //  This was added as a test - 
      // sql: `${CA.host}`,
      //${CA.host} where ${scores.sc} > 3.5 and ${scores.sc} < 7.5`,
      filters: [{
        sql: `${scores.sc} > 3.5 and ${scores.sc} < 7.5`
      }]
    },
    machcount: {
      type: `countDistinct`,
      sql: `${CUBE}.machine` //sql: `${CA.host}`,

    },
    Metric: {
      type: `avg`,
      sql: `${CUBE}.metric`
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
      primaryKey: true,
      shown: true
    },
    site: {
      sql: `${CUBE}.customer`,
      type: `string` //    title: `Site`,

    },
    scrip: {
      sql: `${CUBE}.scrip`,
      type: `string` //   title: `Dart`,

    },
    machine: {
      sql: `${CUBE}.machine`,
      type: `string` //   title: `Machine`,

    },
    MetricName: {
      type: `string`,
      sql: `${CUBE}.metricname` //    title: `Metric Name`,

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
      sql: `${CUBE}.username`,
      type: `string` //    title: `Username`,

    },
    dtime: {
      sql: `${CUBE}.dtime`,
      type: `time` //  title: `Time`,

    }
  },
  preAggregations: {
    // ---->>Preagg start hide from 
    // AIMXactualscore: {
    //   measures: [ActualScore],
    //   timeDimension: dtime,
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
    // AIMXcatScore: {
    //   // measures: [ActualScore, machcount],
    //   measures: [ActualScore, machcount, machcountavg, machcountbd, machcountgood],
    //   dimensions: [Category],
    //   timeDimension: dtime,
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
    //   // measures: [ActualScore, machcount],
    //   measures: [ActualScore, machcount, machcountavg, machcountbd, machcountgood],
    //   dimensions: [subcategory],
    //   timeDimension: dtime,
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
    //   //  measures: [ActualScore, machcount],
    //   measures: [ActualScore, machcount, machcountavg, machcountbd, machcountgood],
    //   dimensions: [MetricName],
    //   timeDimension: dtime,
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
    //   // measures: [ActualScore, machcount],
    //   measures: [ActualScore, machcount, machcountavg, machcountbd, machcountgood],
    //   dimensions: [MetricDesc],
    //   timeDimension: dtime,
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
    //   // measures: [ActualScore, machcount],
    //   measures: [ActualScore, machcount, machcountavg, machcountbd, machcountgood],
    //   dimensions: [site],
    //   timeDimension: dtime,
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
    //   // measures: [ActualScore, machcount],
    //   measures: [ActualScore, machcount, machcountavg, machcountbd, machcountgood],
    //   dimensions: [group],
    //   timeDimension: dtime,
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
    //   measures: [ActualScore],
    //   dimensions: [Category, subcategory],
    //   timeDimension: dtime,
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
    // }
    // ---->>Preagg hidden till here
    // main: {
    //   measures: [AIMX.machcountbd, AIMX.machcountgood, AIMX.machcountavg],
    //   dimensions: [AIMX.Category],
    //   timeDimension: AIMX.dtime,
    //   granularity: `day`,
    //  // partitionGranularity: `month`,
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
    // }
    aimx1: {
      measures: [AIMX.Metric],
      dimensions: [AIMX.Category, AIMX.MetricName, AIMX.site],
      timeDimension: AIMX.dtime,
      granularity: `hour`,
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
    aimx2: {
      measures: [
        AIMX.machcountavg
      ],
      dimensions: [
        AIMX.Category, AIMX.site
      ],
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
    aimx3: {
      measures: [
        AIMX.machcount,
        AIMX.ActualScore
      ],
      dimensions: [
        AIMX.Category, AIMX.site
      ],
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
    // aimx4: {
    //   measures: [
    //     AIMX.ActualScore
    //   ],
    //   dimensions: [
    //     AIMX.Category ,  AIMX.site
    //   ],
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
    aimx5: {
      type: `rollup`,
      measures: [
        AIMX.ActualScore
      ],
      dimensions: [
        AIMX.Category, AIMX.site
      ],
      timeDimension: AIMX.dtime,
      granularity: `hour`,
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
    aimx6: {
      measures: [
        AIMX.ActualScore,
        AIMX.machcount
      ],
      dimensions: [
        AIMX.Category, AIMX.site
      ],
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
    aimx7: {
      measures: [
        AIMX.Metric
      ],
      dimensions: [
        AIMX.Category,
        AIMX.MetricName, AIMX.site
      ],
      timeDimension: AIMX.dtime,
      granularity: `hour`,
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
    aimx8: {
      measures: [
        AIMX.ActualScore
      ],
      dimensions: [
        AIMX.Category,
        AIMX.subcategory, AIMX.site
      ],
      timeDimension: AIMX.dtime,
      granularity: `hour`,
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
    aimx9: {
      measures: [
        AIMX.machcount,
        AIMX.ActualScore
      ],
      dimensions: [
        AIMX.Category, AIMX.site
      ],
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
    aimx10: {
      measures: [
        AIMX.ActualScore,
        AIMX.machcount
      ],
      dimensions: [
        AIMX.site
      ],
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

    aimx11: {
      measures: [
        AIMX.ActualScore
      ],
      dimensions: [
        AIMX.site
      ],
      timeDimension: AIMX.dtime,
      granularity: `hour`,
      partitionGranularity: `day`,
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
    aimx12: {
      measures: [
        AIMX.machcount,
        AIMX.ActualScore
      ],
      dimensions: [
        AIMX.site
      ],
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
    aimx13: {
      measures: [
        AIMX.ActualScore
      ],
      dimensions: [
        AIMX.site
      ],
      timeDimension: AIMX.dtime,
      granularity: `hour`,
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
    aimx14: {
      measures: [
        AIMX.ActualScore,
        AIMX.machcount
      ],
      dimensions: [
        AIMX.Category, AIMX.site
      ],
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
    aimx15: {
      measures: [
        AIMX.ActualScore,
        AIMX.machcount
      ],
      dimensions: [
        AIMX.site
      ],
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
      },
    },
    aimx16: {
      measures: [
        AIMX.ActualScore
      ],
      dimensions: [
        AIMX.Category, AIMX.site
      ],
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
      },
    },
    aimx17: {
      measures: [
        AIMX.ActualScore
      ],
      dimensions: [
        AIMX.Category, AIMX.site
      ],
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
      },
    },
    aimx18: {
      measures: [
        AIMX.ActualScore
      ],
      dimensions: [
        AIMX.Category,
        AIMX.MetricDesc,
        AIMX.site,
        AIMX.subcategory
      ],
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
      },
    }




  }
});