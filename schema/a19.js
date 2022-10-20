import { db_prefix } from '../prefix';

cube(`A19_Portable_Battery_Details`, {
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
    ad.value->>'$.batterylocation' as 'batterylocation',
    ad.value->>'$.batterymanufacturer' as 'batterymanufacturer',
    ad.value->>'$.batteryname' as 'batteryname',
    ad.value->>'$.manufacturedate' as 'manufacturedate',
    ad.value->>'$.serialnumberbattery' as 'serialnumberbattery',
    ad.value->>'$.designcapacityinmwh' as 'designcapacityinmwh',
    ad.value->>'$.designvoltageinmv' as 'designvoltageinmv',
    ad.value->>'$.chemistry' as 'chemistry',
    ad.value->>'$.sbdsmanufacturedate' as 'sbdsmanufacturedate',
    ad.value->>'$.sbdsserialnumber' as 'sbdsserialnumber',
    ad.value->>'$.sbdsversion' as 'sbdsversion',
    ad.value->>'$.maximumerror' as 'maximumerror',
    ad.value->>'$.sbdschemistry' as 'sbdschemistry',
    ad.value->>'$."batteryoem-specificinformation"' as 'batteryoeminfo'
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
            and adt.dataid = 19
        ) as maxSlatest
      from
        Date_Ranges
        join asset.Machine m
    ) as aall
   left join asset.AssetData as ad on aall.mId = ad.machineid and aall.maxSlatest =  ad.slatest
  where
  ${FILTER_PARAMS.A19_Portable_Battery_Details.LatestDate.filter(
    (from, to) => `aall.Date >= STR_TO_DATE(${from},'%Y-%m-%dT%H:%i:%s') AND aall.Date  <  STR_TO_DATE(${to},'%Y-%m-%dT%H:%i:%s')`,
  )}
    and ad.dataid = 19
`,
  title: `Portable Battery`,
  description: `Portable Battery`,

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
      drillMembers: [site, Device, machineId, batterylocation, batterymanufacturer, batteryname, manufacturedate,
        serialnumberbattery, designcapacityinmwh, designvoltageinmv, chemistry, sbdsmanufacturedate, sbdsserialnumber,
        sbdsversion, maximumerror, sbdschemistry, batteryoeminfo]
    },
  },
  dimensions: {
    id: {
      sql: `CONCAT(date, machineid, dataid,batteryname,serialnumberbattery,sbdsmanufacturedate)`,
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

    batterylocation: {
      sql: `batterylocation`,
      type: `string`,
      title: `Battery Location`,
    },
    batterymanufacturer: {
      sql: `batterymanufacturer`,
      type: `string`,
      title: `Manufacturer`,
    },
    batteryname: {
      sql: `batteryname`,
      type: `string`,
      title: `Name`,
    },
    manufacturedate: {
      sql: `manufacturedate`,
      type: `string`,
      title: `Manufacturer Date`,
    },
    serialnumberbattery: {
      sql: `serialnumberbattery`,
      type: `string`,
      title: `Serial Number`,
    },
    designcapacityinmwh: {
      sql: `designcapacityinmwh`,
      type: `string`,
      title: `Capacity in mwh`,
    },
    designvoltageinmv: {
      sql: `designvoltageinmv`,
      type: `string`,
      title: `Voltage in mv`,
    },
    chemistry: {
      sql: `chemistry`,
      type: `string`,
      title: `Chemistry`,
    },
    sbdsmanufacturedate: {
      sql: `sbdsmanufacturedate`,
      type: `string`,
      title: `SBDS manufacturer date`,
    },
    sbdsserialnumber: {
      sql: `sbdsserialnumber`,
      type: `string`,
      title: `SBDS Serial Number`,
    },
    sbdsversion: {
      sql: `sbdsversion`,
      type: `string`,
      title: `SBDS Version`,
    },
    maximumerror: {
      sql: `maximumerror`,
      type: `string`,
      title: `Maximum Error`,
    },
    sbdschemistry: {
      sql: `sbdschemistry`,
      type: `string`,
      title: `SBDS Chemistry`,
    },
    batteryoeminfo: {
      sql: `batteryoeminfo`,
      type: `string`,
      title: `OEM Specific info`,
    },
  },
  preAggregations: {
    dv: {
      granularity: `day`,
      partitionGranularity: `day`,
      timeDimension: LatestDate,
      measures: [count],
      dimensions: [site, Device, machineId, batterylocation, batterymanufacturer, batteryname, manufacturedate,
        serialnumberbattery, designcapacityinmwh, designvoltageinmv, chemistry, sbdsmanufacturedate, sbdsserialnumber,
        sbdsversion, maximumerror, sbdschemistry, batteryoeminfo],
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
  },
});
