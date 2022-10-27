import { db_prefix,preparePreagregations } from '../prefix';
cube(`A10_System_Information`, {
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
    ad.value->>'$.biosdate' as 'biosdate',
    ad.value->>'$.biosvendor' as 'biosvendor',
    ad.value->>'$.biosversion' as 'biosver',
    ad.value->>'$.biosromsizeinkb' as 'biossize',
    ad.value->>'$.systemuuid' as 'uuid',
    ad.value->>'$.systemfamily' as 'family',
    ad.value->>'$.systemversion' as 'sver',
    ad.value->>'$.systemskunumber' as 'sysnum',
    ad.value->>'$."systemwake-uptype"' as 'syswakeup',
    ad.value->>'$.systemserialnumber' as 'syssrlnum',
    ad.value->>'$.systemmanufacturer' as 'systemmanufacturer',
    ad.value->>'$.systemproduct' as 'systemproduct'
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
            and adt.dataid = 10
        ) as maxSlatest
      from
        Date_Ranges
        join asset.Machine m
    ) as aall
   left join asset.AssetData as ad on aall.mId = ad.machineid and aall.maxSlatest =  ad.slatest
  where
  ${FILTER_PARAMS.A10_System_Information.LatestDate.filter(
    (from, to) => `aall.Date >= STR_TO_DATE(${from},'%Y-%m-%dT%H:%i:%s') AND aall.Date  <  STR_TO_DATE(${to},'%Y-%m-%dT%H:%i:%s')`,
  )}
    and ad.dataid = 10
`,
  title: `System Information`,
  description: `System Information`,
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
      drillMembers: [site, Device, machineId, biosdate, biosvendor, biosver, biossize,
        uuid, family, sver, sysnum, syswakeup, syssrlnum, systemmanufacturer, systemproduct],
    },
  },
  dimensions: {
    id: {
      sql: `CONCAT(date, machineid, dataid,biosvendor,biosdate,syssrlnum,systemmanufacturer)`,
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
    LatestDate: {
      sql: `date`,
      type: `time`,
      title: `Latest Date`,
    },
    biosdate: {
      sql: `biosdate`,
      type: `string`,
      title: `BIOS Date`,
    },
    biosvendor: {
      sql: `biosvendor`,
      type: `string`,
      title: `BIOS Vendor`,
    },
    biosver: {
      sql: `biosver`,
      type: `string`,
      title: `BIOS Version`,
    },
    biossize: {
      sql: `biossize`,
      type: `string`,
      title: `BIOS Size`,
    },
    uuid: {
      sql: `uuid`,
      type: `string`,
      title: `System UUID`,
    },
    family: {
      sql: `family`,
      type: `string`,
      title: `System Family`,
    },
    sver: {
      sql: `sver`,
      type: `string`,
      title: `System Version`,
    },
    sysnum: {
      sql: `sysnum`,
      type: `string`,
      title: `KU Number`,
    },
    syswakeup: {
      sql: `syswakeup`,
      type: `string`,
      title: `System Wakeup Type`,
    },
    syssrlnum: {
      sql: `syssrlnum`,
      type: `string`,
      title: `Serial Number`,
    },
    systemmanufacturer: {
      sql: `systemmanufacturer`,
      type: `string`,
      title: `Manufacturer`,
    },
    systemproduct: {
      sql: `systemproduct`,
      type: `string`,
      title: `Product Name`,
    },
  },
  preAggregations:  {
    dv: {
      granularity: `day`,
      partitionGranularity: `day`,
      timeDimension: LatestDate,
      measures: [count],
      dimensions: [site, Device, machineId, biosdate, biosvendor, biosver, biossize,
        uuid, family, sver, sysnum, syswakeup, syssrlnum, systemmanufacturer, systemproduct],
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
  }
});
