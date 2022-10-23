import { db_prefix, preparePreagregations } from '../prefix';

cube(`Autoheal`, {
  sql: `SELECT idx,servertime as stime, from_unixtime(servertime,'%Y-%m-%d %H:%i:%s') as dtime,
  customer,machine,username,
  cast((text1->>'$.resolution') AS CHAR) AS 'autoheal1',
  cast((text1->>'$.issueDescription') as CHAR) AS 'issue',
   cast((text1->>'$.operationString') as CHAR) AS 'operationstring',
  clientversion as clientversion
  from  ${db_prefix()}event.Events
  where  scrip = 69
  and ${FILTER_PARAMS.Autoheal.ETime.filter((from, to) => `servertime >= UNIX_TIMESTAMP(${from}) AND servertime  <= UNIX_TIMESTAMP(${to})`)}`,

  title: `Autoheal Analytics `,
  description: `Autoheal Analytics `,

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
    autohealcount: {
      type: `count`,
      //sql: `idx`,

      //filters: [
      //{
      //sql: `${CUBE}.autoheal is not null`,
      //},
      // ],
    },
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
    },

    group: {
      case: {
        when: [
          {
            sql: `${GA.name} is null`,
            label: `Un-Grouped`,
          },
        ],
        else: {
          label: {
            sql: `${GA.name}`,
          },
        },
      },
      type: `string`,
    },

    machine: {
      sql: `machine`,
      type: `string`,
    },

    autoheal1: {
      type: `string`,
      sql: `autoheal1`,
    },

    issuedescription: {
      type: `string`,
      sql: `issue`,
    },

    operationstring: {
      sql: `operationstring`,
      type: `string`,
    },

    username: {
      sql: `username`,
      type: `string`,
    },

    clientver: {
      sql: `clientversion`,
      type: `string`,
    },

    ETime: {
      type: `time`,
      sql: `dtime`,
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
    autoheal: {
      measures: [autohealcount],
      dimensions: [ 
      site,
      issuedescription,
      operationstring,
      manufacturer,
      chassistype,
      registeredprocessor,
      processorfamily,
      processormanufacturer,
      memorysize,
      operatingsystem],
      timeDimension: Autoheal.ETime,
      granularity: `day`,
      partitionGranularity: `month`,
      scheduledRefresh: true,
      type: `rollup`,
      refreshKey: {
        every: `1800 seconds`,
        incremental: true,
        updateWindow: `6 hour`,
      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(servertime),'%Y-%m-%d %H:%i:%s'), current_timestamp()) FROM ${db_prefix()}event.Events`,
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`,
      },
    }
  },
});
