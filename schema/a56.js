import { db_prefix } from '../prefix';

cube(`A56_Useraccount_Details`, {
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
    ad.value ->> '$.username' as username,
    ad.value ->> '$.useraccountname' as useraccountname, 
    ad.value ->> '$.useraccountdomain' as useraccountdomain, 
    ad.value ->> '$.useraccountgroups' as useraccountgroups,
    ad.value ->> '$.useraccountlockout' as useraccountlockout,
    ad.value ->> '$.useraccountdisabled' as useraccountdisabled,
    ad.value ->> '$.useraccountfullname' as useraccountfullname,
    ad.value ->> '$.useraccountprivileges' as useraccountprivileges,
    ad.value ->> '$.useraccountdescription' as useraccountdescription,
    ad.value ->> '$.useraccounthomedirpath' as useraccounthomedirpath,
    ad.value ->> '$.useraccountpasswordage' as useraccountpasswordage,
    ad.value ->> '$.useraccountfailedlogons' as useraccountfailedlogons,
    ad.value ->> '$.useraccountlogonservername' as useraccountlogonservername,
    ad.value ->> '$.useraccountpasswordexpires' as useraccountpasswordexpires,
    ad.value ->> '$.useraccountpasswordrequired' as useraccountpasswordrequired,
    ad.value ->> '$.useraccountsuccessfullogons' as useraccountsuccessfullogons,
    ad.value ->> '$.useraccountpasswordchangeable' as useraccountpasswordchangeable,
    ad.value ->> '$.useraccountaccountexpirationtime' as useraccountaccountexpirationtime,
    ad.value ->> '$.useraccountlogonallowedworkstations' as useraccountlogonallowedworkstations,
    ad.value ->> '$.useraccountuserdiskstoragesizelimit' as useraccountuserdiskstoragesizelimit
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
            and adt.dataid = 56 
        ) as maxSlatest 
      from 
        Date_Ranges 
        join asset.Machine m 
    ) as aall 
   left join asset.AssetData as ad on aall.mId = ad.machineid and aall.maxSlatest =  ad.slatest
  where  
  ${FILTER_PARAMS.A56_Useraccount_Details.LatestDate.filter(
    (from, to) => `aall.Date >= STR_TO_DATE(${from},'%Y-%m-%dT%H:%i:%s') AND aall.Date  <  STR_TO_DATE(${to},'%Y-%m-%dT%H:%i:%s')`,
  )}  
    and ad.dataid = 56  
`,
  title: `Domain Details`,
  description: `Domain Details`,

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
    },
  },
  dimensions: {
    id: {
      sql: `CONCAT(date, machineid, useraccountname, useraccountdomain)`,
      type: `number`,
      primaryKey: true,
      shown: true
    },

    machineId: {
      sql: `machineid`,
      type: `number`,
    },

    useraccountname: {
      sql: `useraccountname`,
      type: `string`,
      title: `useraccountname`,
    },

    useraccountdomain: {
      sql: `useraccountdomain`,
      type: `string`,
      title: `useraccountdomain`,
    },

    useraccountgroups: {
      sql: `substring(useraccountgroups,2,100)`,
      type: `string`,
      title: `useraccountgroups`,
    },

    useraccountlockout: {
      sql: `useraccountlockout`,
      type: `string`,
      title: `useraccountlockout`,
    },

    useraccountdisabled: {
      sql: `useraccountdisabled`,
      type: `string`,
      title: `useraccountdisabled`,
    },

    useraccountfullname: {
      sql: `useraccountfullname`,
      type: `string`,
      title: `useraccountfullname`,
    },

    useraccountprivileges: {
      sql: `useraccountprivileges`,
      type: `string`,
      title: `useraccountprivileges`,
    },

    useraccountdescription: {
      sql: `useraccountdescription`,
      type: `string`,
      title: `useraccountdescription`,
    },

    useraccounthomedirpath: {
      sql: `useraccounthomedirpath`,
      type: `string`,
      title: `useraccounthomedirpath`,
    },

    useraccountpasswordage: {
      sql: `useraccountpasswordage`,
      type: `string`,
      title: `useraccountpasswordage`,
    },

    useraccountfailedlogons: {
      sql: `useraccountfailedlogons`,
      type: `number`,
      title: `useraccountfailedlogons`,
    },

    useraccountlogonservername: {
      sql: `useraccountlogonservername`,
      type: `string`,
      title: `useraccountlogonservername`,
    },

    useraccountpasswordexpires: {
      sql: `useraccountpasswordexpires`,
      type: `string`,
      title: `useraccountpasswordexpires`,
    },

    useraccountpasswordrequired: {
      sql: `useraccountpasswordrequired`,
      type: `string`,
      title: `useraccountpasswordrequired`,
    },

    useraccountsuccessfullogons: {
      sql: `useraccountsuccessfullogons`,
      type: `number`,
      title: `useraccountsuccessfullogons`,
    },

    useraccountpasswordchangeable: {
      sql: `useraccountpasswordchangeable`,
      type: `string`,
      title: `useraccountpasswordchangeable`,
    },

    useraccountaccountexpirationtime: {
      sql: `useraccountaccountexpirationtime`,
      type: `string`,
      title: `useraccountaccountexpirationtime`,
    },

    useraccountlogonallowedworkstations: {
      sql: `useraccountlogonallowedworkstations`,
      type: `string`,
      title: `useraccountlogonallowedworkstations`,
    },

    useraccountuserdiskstoragesizelimit: {
      sql: `useraccountuserdiskstoragesizelimit`,
      type: `string`,
      title: `useraccountuserdiskstoragesizelimit`,
    },

    username: {
      sql: `username`,
      type: `string`,
      title: `username`,
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
      dimensions: [site, Device, machineId, username,
        useraccountname,
        useraccountdomain,
        useraccountgroups,
        useraccountlockout,
        useraccountdisabled,
        useraccountfullname,
        useraccountprivileges,
        useraccountdescription,
        useraccountpasswordage,
        useraccountfailedlogons,
        useraccountpasswordexpires,
        useraccountpasswordrequired,
        useraccountsuccessfullogons,
        useraccountpasswordchangeable,
        useraccountlogonallowedworkstations,
        useraccountuserdiskstoragesizelimit],
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
