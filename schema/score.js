import { db_prefix, preparePreagregations
 } from '../prefix';

cube(`scores`, {
  sql: `select id,scr.sc as sc,scr.varfrom as varfrom,scr.varto as varto,scr.rk as rk,
  scr.mw as mw,
  scr.scw as scw,
  scr.cw as cw,
  MetricName,Scores,Category,subcategory,MetricDesc,SpecificInfo from ${db_prefix()}analytics_test.Scores,
JSON_TABLE(Scores,
           '$.range[*]'
           COLUMNS (
           		 rowid FOR ORDINALITY,
           		 varto DECIMAL(12,3) path '$.to ' DEFAULT '0' ON EMPTY,
           		 varfrom DECIMAL(12,3) path '$.from' DEFAULT '0' ON EMPTY,
  				    rk INT PATH '$.rank' DEFAULT '0' ON EMPTY,
  				    sc INT PATH '$.sc' DEFAULT '0' ON EMPTY,
              mw DECIMAL(5,3) PATH '$.mw' DEFAULT '0' ON EMPTY,
              scw DECIMAL(5,3) PATH '$.scw' DEFAULT '0' ON EMPTY,
              cw DECIMAL(5,3) PATH '$.cw' DEFAULT '0' ON EMPTY)
                 ) as scr`,
  title: `Experience Score`,
  description: `DEA Score`,
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
    varto: {
      type: `number`,
      sql: `varto`,
      shown: true,
    },
    varfrom: {
      type: `number`,
      sql: `varfrom`,
      shown: true,
    },
    rk: {
      type: `number`,
      sql: `rk`,
      shown: true,
    },
    mw: {
      type: `number`,
      sql: `mw`,
      shown: true,
    },
    scw: {
      type: `number`,
      sql: `scw`,
      shown: true,
    },
    cw: {
      type: `number`,
      sql: `cw`,
      shown: true,
    },
  },
  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primaryKey: true,
    },

    MetricName: {
      sql: `MetricName`,
      type: `string`,
      title: `Metric Name`,
    },
    Category: {
      sql: `Category`,
      type: `string`,
      title: `Category`,
    },
    subcategory: {
      sql: `subcategory`,
      type: `string`,
      title: `Sub Category`,
    },
    MetricDesc: {
      sql: `MetricDesc`,
      type: `string`,
      title: `Metric Description`,
    },
    SpecificInfo: {
      sql: `SpecificInfo`,
      type: `string`,
      title: `Specific Info`,
    },
    sc: {
      type: `number`,
      sql: `sc`
    },
  },

  preAggregations: {
   /* main: {
      measures: [
         varto, varfrom,rk,sc,mw,scw,cw
      ],
      dimensions: [
        id,SpecificInfo,MetricDesc,subcategory,Category,MetricName,
        scores.manufacturer,
        scores.chassistype,
        scores.registeredprocessor,
        scores.processorfamily,
        scores.processormanufacturer,
        scores.memorysize,
        scores.operatingsystem
      ],
      refreshKey: {
        every: `1 day`,
      },
      indexes: {
        main: {
          columns: [MetricName, SpecificInfo],
        },
      },
    },*/
  },
});
