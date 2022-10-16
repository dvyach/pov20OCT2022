/**
 * Common config
 */
const MySQLDriver = require('@cubejs-backend/mysql-driver');

const schemaId = `${process.env.CI_PIPELINE_ID || '0'}`;

if (!process.env.CUBEJS_DB_HOST) {
  process.env.CUBEJS_DB_HOST = process.env.DB_HOST;
}
if (!process.env.CUBEJS_DB_PORT) {
  process.env.CUBEJS_DB_PORT = process.env.DB_PORT;
}
if (!process.env.CUBEJS_DB_PASS) {
  process.env.CUBEJS_DB_PASS = process.env.DB_PASSWORD;
}
if (!process.env.CUBEJS_DB_USER) {
  process.env.CUBEJS_DB_USER = process.env.DB_USERNAME || 'weblog';
}
/*if (!process.env.CUBEJS_DB_NAME) {
   process.env.CUBEJS_DB_NAME = (process.env.DB_PREFIX || '') + process.env.DB_DATABASE;
 }*/

const queueOptions = {
  concurrency: process.env.CUBEJS_CONCURRENCY || 120,
  continueWaitTimeout: 10,
  executionTimeout: process.env.CUBEJS_EXECUTION_TIMEOUT || 2000,
  orphanedTimeout: process.env.CUBEJS_ORPHANED_TIMEOUT || 240,
  heartBeatInterval: 90,
};

module.exports = {
  basePath: `/analyticsapi/cubejs-api`,
  webSocketsBasePath: `/analyticsapi/cubejs-api`,
  orchestratorOptions: {
    queryCacheOptions: {
      backgroundRenew: true,
      queueOptions,
    },
    preAggregationsOptions: { queueOptions },
  },
  externalDriverFactory: () =>
    new MySQLDriver({
      host: process.env.CUBEJS_DB_HOST,
      //database: process.env.CUBEJS_DB_NAME,
      port: process.env.CUBEJS_DB_PORT,
      user: process.env.CUBEJS_DB_USER,
      password: process.env.CUBEJS_DB_PASS,
    }),
  queryRewrite: (query, { securityContext }) => {
    console.log(`InQuery:${JSON.stringify(query)}`, securityContext);
    if (!securityContext) {
      console.error(`securityContext is empty on query ${JSON.stringify(query)}`);
      throw `securityContext is empty on query ${JSON.stringify(query)}`;
    }

    if (securityContext.apiType === `sql`) {
      /**
       * We use SQL API
       * @Note We can get from database or mportal or visualisationservice list of avaliable machines/sites/group by username
       * Or we can add it in filters param instead of securityContext
       */
    }

    CubeVal = query.measures[0] ? query.measures[0].split('.')[0] : query.dimensions[0].split('.')[0];
    if (securityContext.type == 'site') {
      if (securityContext.name != 'All') {
        query.filters.push({
          member: CubeVal + '.site',
          operator: 'equals',
          values: securityContext.name ? [securityContext.name] : [],
        });
      }
    } else if (securityContext.type == 'group') {
      query.filters.push({
        member: 'GA.name',
        operator: 'equals',
        values: [securityContext.name],
      });
    } else if (securityContext.type == 'machine') {
      query.filters.push({
        member: CubeVal + '.machine',
        operator: 'equals',
        values: securityContext.name ? [securityContext.name] : [],
      });
    }

    query.dimensions = query.dimensions.map(d => {
      if (d === 'Census.machine') {
        return 'Census.host';
      }
      if (d === 'Census.group') {
        return 'GA.name';
      }
      if (d === 'Census.group') {
        return 'GA.name';
      }
      if (d === 'Census.group') {
        return 'GA.name';
      }
      return d;
    });

    query.filters = query.filters.map(d => {
      if (d.member === 'Census.machine') {
        d.member = 'Census.host';
      }
      if (d.member === 'Census.group') {
        d.member = 'GA.name';
      }
      if (d.dimension === 'Census.machine') {
        d.dimension = 'Census.host';
      }
      if (d.dimension === 'Census.group') {
        d.dimension = 'GA.name';
      }
      if (d.member === 'Census.group') {
        d.member = 'GA.name';
      }
      if (d.dimension === 'Census.machine') {
        d.dimension = 'Census.host';
      }
      if (d.dimension === 'Census.group') {
        d.dimension = 'GA.name';
      }
      if (d.member === 'Census.group') {
        d.member = 'GA.name';
      }
      if (d.dimension === 'Census.machine') {
        d.dimension = 'Census.host';
      }
      if (d.dimension === 'Census.group') {
        d.dimension = 'GA.name';
      }
      return d;
    });

    console.log(`OutQuery:${JSON.stringify(query)}`, securityContext);

    // if (process.env.CopyTablesService !== undefined) {
    //   const q2 = JSON.parse(JSON.stringify(query).replace(/"AASG\./gim, '"group_AASG.'));
    //   console.log(`q2:${JSON.stringify(q2)}`);
    //   return q2;
    // }

    return query;
  },
  scheduledRefreshTimer: 60,
  schemaVersion: ({ authInfo }) => `${schemaId}`,
  contextToAppId: ({ securityContext }) =>
    `CUBEJS_APP_${process.env.DB_PREFIX || ''}_${securityContext.appId || `default`}_${securityContext.appSchema || `default`}`,
  preAggregationsSchema: ({ securityContext }) =>
    `${process.env.DB_PREFIX || ''}${process.env.CUBE_DB_PREFIX || ''}pre_aggregations_${securityContext.appId || `default`}_${
      securityContext.appSchema || `default`
    }`,
  driverFactory: ({ dataSource } = {}) => {
    if (dataSource === 'prefix') {
      console.log(`request for prefixed DB`);
      return new MySQLDriver({
        host: process.env.CUBEJS_DB_HOST,
        port: process.env.CUBEJS_DB_PORT,
        user: process.env.CUBEJS_DB_USER,
        password: process.env.CUBEJS_DB_PASS,
        //   database: (process.env.DB_PREFIX || '') + process.env.DB_DATABASE,
      });
    }
    return new MySQLDriver({
      host: process.env.CUBEJS_DB_HOST,
      port: process.env.CUBEJS_DB_PORT,
      user: process.env.CUBEJS_DB_USER,
      password: process.env.CUBEJS_DB_PASS,
      //   database: process.env.DB_DATABASE,
    });
  },
  scheduledRefreshContexts: async () => {
    const all = Object.keys(process.env)
      .filter(key => {
        return key.indexOf(`CUBEJS_DB_HOST_`) === 0;
      })
      .map(key => {
        return {
          securityContext: {
            appId: `${key}`,
            appSchema: `${schemaId}`,
          },
        };
      });
    all.push({
      appId: `default`,
      appSchema: `${schemaId}`,
    });
    //console.log(`scheduledRefreshContexts:`, all);
    return all;
  },
  checkSqlAuth: async (req, username) => {
    /**
     * Allow connection for any username if password === process.env.CUBE_SQL_PASSWORD
     * Note: security checks will happen on the sql-proxy service. Here we can trust all incoming connections.
     *
     * Create almost the same securityContext, only user name is different.
     */
    //console.log(`checkSqlAuth:`, username, req);
    return {
      password: process.env.CUBE_SQL_PASSWORD,
      securityContext: {
        // type: '', // site | machine | group
        // name: '', // searchValue (group or site name)
        username,
        schema: 3,
        apiType: `sql`, // Allow checking what API type we use.
        appId: process.env.APP_CUBEJS_ID || '',
        appShema: process.env.APP_CUBEJS_SCHEMA || '',
        // machines: [], // array of string
      },
    };
  },
};
