import { db_prefix, preparePreagregations } from '../prefix';

cube(`DiskIOPerformanceExperience`, {
  sql: `SELECT idx,scrip,customer,machine,username, servertime, from_unixtime(servertime,'%Y-%m-%d %H:%i:%s') as dtime,
         cast((text1->>'$.realTimeDiskIOPct') AS SIGNED) AS 'metric',
         'DiskIO' as 'metricname',
         '' AS 'other'
        from ${db_prefix()}event.Events
        where scrip = 97 
        and ${FILTER_PARAMS.AIMX.dtime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
        and ${FILTER_PARAMS.DiskIOPerformanceExperience.dtime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}
        `,
  title: `DiskIO Performance Exp`,
  description: `DiskIO Performance Exp`,
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
    count:{
      type: `count`,
    },
    metriccount:{
      sql: `metric`,
      type: `count`,
    },
  },
  dimensions: {
    idx: {
      sql: `idx`,
      type: `number`,
      primaryKey: true,
    },
    dtime: {
      sql: `dtime`,
      type: `time`,
      title: `Time`,
    },

    metricname:{
      sql: `metricname`,
      type: `string`,
      title: `metricname`
    },

    other:{
      sql: `other`,
      type: `string`,
      title: `other`,
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
    diskioexpcount: {
      measures: [count,metriccount],
      dimensions:[dtime,metricname,other, 
      manufacturer, 
      chassistype, 
      operatingsystem, 
      memorysize, 
      processormanufacturer, 
      registeredprocessor, 
      processorfamily],
      timeDimension: dtime,
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
      },
    },
  },
});
