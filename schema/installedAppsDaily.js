import { db_prefix, preparePreagregations } from '../prefix';
 cube('InstalledAppsDaily', {
 sql: `select id, machineid, from_unixtime(slatest,'%Y-%m-%d') date, clatest, host, site, dataid,
      cast((value->>'$.version') AS CHAR) as 'version',
      cast((value->>'$.installationdate' ) AS CHAR) as 'installationdate',
      cast((value->>'$.estimatedsizeinkb' ) AS CHAR) as 'estimatedsizeinkb',
      cast((value->>'$.installedsoftwarenames' ) AS CHAR) as 'installedsoftwarenames'
      FROM ${db_prefix()}asset.AssetDataDaily where dataid = '36'  group by installedsoftwarenames , version, host, installationdate `,
       joins: {
    CA: {
      relationship: 'belongsTo',
      sql: `${CA}.site = ${CUBE}.site and ${CA}.host = ${CUBE}.host`
    },
    GA: {
      relationship: 'belongsTo',
      sql: `${GA}.host = ${CUBE}.host`,
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
      shown: false,
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
      NameVersion: {
      sql: `NameVersion`,
      type: `string`,
    },
    version: {
      sql: ` version`,
      type: `string`,
      title: `version`,
    },
    installationdate: {
      sql: ` installationdate`,
      type: `string`,
      title: `installationdate`,
    },
    estimatedsizeinkb: {
      sql: ` estimatedsizeinkb`,
      type: `string`,
      title: `estimatedsizeinkb`,
    },
    installedsoftwarenames: {
      sql: ` installedsoftwarenames`,
      type: `string`,
      title: `installedsoftwarenames`,
    },
  },
  preAggregations: {
    dv: {
      granularity: `day`,
      partitionGranularity: `month`,
      timeDimension: LDate,
      measures: [count],
      dimensions: [site,host,version,installationdate, estimatedsizeinkb,installedsoftwarenames],
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
