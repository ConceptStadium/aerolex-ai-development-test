import {spawn,spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,existsSync,openSync,unlinkSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=dirname(fileURLToPath(import.meta.url));const pidFile=resolve(dir,'directus.pid');
function running(){if(!existsSync(pidFile))return false;try{const id=Number(readFileSync(pidFile,'utf8'));process.kill(id,0);const cmd=spawnSync('ps',['-p',String(id),'-o','command='],{encoding:'utf8'}).stdout||'';const cwd=spawnSync('lsof',['-a','-p',String(id),'-d','cwd','-Fn'],{encoding:'utf8'}).stdout||'';return cmd.includes('node_modules/directus/cli.js start')&&cwd.includes('n'+dir+'\n')}catch{return false}}
const command=process.argv[2]||'status';
if(command==='start'){
 if(running()){console.log('Directus already running at http://127.0.0.1:8055/admin');process.exit(0)}
 try{const r=await fetch('http://127.0.0.1:8055/server/ping',{signal:AbortSignal.timeout(1000)});if(r)throw Error('Port 8055 is occupied; refusing to start another service')}catch(e){if(e.message.includes('occupied'))throw e}
 const log=openSync(resolve(dir,'directus.log'),'a',0o600);
 const child=spawn(process.execPath,['--import','./offline-guard.mjs','node_modules/directus/cli.js','start'],{cwd:dir,detached:true,stdio:['ignore',log,log],env:{...process.env,HOST:'127.0.0.1',PORT:'8055',TELEMETRY:'false'}});
 writeFileSync(pidFile,String(child.pid));child.unref();console.log('Starting Directus; waiting for localhost health check...');
 let healthy=false;for(let i=0;i<60;i++){try{const r=await fetch('http://127.0.0.1:8055/server/ping',{signal:AbortSignal.timeout(1000)});if(r.ok){healthy=true;break}}catch{}await new Promise(r=>setTimeout(r,1000))}
 if(!healthy)throw Error('Directus did not become ready; see local-cms/directus.log');
 console.log('Directus ready: http://127.0.0.1:8055/admin');
}else if(command==='stop'){
 if(running())process.kill(Number(readFileSync(pidFile,'utf8')),'SIGTERM');if(existsSync(pidFile))unlinkSync(pidFile);console.log('Local Directus stopped');
}else console.log(running()?'Local Directus is running at http://127.0.0.1:8055/admin':'Local Directus is stopped');
