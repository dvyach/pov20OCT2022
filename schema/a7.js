import { db_prefix,preparePreagregations } from '../prefix';

cube(`A7_DNS_Server_Details`, {
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
    ad.dataid,
    ad.value->>'$.dnsserver' as 'dnsserver'
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
            and adt.dataid = 7
        ) as maxSlatest
      from
        Date_Ranges
        join asset.Machine m
    ) as aall
   left join asset.AssetData as ad on aall.mId = ad.machineid and aall.maxSlatest =  ad.slatest
  where
  ${FILTER_PARAMS.A7_DNS_Server_Details.LatestDate.filter(
    (from, to) => `aall.Date >= STR_TO_DATE(${from},'%Y-%m-%dT%H:%i:%s') AND aall.Date  <  STR_TO_DATE(${to},'%Y-%m-%dT%H:%i:%s')`,
  )}
    and ad.dataid = 7
`,
  title: `DNS Servers`,
  description: `DNS Servers`,


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
      drillMembers: [machineId, site, Device, dnsserver],
    },
  },
  dimensions: {
    id: {
      sql: `CONCAT(date, machineid, dataid,dnsserver)`,
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

    // group: {
    //   sql: `grp`,
    //   type: `string`,
    //   title: `Group`,
    // },

    Device: {
      sql: `device`,
      type: `string`,
      title: `Device`,
    },

    LatestDate: {
      sql: `date`,
      type: `time`,
      title: `Latest Date`,
    },

    dnsserver: {
      sql: `dnsserver`,
      type: `string`,
      title: `DNS Server`,
    },
  },
  preAggregations:{
    dv: {
      granularity: `day`,
      partitionGranularity: `day`,
      timeDimension: LatestDate,
      measures: [count],
      dimensions: [machineId, site, Device, dnsserver],
      scheduledRefresh: true,
      type: `rollup`,
      refreshKey: {
        every: `3600 seconds`,
        incremental: true,
      },
      buildRangeStart: {
        sql: `SELECT IFNULL(from_unixtime(MIN(clatest),'%Y-%m-%d'), current_timestamp()) FROM ${db_prefix()}asset.AssetData`,
      },
      buildRangeEnd: {
        sql: `SELECT NOW()`,
      },
    },
  }
});