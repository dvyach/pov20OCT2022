import { db_prefix,preparePreagregations } from '../prefix';

cube(`A20`, {
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
    ad.value->>'$.registeredprocessor' as 'processortype',
    ad.value->>'$.processorfamily' as 'processorfamily',
    ad.value->>'$.processormanufacturer' as 'processormanufacturer',
    ad.value->>'$.registeredprocessor' as 'regdprocessor',
    ad.value->>'$.processorcurrentvoltage' as 'processorcurrentvoltage',
    ad.value->>'$.processorcorecount' as 'processorcorecount',
    ad.value->>'$.processorcoreenabled' as 'processorcoreenabled',
    ad.value->>'$.processorthreadcount' as 'processorthreadcount',
    ad.value->>'$.processorcurrentspeedinmhz' as 'processorspeed',
    ad.value->>'$.processorcharacteristics1' as 'processchar',
    ad.value->>'$.processorversion' as 'processorversion'
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
            and adt.dataid = 20
        ) as maxSlatest
      from
        Date_Ranges
        join asset.Machine m
    ) as aall
   left join asset.AssetData as ad on aall.mId = ad.machineid and aall.maxSlatest =  ad.slatest
  where
  ${FILTER_PARAMS.A20.LatestDate.filter(
    (from, to) => `aall.Date >= STR_TO_DATE(${from},'%Y-%m-%dT%H:%i:%s') AND aall.Date  <  STR_TO_DATE(${to},'%Y-%m-%dT%H:%i:%s')`,
  )}
    and ad.dataid = 20
`,
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
      drillMembers: [machineId, site, Device, processortype, processorversion, processorfamily,
        processormanufacturer, processorcurrentvoltage, processorcorecount, processorcoreenabled,
        processorthreadcount, regdprocessor, processorspeed, processchar],
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

    processortype: {
      sql: `processortype`,
      type: `string`,
      title: `Processor Type`,
    },
    processorversion: {
      sql: `processorversion`,
      type: `string`,
      title: `Processor Version`,
    },
    processorfamily: {
      sql: `processorfamily`,
      type: `string`,
      title: `Processor Family`,
    },
    processormanufacturer: {
      sql: `processormanufacturer`,
      type: `string`,
      title: `Manufacturer`,
    },
    processorcurrentvoltage: {
      sql: `processorcurrentvoltage`,
      type: `string`,
      title: `Voltage`,
    },
    processorcorecount: {
      sql: `processorcorecount`,
      type: `string`,
      title: `Core Count`,
    },
    processorcoreenabled: {
      sql: `processorcoreenabled`,
      type: `string`,
      title: `Core Enabled`,
    },
    processorthreadcount: {
      sql: `processorthreadcount`,
      type: `string`,
      title: `Thread Count`,
    },
    regdprocessor: {
      sql: `regdprocessor`,
      type: `string`,
      title: `Processor Details`,
    },
    processorspeed: {
      sql: `processorspeed`,
      type: `string`,
      title: `Processor Speed`,
    },
    processchar: {
      sql: `processchar`,
      type: `string`,
      title: `Process Characteristics`,
    },
  },
  preAggregations: {
    dv: {
      granularity: `day`,
      partitionGranularity: `day`,
      timeDimension: LatestDate,
      measures: [count],
      dimensions:[machineId, site, Device, processortype, processorversion, processorfamily,
        processormanufacturer, processorcurrentvoltage, processorcorecount, processorcoreenabled,
        processorthreadcount, regdprocessor, processorspeed, processchar],
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
