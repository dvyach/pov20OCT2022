cube('NotA36', {
  sql: `select
      mcoapp.machineid, 
      mcoapp.host,
      mcoapp.cust as site,    
	  mcoapp.NameVersion,
	  mcoapp.name,
	  mcoapp.version,
	  (adin.adNV IS  NULL )  as not_istalled ,
      (adin.adNV IS NOT  NULL )  as  istalled  
     from 
 (select 
  CONCAT(name, '-' ,version) as NameVersion,
  coapp.name,
  coapp.version,
  m.machineid ,
  m.cust ,
  m.host 
from  
  asset.coapp as coapp
inner join 
  asset.Machine m   ) as mcoapp
  left join 
  asset.NotA36Daily_tmp as adin
	 on
	 ( mcoapp.machineid = adin.machineid  and mcoapp.NameVersion =  adin.adNV  )
  `,

  preAggregations: {  
    mainV2: {
      type: `originalSql`,
      scheduledRefresh: true,
      refreshKey: {
        every: `1 day`,
      }, 
      indexes: {
        NameVersion: {
          columns: ['NameVersion'],
        },
        site: {
          columns: ['site'],
        },
        host: {
          columns: ['host'],
        },
      },
    },
  },

  joins: { 
  },

  measures: { 
    softwarecount: {
      type: `countDistinct`,
      sql: `NameVersion`,
    }, 
    devicecount: {
    sql: `host`,
    type: `countDistinct`,
     }, 
    istalledSum: {
      type: `sum`,
      sql: `istalled`,
      title: `istalledSum`,

    }, 
    notIstalledSum: {
      type: `sum`,
      sql: `not_istalled`,
      title: `NotIstalledSum`,

    }, 

    HasNotInstalled: { // the same as HasNotInstalledV2
      type: `countDistinct`,
      sql: `machineid`,
      title: `HasNotInstalled`,
      filters: [{ sql: `${CUBE}.not_istalled != 0` }],
    }, 

    HasNotInstalledV2: {// the same as HasNotInstalled
      type: `number`,
      sql: `${istalledSum} < ${softwarecount}`,
      title: `HasNotInstalledV2`, 
    }, 
 
  },

  dimensions: {
    id: {
      sql: `CONCAT(NameVersion, machineid )`,
      type: `string`,
      primaryKey: true,
      shown: true
    },

    NameVersion: {
      sql: `NameVersion`,
      type: `string`,
    },
    Name: {
      sql: `name`,
      type: `string`,
    },
    Version: {
      sql: `version`,
      type: `string`,
    },
    machineId: {
      sql: `machineid`,
      type: `number`,
    }, 
    site: {
      sql: `site`,
      type: `string`,
    },
    host: {
      sql: `host`,
      type: `string`,
    },
    not_istalled: {
      sql: `not_istalled`,
      type: `number`,
    },
    istalled: {
      sql: `istalled`,
      type: `number`,
    }, 
  }
});
