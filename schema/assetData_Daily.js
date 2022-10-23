import { db_prefix, preparePreagregations } from '../prefix';

cube(`AssetDataDaily`, {
  sql: `select from_unixtime(slatest,'%Y-%m-%d') date, id, machineid, slatest, clatest, host, site,
      cast((value->>'$.chassismanufacturer') AS CHAR) as 'manufacturer',
      cast((value->>'$.chassistype' ) AS CHAR) as 'chassistype',
      cast((value->>'$.registeredprocessor' ) AS CHAR) as 'registeredprocessor',
      cast((value->>'$.processorfamily' ) AS CHAR) as 'processorfamily',
      cast((value->>'$.processormanufacturer' ) AS CHAR) as 'processormanufacturer',
      cast((value->>'$.operatingsystem' ) AS CHAR) as 'operatingsystem',
      cast((value->>'$.memorysize' ) AS CHAR) as 'memorysize'
      FROM ${db_prefix()}asset.AssetDataDaily where dataid IN (5,20,16,39) group by machineid
      `,
  // and ${FILTER_PARAMS.AssetDataDaily.LatestDate.filter((from, to) => `slatest >= ${from} AND slatest  <= ${to}`)}
  joins: {
    CA: {
      relationship: 'belongsTo',
      sql: `${CA.site} = ${CUBE}.site and ${CA.host} = ${CUBE}.host`
    },
    GA: {
      relationship: 'belongsTo',
      sql: `${GA.host} = ${CUBE}.host`,
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
    id: {
      sql: `id`,
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
      partitionGranularity: `month`,
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
