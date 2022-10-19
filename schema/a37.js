import { db_prefix } from '../prefix';

cube(`A37_System_Disk_Details`, {
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
    ad.value ->> '$.logicaldiskname' as logicaldiskname, 
    ad.value ->> '$.logicaldiskcompressed' as logicaldiskcompressed, 
    ad.value ->> '$.logicaldiskfilesystem' as logicaldiskfilesystem,
    ad.value ->> '$.logicaldiskkbytesfree' as logicaldiskkbytesfree,
    ad.value ->> '$.logicaldiskkbytesused' as logicaldiskkbytesused,
    ad.value ->> '$.logicaldiskvolumename' as logicaldiskvolumename,
    ad.value ->> '$.partitioninfobootable' as partitioninfobootable,
    ad.value ->> '$.logicaldiskdescription' as logicaldiskdescription,
    ad.value ->> '$.logicaldiskkbytestotal' as logicaldiskkbytestotal,
    ad.value ->> '$.logicaldiskpercentagefree' as logicaldiskpercentagefree,
    ad.value ->> '$.logicaldiskpercentageused' as logicaldiskpercentageused,
    ad.value ->> '$.logicaldiskvolumeserialnumber' as logicaldiskvolumeserialnumber,
    ad.value ->> '$.partitioninfoprimarypartition' as partitioninfoprimarypartition
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
            and adt.dataid = 37 
        ) as maxSlatest 
      from 
        Date_Ranges 
        join asset.Machine m 
    ) as aall 
   left join asset.AssetData as ad on aall.mId = ad.machineid and aall.maxSlatest =  ad.slatest
  where  
  ${FILTER_PARAMS.A36.LatestDate.filter(
    (from, to) => `aall.Date >= STR_TO_DATE(${from},'%Y-%m-%dT%H:%i:%s') AND aall.Date  <  STR_TO_DATE(${to},'%Y-%m-%dT%H:%i:%s')`,
  )}  
    and ad.dataid = 37  
`,
  title: `System Disk Details`,
  description: `System Disk Details`,
  
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
    },
  },
  dimensions: {
    id: {
      sql: `CONCAT(date, machineid, logicaldiskvolumeserialnumber)`,
      type: `number`,
      primaryKey: true,
      shown: false,
    },

    machineId: {
      sql: `machineid`,
      type: `number`,
    },

    logicaldiskname: {
      sql: `logicaldiskname`,
      type: `string`,
      title: `logicaldiskname`,
    },

    partitioninfoname: {
      sql: `partitioninfoname`,
      type: `string`,
      title: `partitioninfoname`,
    },

    logicaldiskcompressed: {
      sql: `logicaldiskcompressed`,
      type: `string`,
      title: `logicaldiskcompressed`,
    },

    logicaldiskfilesystem: {
      sql: `logicaldiskfilesystem`,
      type: `string`,
      title: `logicaldiskfilesystem`,
    },

    logicaldiskkbytesfree: {
      sql: `Round((logicaldiskkbytesfree/1024)/1024)`,
      type: `number`,
      title: `logicaldiskkbytesfree`,
    },

    logicaldiskkbytesused: {
      sql: `Round((logicaldiskkbytesused/1024)/1024)`,
      type: `number`,
      title: `logicaldiskkbytesused`,
    },

    logicaldiskvolumename: {
      sql: `logicaldiskvolumename`,
      type: `string`,
      title: `logicaldiskvolumename`,
    },

    partitioninfobootable: {
      sql: `partitioninfobootable`,
      type: `string`,
      title: `partitioninfobootable`,
    },

    logicaldiskdescription: {
      sql: `logicaldiskdescription`,
      type: `string`,
      title: `logicaldiskdescription`,
    },

    logicaldiskkbytestotal: {
      sql: `Round((logicaldiskkbytestotal/1024)/1024)`,
      type: `number`,
      title: `logicaldiskkbytestotal`,
    },

    logicaldiskpercentagefree: {
      sql: `logicaldiskpercentagefree`,
      type: `number`,
      title: `logicaldiskpercentagefree`,
    },

    logicaldiskpercentageused: {
      sql: `logicaldiskpercentageused`,
      type: `number`,
      title: `logicaldiskpercentageused`,
    },

    logicaldiskvolumeserialnumber: {
      sql: `logicaldiskvolumeserialnumber`,
      type: `string`,
      title: `logicaldiskvolumeserialnumber`,
    },

    partitioninfoprimarypartition: {
      sql: `partitioninfoprimarypartition`,
      type: `string`,
      title: `partitioninfoprimarypartition`,
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
  },
  preAggregations: {
    dv: {
      granularity: `day`,
      partitionGranularity: `day`,
      timeDimension: LatestDate,
      measures: [count],
      dimensions: [site, Device, machineId, logicaldiskname, logicaldiskkbytesfree, logicaldiskkbytesused, logicaldiskvolumename, logicaldiskdescription, logicaldiskkbytestotal, logicaldiskpercentagefree, logicaldiskpercentageused, logicaldiskvolumeserialnumber, partitioninfoprimarypartition],
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
