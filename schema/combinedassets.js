import { db_prefix, preparePreagregations } from '../prefix';

cube(`combinedassets`, {
  sql: `SELECT machineid, host, site, 
      a5manufacturer as 'manufacturer',
      a5chassistype as 'chassistype', 
      a20registeredprocessor as 'registeredprocessor', 
      a20processorfamily as 'processorfamily',
      a20processormanufacturer as 'processormanufacturer',
      a16operatingsystem as 'operatingsystem', 
      a39memorysize as 'memorysize',
      slatest as 'date'
      FROM ${db_prefix()}asset.LatestCombinedAsset
      `,
  // and ${FILTER_PARAMS.AssetDataDaily.LatestDate.filter((from, to) => `slatest >= ${from} AND slatest  <= ${to}`)}
  joins: {
    CA: {
      relationship: `belongsTo`,
      sql: `${CUBE}.customer = ${CA.site} and ${CUBE}.machine = ${CA.host}`,
    },
    GA: {
      relationship: `belongsTo`,
      sql: `${CUBE}.machine = ${GA.host}`,
    },
  },
  measures: {
    count: {
      type: `count`,
      sql: `machineid`,
      title: `count`,
    },
  },
  dimensions: {
    identifier: {
      sql: `machineid`,
      type: `number`,
      primaryKey: true,
      shown: true
    },

    dataid: {
      sql: `dataid`,
      type: `number`,
      title: `dataid`,
    },

    clatest: {
      sql: `clatest`,
      type: `number`,
      title: `clatest`,
    },

    site: {
      sql: `site`,
      type: `string`,
      title: `Site`,
    },

    host: {
      sql: `host`,
      type: `string`,
      title: `host`,
    },

    LDate: {
      sql: `date`,
      type: `time`,
      title: `Latest Date`,
    },

    // from dataid=5
    manufacturer: {
      sql: ` manufacturer`,
      type: `string`,
      title: `manufacturer`,
    },
    chassistype: {
      sql: ` chassistype`,
      type: `string`,
      title: `chassistype`,
    },
    // from dataid=20
    registeredprocessor: {
      sql: ` registeredprocessor`,
      type: `string`,
      title: `registeredprocessor`,
    },
    processorfamily: {
      sql: ` processorfamily`,
      type: `string`,
      title: `processorfamily`,
    },
    processormanufacturer: {
      sql: ` processormanufacturer`,
      type: `string`,
      title: `processormanufacturer`,
    },
    // from dataid=16
    operatingsystem: {
      sql: ` operatingsystem`,
      type: `string`,
      title: `operatingsystem`,
    },
    // from dataid=39
    memorysize: {
      sql: ` memorysize`,
      type: `string`,
      title: `memorysize`,
    },
  },
  preAggregations: {
    dv: {
      granularity: `day`,
      partitionGranularity: `day`,
      timeDimension: LDate,
      measures: [count],
      dimensions: [site, host, manufacturer, processormanufacturer, processorfamily, registeredprocessor,memorysize,operatingsystem,chassistype],
      scheduledRefresh: true,
      type: `rollup`,
      refreshKey: {
        every: `1800 seconds`,
        incremental: true,
      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(clatest),'%Y-%m-%d'), current_timestamp()) FROM ${db_prefix()}asset.AssetDataDaily`,
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`,
      },
    },
  },
});
