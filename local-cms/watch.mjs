import {spawn,spawnSync} from 'node:child_process';
import {existsSync,readFileSync,writeFileSync,unlinkSync,openSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=dirname(fileURLToPath(import.meta.url));const root=resolve(dir,'..');const script=resolve(dir,'content.mjs');const pidFile=resolve(dir,'watch.pid');
function pid(){if(!existsSync(pidFile))return null;const id=Number(readFileSync(pidFile,'utf8'));const cmd=spawnSync('ps',['-p',String(id),'-o','command='],{encoding:'utf8'}).stdout||'';return cmd.includes(script+' watch')?id:null}
if(process.argv[2]==='stop'){const id=pid();if(id)process.kill(id,'SIGTERM');if(existsSync(pidFile))unlinkSync(pidFile);console.log('Local CMS sync watcher stopped');}
else if(pid())console.log('Local CMS sync watcher is already running');
else {const log=openSync(resolve(dir,'watch.log'),'a',0o600);const child=spawn(process.execPath,[script,'watch'],{cwd:root,detached:true,stdio:['ignore',log,log]});writeFileSync(pidFile,String(child.pid));child.unref();console.log('Local CMS sync watcher started; log: local-cms/watch.log');}
