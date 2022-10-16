const fs = require('fs');
const https = require('https');
const { exit } = require('process');

const cliAction = process.argv[2];
console.log(`Hi jira, call action: ${cliAction}`);

function jiraApiCall(path, data = undefined) {
  const jiraHost = `automation.atlassian.com`;
  return new Promise((resolve, reject) => {
    const options = {
      hostname: jiraHost,
      port: 443,
      timeout: 10000,
      path: path,
      method: 'POST',
      rejectUnauthorized: false,
      requestCert: true,
      headers: {
        'Content-type': 'application/json',
      },
    };

    const req = https.request(options, res => {
      let body = '';

      res.on('data', data => {
        body = data;
      });

      res.on('end', () => {
        try {
          console.log(`jira answer:`, String(body));
          resolve(JSON.parse(String(body)));
        } catch (e) {
          console.error(`jira call error:`, e);
          console.error(`jira call error body:`, String(body));
          reject(e);
        }
      });
    });

    req.on('error', error => {
      console.error(`jira call error:`, error);
      reject(error);
    });

    if (data !== undefined) {
      const sendData = JSON.stringify(data);
      console.log(`send:`, sendData);
      req.write(sendData);
    }
    req.end();
  });
}

const changelog = fs.readFileSync(`./CHANGELOG.md`);
const changelogRegExp = /NCP[\-_]([0-9]+)/gim;

let m;
const tasks = [];
while ((m = changelogRegExp.exec(changelog))) {
  tasks.push(`NCP-${m[1]}`);
  if (tasks.length > 200) {
    break;
  }
}

// Version $PROJECT_IMAGE_NAME-v$CI_PIPELINE_ID

const lastVersionRegExp = new RegExp(`Version ${process.env.PROJECT_IMAGE_NAME}-v[0-9]+`, 'img');
const lastVersion = lastVersionRegExp.exec(changelog);

let versionName = `${process.env.PROJECT_IMAGE_NAME}-v1`;
if (lastVersion && lastVersion[0]) {
  versionName = lastVersion[0].replace('Version ', '');
}

console.log(`versionName`, versionName);

let CI_COMMIT_BRANCH = process.env.CI_COMMIT_BRANCH;
if (CI_COMMIT_BRANCH === 'main') {
  CI_COMMIT_BRANCH = 'master';
}

let versionDescription = `${process.env.PROJECT_IMAGE_NAME}-${process.env.CI_PIPELINE_ID}\n${process.env.CI_MERGE_REQUEST_TITLE}`;

if (cliAction === `toProd`) {
  try {
    const res = jiraApiCall(`/pro/hooks/3e5eab1cf643df43407b3c1c6dbb2d7acbca721b`, {
      issues: tasks,
      data: {
        versionName,
        versionDescription,
        PROJECT_IMAGE_NAME: process.env.PROJECT_IMAGE_NAME,
        CI_PIPELINE_ID: process.env.CI_PIPELINE_ID,
        CI_MERGE_REQUEST_TITLE: process.env.CI_MERGE_REQUEST_TITLE,
        CI_PIPELINE_SOURCE: process.env.CI_PIPELINE_SOURCE,
        CI_COMMIT_BRANCH: CI_COMMIT_BRANCH,
      },
    });
    console.log(res);
  } catch (e) {
    console.error(e);
  }
}

if (cliAction === `toQA`) {
  try {
    const res = jiraApiCall(`/pro/hooks/dfbdf844562c9b0ddce0800025d7edaf622cdd94`, {
      issues: tasks,
      data: {
        versionName,
        versionDescription,
        PROJECT_IMAGE_NAME: process.env.PROJECT_IMAGE_NAME,
        CI_PIPELINE_ID: process.env.CI_PIPELINE_ID,
        CI_MERGE_REQUEST_TITLE: process.env.CI_MERGE_REQUEST_TITLE,
        CI_PIPELINE_SOURCE: process.env.CI_PIPELINE_SOURCE,
        CI_COMMIT_BRANCH: CI_COMMIT_BRANCH,
      },
    });
    console.log(res);
  } catch (e) {
    console.error(e);
  }
}
