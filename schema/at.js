import { db_prefix } from '../prefix';

cube(`AT`, {
  sql: `select MetricName,Category,subcategory,MetricDesc, SpecificInfo,Impact,Score,GoodScore,Value from ${db_prefix()}analytics_test.Metrics`,
  title: ` Analytics Metrics`,
  description: ` Analytics Metrics`,

  joins: {},

  measures: {},

  dimensions: {
    cid: {
      sql: `id`,
      type: `number`,
      primaryKey: true,
      shown: false,
    },
  },
  preAggregations: {},
});

