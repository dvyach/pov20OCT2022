import { db_prefix,preparePreagregations } from '../prefix';

cube(`A39`, {
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
    ad.value->>'$.memorysize' as 'memorysize',
    ad.value->>'$.formfactor' as 'formfactor',
    ad.value->>'$.devicespeed' as 'devicespeed',
    ad.value->>'$.memoryassettag' as 'memoryassettag',
    ad.value->>'$.datawidthinbits' as 'datawidthinbits',
    ad.value->>'$.devicetypedetail' as 'devicetype',
    ad.value->>'$.memorypartnumber' as 'partnumber',
    ad.value->>'$.memorymanufacturer' as 'manufacturer',
    ad.value->>'$.memoryserialnumber' as 'serialnum'
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
            and adt.dataid = 39
        ) as maxSlatest
      from
        Date_Ranges
        join asset.Machine m
    ) as aall
   left join asset.AssetData as ad on aall.mId = ad.machineid and aall.maxSlatest =  ad.slatest
  where
  ${FILTER_PARAMS.A39.LatestDate.filter(
    (from, to) => `aall.Date >= STR_TO_DATE(${from},'%Y-%m-%dT%H:%i:%s') AND aall.Date  <  STR_TO_DATE(${to},'%Y-%m-%dT%H:%i:%s')`,
  )}
    and ad.dataid = 39
`,
  title: `Memory Information V2`,
  description: `Memory Information`,

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
      drillMembers: [site, Device, machineId, formfactor, devicespeed, memoryassettag,
        datawidthinbits, devicetype, partnumber, manufacturer, serialnum, memorysize],
    },
  },
  dimensions: {
    id: {
      sql: `CONCAT(date, machineid, dataid,memoryassettag,partnumber,manufacturer,serialnum)`,
      type: `number`,
      primaryKey: true,
      shown: false,
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

    formfactor: {
      sql: `formfactor`,
      type: `string`,
      title: `Form factor`,
    },
    devicespeed: {
      sql: `devicespeed`,
      type: `string`,
      title: `Speed`,
    },
    memoryassettag: {
      sql: `memoryassettag`,
      type: `string`,
      title: `Asset Tag`,
    },

    datawidthinbits: {
      sql: `datawidthinbits`,
      type: `string`,
      title: `Data Bits`,
    },
    devicetype: {
      sql: `devicetype`,
      type: `string`,
      title: `Memory Type`,
    },
    partnumber: {
      sql: `partnumber`,
      type: `string`,
      title: `Part Number`,
    },
    manufacturer: {
      sql: `manufacturer`,
      type: `string`,
      title: `Manufacturer`,
    },
    serialnum: {
      sql: `serialnum`,
      type: `string`,
      title: `Serial Num`,
    },

    memorysize: {
      sql: `memorysize`,
      type: `string`,
      title: `Memory Size`,
    },
  },
  preAggregations: {
    dv: {
      granularity: `day`,
      partitionGranularity: `day`,
      timeDimension: LatestDate,
      measures: [count],
      dimensions: [site, Device, machineId, formfactor, devicespeed, memoryassettag,
            datawidthinbits, devicetype, partnumber, manufacturer, serialnum, memorysize],
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
