import { db_prefix,preparePreagregations } from '../prefix';

cube(`A16_OS_Details`, {
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
    ad.dataid,
    aall.maxSlatest as slatest,
    ad.value->>'$.ntproducttype' as 'producttype',
    ad.value->>'$.operatingsystem' as 'operatingsystem',
    ad.value->>'$.osversionnumber' as 'osversion',
    ad.value->>'$.ntinstalledservicepack'  as 'servicepack'
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
            and adt.dataid = 16
        ) as maxSlatest
      from
        Date_Ranges
        join asset.Machine m
    ) as aall
   left join asset.AssetData as ad on aall.mId = ad.machineid and aall.maxSlatest =  ad.slatest
  where
  ${FILTER_PARAMS.A16_OS_Details.LDate.filter(
    (from, to) => `aall.Date >= STR_TO_DATE(${from},'%Y-%m-%dT%H:%i:%s') AND aall.Date  <  STR_TO_DATE(${to},'%Y-%m-%dT%H:%i:%s')`,
  )}
    and ad.dataid = 16
`,
  joins: {

    GA: {
      relationship: 'belongsTo',
      sql: `${GA.host} = ${CUBE}.device`,
    },
  },
  measures: {
    count: {
      type: `count`,
      sql: `machineid`,
      title: `count`,
      drillMembers: [servicepack, operatingsystem, osversion, producttype, Device, site, machineId],
    },
  },
  dimensions: {
    id: {
      sql: `CONCAT(date, machineid, dataid,serialnumberbattery,sbdsmanufacturedate)`,
      type: `number`,
      primaryKey: true,
      shown: true
    },

    machineId: {
      sql: `machineid`,
      type: `number`,
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

    LDate: {
      sql: `date`,
      type: `time`,
      title: `Latest Date`,
    },

    producttype: {
      sql: `producttype`,
      type: `string`,
      title: `Product Type`,
    },
    osversion: {
      sql: `osversion`,
      type: `string`,
      title: `Os Version`,
    },
    operatingsystem: {
      sql: `operatingsystem`,
      type: `string`,
      title: `Operating System`,
    },
    servicepack: {
      sql: `servicepack`,
      type: `string`,
      title: `Service Pack`,
    },
  },
  preAggregations: {
    dv: {
      granularity: `day`,
      partitionGranularity: `day`,
      timeDimension: LDate,
      measures: [count],
      dimensions: [servicepack, operatingsystem, osversion, producttype, Device, site, machineId],
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
