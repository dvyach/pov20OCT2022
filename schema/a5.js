import { db_prefix,preparePreagregations } from '../prefix';

cube(`A5_Chassis_Details`, {
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
    ad.value->>'$.chassislock' as 'lock',
    ad.value->>'$.chassisheight' as 'height',
    ad.value->>'$.chassisversion' as 'version',
    ad.value->>'$.chassisassettag' as 'assettag',
    ad.value->>'$.chassisskunumber' as 'skunumber',
    ad.value->>'$."chassisboot-upstate"' as 'upstate',
    ad.value->>'$.chassismanufacturer' as 'manufacturer',
    ad.value->>'$.chassisserialnumber' as 'serialnumber',
    ad.value->>'$.chassisthermalstate' as 'thermalstate',
    ad.value->>'$.chassisoeminformation' as 'oeminformation',
    ad.value->>'$.chassispowersupplystate' as 'powersupplystate',
    ad.value->>'$.chassisnumberofpowercords' as 'numberofpowercords',
    ad.value->>'$.chassistype' as 'chassistype',
    ad.value->>'$.chassissecuritystatus' as 'chassissecurity'
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
            and adt.dataid = 5
        ) as maxSlatest
      from
        Date_Ranges
        join asset.Machine m
    ) as aall
   left join asset.AssetData as ad on aall.mId = ad.machineid and aall.maxSlatest =  ad.slatest
  where
  ${FILTER_PARAMS.A5.LatestDate.filter(
    (from, to) => `aall.Date >= STR_TO_DATE(${from},'%Y-%m-%dT%H:%i:%s') AND aall.Date  <  STR_TO_DATE(${to},'%Y-%m-%dT%H:%i:%s')`,
  )}
    and ad.dataid = 5
`,
  joins: {
    MAC: {
      relationship: 'belongsTo',
      sql: `${MAC}.idm = ${CUBE}.machineid`,
    },
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
      drillMembers: [site, Device, machineId, lock, height, version, assettag, skunumber, upstate,
        serialnumber, thermalstate, oeminformation, powersupplystate, numberofpowercords, chassistype, chassissecurity],
    },
  },
  dimensions: {
    id: {
      sql: `CONCAT(date, machineid, dataid,assettag,manufacturer,serialnumber)`,
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
    lock: {
      sql: `lock`,
      type: `string`,
      title: `Chassis Lock`,
    },
    height: {
      sql: `height`,
      type: `string`,
      title: `Chassis height`,
    },
    version: {
      sql: `version`,
      type: `string`,
      title: `Chassis Version`,
    },
    assettag: {
      sql: `assettag`,
      type: `string`,
      title: `Chassis Tag`,
    },
    skunumber: {
      sql: `skunumber`,
      type: `string`,
      title: `Chassis Info`,
    },
    upstate: {
      sql: `upstate`,
      type: `string`,
      title: `Chassis Upstate`,
    },
    manufacturer: {
      sql: `manufacturer`,
      type: `string`,
      title: `Manufacturer`,
    },
    serialnumber: {
      sql: `serialnumber`,
      type: `string`,
      title: `Serial No`,
    },
    thermalstate: {
      sql: `thermalstate`,
      type: `string`,
      title: `Thermal State`,
    },
    oeminformation: {
      sql: `oeminformation`,
      type: `string`,
      title: `OEM Info`,
    },

    powersupplystate: {
      sql: `powersupplystate`,
      type: `string`,
      title: `Power Supply State`,
    },
    numberofpowercords: {
      sql: `numberofpowercords`,
      type: `string`,
      title: `Power Inputs`,
    },

    chassistype: {
      sql: `chassistype`,
      type: `string`,
      title: `Chassis Type`,
    },
    chassissecurity: {
      sql: `chassissecurity`,
      type: `string`,
      title: `Chassis Security`,
    },
  },
  preAggregations: {
    dv: {
      granularity: `day`,
      partitionGranularity: `day`,
      timeDimension: LatestDate,
      measures: [count],
      dimensions: [site, Device, machineId, lock, height, version, assettag, skunumber, upstate,
        serialnumber, thermalstate, manufacturer, oeminformation, powersupplystate, numberofpowercords, chassistype, chassissecurity],
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
