import { db_prefix } from '../prefix';

cube(`A36_Installed_apps`, {
  sql: `
  WITH recursive Date_Ranges AS ( 
    select 
      ( 
        SELECT 
          from_unixtime(MIN(clatest), '%Y-%m-%d %H:%i:%s') 
        FROM 
          asset.AssetData 
      ) as Date 
    union all 
    select 
      Date + interval 1 day 
    from 
      Date_Ranges 
    where 
      Date < NOW() - interval 1 day 
  ) 
  select  
    STR_TO_DATE(aall.Date,'%Y-%m-%d %H:%i:%s') as Date, 
    aall.mId as machineid, 
    aall.msite as location, 
    aall.mhost as device, 
    aall.maxSlatest as slatest,
    ad.value ->> '$.installedsoftwarenames' as installedsoftwarenames, 
    ad.value ->> '$.version' as version, 
    ad.value ->> '$.installationdate' as installationdate 
  from 
    (
      select 
        Date_Ranges.Date, 
        UNIX_TIMESTAMP(Date_Ranges.Date) as unixDate, 
        m.machineid as mId, 
        m.cust as msite, 
        m.host as mhost, 
        ( 
          select 
            max(slatest) 
          from 
            asset.AssetData as adt 
          where 
            UNIX_TIMESTAMP(Date_Ranges.Date) > adt.slatest 
            and m.machineid = adt.machineid 
            and adt.dataid = 36 
        ) as maxSlatest 
      from 
        Date_Ranges 
        join asset.Machine m 
    ) as aall 
   left join asset.AssetData as ad on aall.mId = ad.machineid and aall.maxSlatest =  ad.slatest
  where  
  ${FILTER_PARAMS.A36_Installed_apps.LatestDate.filter(
    (from, to) => `aall.Date >= STR_TO_DATE(${from},'%Y-%m-%dT%H:%i:%s') AND aall.Date  <  STR_TO_DATE(${to},'%Y-%m-%dT%H:%i:%s')`,
  )}  
    and ad.dataid = 36  
`,
  title: `Installed apps`,
  description: `Installed apps`,
  
  joins: {
    GA: {
      relationship: 'belongsTo',
      sql: `${GA}.host = ${CUBE}.device`,
    },
  },
  measures: {
    count: {
      type: `count`,
      sql: `machineid`,
      title: `count`,
      drillMembers: [site, Device, machineId, installedsoftwarenames, version, installationdate],
    },
  },
  dimensions: {
    id: {
      sql: `CONCAT(date, machineid, installedsoftwarenames, version)`,
      type: `number`,
      primaryKey: true,
      shown: false,
    },

    machineId: {
      sql: `machineid`,
      type: `number`,
    },

    installedsoftwarenames: {
      sql: `installedsoftwarenames`,
      type: `string`,
      title: `Software Name`,
    },

    version: {
      sql: `version`,
      type: `string`,
      title: `Version`,
    },

    installationdate: {
      sql: `installationdate`,
      type: `string`,
      title: `installationdate`,
    },

    site: {
      sql: `location`,
      type: `string`,
      title: `Site`,
    },

    Device: {
      sql: `device`,
      type: `string`,
      title: `Device`,
    },
    LatestDate: {
      sql: `Date`,
      type: `time`,
      title: `Latest Date`,
    },
    swnameVersion:{
      sql: `CONCAT(installedsoftwarenames,'-',version)`,
      type: `string`,
      title: `Application-Version`
    },
  },
  preAggregations: {
    dv: {
      granularity: `day`,
      partitionGranularity: `day`,
      timeDimension: LatestDate,
      measures: [count],
      dimensions: [site, Device, machineId, installedsoftwarenames, version, installationdate,swnameVersion],
      scheduledRefresh: true,
      type: `rollup`,
      refreshKey: {
        every: `1 day`,
        incremental: true,
      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(clatest),'%Y-%m-%d'), current_timestamp()) FROM ${db_prefix()}asset.AssetData`,
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`,
      },
    },
  },
});
