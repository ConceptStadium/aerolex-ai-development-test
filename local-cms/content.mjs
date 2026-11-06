import {readFileSync,writeFileSync,mkdirSync,readdirSync,existsSync,copyFileSync,rmSync} from 'node:fs';
import {resolve,dirname,extname,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {parse} from '../node_modules/yaml/dist/index.js';
export const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const cms=resolve(root,'local-cms');
const config=parse(readFileSync(resolve(root,'.pages.yml'),'utf8'));
const env=Object.fromEntries(readFileSync(resolve(cms,'.env'),'utf8').trim().split('\n').map(line=>{const i=line.indexOf('=');return [line.slice(0,i),line.slice(i+1)]}));
const base='http://127.0.0.1:8055';
export async function api(path,method='GET',data){
 if(!path.startsWith('/')||path.startsWith('//'))throw Error('Local API paths only');
 const headers={Connection:'close',Authorization:`Bearer ${env.ADMIN_TOKEN}`};
 if(data&&!(data instanceof FormData))headers['Content-Type']='application/json';
 let r;
 for(let attempt=0;attempt<5;attempt++){
  try{r=await fetch(base+path,{method,headers,body:data instanceof FormData?data:data===undefined?undefined:JSON.stringify(data),redirect:'error',signal:AbortSignal.timeout(30000)});}
  catch(error){if(method==='POST'||attempt===4)throw error;await new Promise(resolve=>setTimeout(resolve,1000));continue}
  if(r.status!==503||attempt===4)break;
  await r.text();await new Promise(resolve=>setTimeout(resolve,1000));
 }

 if(!r.ok)throw Error(`${method} ${path}: ${r.status} ${await r.text()}`);
 if(r.status===204)return;
 return (await r.json()).data;
}
const statePath=resolve(cms,'state.json');
let state=existsSync(statePath)?JSON.parse(readFileSync(statePath,'utf8')):{assets:{},seeded:[]};
const saveState=()=>writeFileSync(statePath,JSON.stringify(state,null,2));
function flat(fields,prefix='',label=''){
 return fields.flatMap(f=>f.type==='object'&&!f.list?flat(f.fields,prefix+f.name+'__',label+f.label+' / '):[{...f,key:prefix+f.name,editorLabel:label+f.label}]);
}
function get(obj,key){return key.split('__').reduce((v,k)=>v?.[k],obj)}
function set(obj,key,val){const keys=key.split('__');let v=obj;for(const k of keys.slice(0,-1))v=v[k]??={};v[keys.at(-1)]=val}
function editorField(f){
 let type=f.list?'json':f.type==='image'?'uuid':f.type==='number'?'integer':f.type==='boolean'?'boolean':f.type==='rich-text'||f.type==='text'?'text':'string';
 let ui=f.list?'list':f.type==='image'?'file-image':f.type==='rich-text'?'input-rich-text-html':f.type==='text'?'input-multiline':f.type==='boolean'?'boolean':'input';
 let options={};
 if(f.list){const nested=f.type==='object'?flat(f.fields):[{...f,list:false,key:'value',editorLabel:f.label}];options={template:'{{'+(nested.find(x=>['title','heading','label','value','name'].includes(x.key))?.key||nested[0]?.key)+'}}',fields:nested.map(n=>({field:n.key,name:n.editorLabel,type:editorField(n).type,meta:editorField(n).meta}))}}
 return {field:f.key,type,meta:{interface:ui,options,translations:[{language:'en-US',translation:f.editorLabel}],note:f.description||null,required:!!f.required,special:f.list?['cast-json']:f.type==='boolean'?['cast-boolean']:f.type==='image'?['file']:null,width:f.list||type==='text'?'full':'half'},schema:{is_nullable:true}};
}
async function upload(src){
 if(state.assets[src])return state.assets[src];
 if(!src.startsWith('/images/')||src.includes('..'))throw Error('Only project images can be imported');
 const file=resolve(root,'public','.'+src);const form=new FormData();form.set('title',basename(src));
 const mime={'.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'}[extname(src)]||'application/octet-stream';
 form.set('file',new Blob([readFileSync(file)],{type:mime}),basename(src));
 const result=await api('/files','POST',form);state.assets[src]=result.id;saveState();return result.id;
}
async function pack(fields,data){const out={};for(const f of flat(fields)){let value=get(data,f.key);if(f.list){value=await Promise.all(value.map(v=>f.type==='object'?pack(f.fields,v):pack([{...f,list:false,name:'value'}],{value:v})))}else if(f.type==='image')value=await upload(value);out[f.key]=value}return out}
async function unpack(fields,data,images){const out={};for(const f of flat(fields)){let v=data[f.key];if(f.list){if(!Array.isArray(v))v=[];v=await Promise.all(v.map(async item=>{const value=await unpack(f.type==='object'?f.fields:[{...f,list:false,name:'value'}],item,images);return f.type==='object'?value:value.value}))}else if(f.type==='image'){
 if(!v)throw Error(`${f.editorLabel}: select an image`);
 const id=typeof v==='object'?v.id:v;
 const original=Object.entries(state.assets).find(([,uuid])=>uuid===id)?.[0];
 if(original)v=original;else{
 if(!/^[a-f0-9-]{36}$/.test(id))throw Error('Invalid local file ID');
 const info=await api('/files/'+id);const extension={ 'image/png':'.png','image/jpeg':'.jpg','image/webp':'.webp','image/svg+xml':'.svg','image/gif':'.gif','image/avif':'.avif'}[info.type];
 if(!extension)throw Error('Unsupported image type');
 const response=await fetch(base+'/assets/'+id,{headers:{Authorization:`Bearer ${env.ADMIN_TOKEN}`},redirect:'error'});if(!response.ok)throw Error('Cannot read local upload');
 v='/images/directus/'+id+extension;images.set(v,Buffer.from(await response.arrayBuffer()));
 }
 }else if(v===null||v===undefined)v=f.type==='boolean'?false:f.type==='number'?0:'';set(out,f.key,v)}return out}
export async function seed(){
 const existing=await api('/collections');
 for(const entry of config.content){const name='site_'+entry.name;
 if(!existing.some(c=>c.collection===name)){
 const fields=flat(entry.fields).map(editorField);
 await api('/collections','POST',{collection:name,meta:{singleton:entry.type==='file',icon:entry.type==='file'?'article':'view_list',translations:[{language:'en-US',translation:entry.label}],note:'Local Aerolex experiment',display_template:entry.type==='collection'?'{{title}}':null},schema:{},fields:[{field:'id',type:'integer',schema:{is_primary_key:true,has_auto_increment:true},meta:{hidden:true,readonly:true,interface:'input'}},...fields]});
 for(const f of fields.filter(f=>f.type==='uuid'))await api('/relations','POST',{collection:name,field:f.field,related_collection:'directus_files',schema:{on_delete:'SET NULL'},meta:{many_collection:name,many_field:f.field,one_collection:'directus_files',one_deselect_action:'nullify'}});
 }
 if(state.seeded.includes(name))continue;
 const files=entry.type==='file'?[entry.path]:readdirSync(resolve(root,entry.path)).filter(p=>p.endsWith('.json')).map(p=>entry.path+'/'+p);
 const rows=await api('/items/'+name+'?limit=-1');
 if(entry.type==='collection'&&rows.length)throw Error(`Refusing to overwrite existing ${name}; inspect local state`);
 for(const file of files){const value=await pack(entry.fields,JSON.parse(readFileSync(resolve(root,file),'utf8')));await api('/items/'+name,entry.type==='file'?'PATCH':'POST',value)}
 state.seeded.push(name);saveState();console.log('Imported '+entry.label);
 }
 await api('/settings','PATCH',{project_name:'Aerolex — Local Experiment',project_descriptor:'Local database only. No production connection.',default_language:'en-US'});
}
export async function sync(){
 const output=new Map(),images=new Map(),managed=[];
 for(const entry of config.content){const name='site_'+entry.name;const result=await api('/items/'+name+'?limit=-1');const rows=entry.type==='file'?[result]:result;
 const seen=new Set();for(const row of rows){const data=await unpack(entry.fields,row,images);
 if(entry.type==='collection'){if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)||seen.has(data.slug))throw Error('Missing, invalid or duplicate slug in '+entry.label);seen.add(data.slug)}
 const file=entry.type==='file'?entry.path:entry.path+'/'+data.slug+'.json';output.set(file,JSON.stringify(data,null,2)+'\n');}
 managed.push(...(entry.type==='file'?[entry.path]:readdirSync(resolve(root,entry.path)).filter(p=>p.endsWith('.json')).map(p=>entry.path+'/'+p)));
 }
 const deleted=managed.filter(file=>!output.has(file));
 const changed=[...output].filter(([file,text])=>!existsSync(resolve(root,file))||JSON.stringify(JSON.parse(readFileSync(resolve(root,file),'utf8')))!==JSON.stringify(JSON.parse(text)));
 if(!changed.length&&!deleted.length)return false;
 const backup=resolve(cms,'backups',new Date().toISOString().replaceAll(':','-'));mkdirSync(backup,{recursive:true});
 for(const file of managed){const dest=resolve(backup,file);mkdirSync(dirname(dest),{recursive:true});copyFileSync(resolve(root,file),dest)}
 const newImages=[];
 try{
 for(const [src,bytes] of images){const path=resolve(root,'public','.'+src);if(!existsSync(path)){mkdirSync(dirname(path),{recursive:true});writeFileSync(path,bytes);newImages.push(path)}}
 for(const [file,text] of changed){mkdirSync(dirname(resolve(root,file)),{recursive:true});writeFileSync(resolve(root,file),text)}
 for(const file of deleted)rmSync(resolve(root,file));
 const validation=spawnSync(process.execPath,['scripts/validate.mjs'],{cwd:root,encoding:'utf8'});if(validation.status!==0)throw Error(validation.stdout+validation.stderr);
 // Static route validation also catches deleted or changed slugs referenced in navigation.
 const build=spawnSync(process.execPath,['node_modules/astro/bin/astro.mjs','build'],{cwd:root,encoding:'utf8'});if(build.status!==0)throw Error(build.stdout+build.stderr);
 const routes=spawnSync('python3',['scripts/check-routes.py'],{cwd:root,encoding:'utf8'});if(routes.status!==0)throw Error(routes.stdout+routes.stderr);
 console.log(`Synced ${changed.length} changed and ${deleted.length} removed files. Backup: ${backup}`);return true;
 }catch(error){
 for(const [file] of changed)if(!managed.includes(file)&&existsSync(resolve(root,file)))rmSync(resolve(root,file));
 for(const file of managed)copyFileSync(resolve(backup,file),resolve(root,file));
 for(const path of newImages)rmSync(path);
 spawnSync(process.execPath,['node_modules/astro/bin/astro.mjs','build'],{cwd:root,stdio:'ignore'});
 throw Error('Sync rejected; JSON restored from backup. '+error.message);
 }
}
const command=process.argv[2];
if(command==='seed')await seed();
if(command==='sync')await sync();
if(command==='watch'){console.log('Watching localhost Directus; validated edits rebuild locally. Ctrl+C stops.');for(;;){try{await sync()}catch(e){console.error(e.message)}await new Promise(r=>setTimeout(r,5000))}}
