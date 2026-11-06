import assert from 'node:assert/strict';
import {readFileSync,existsSync,rmSync} from 'node:fs';
import {resolve} from 'node:path';
import {api,sync,root} from './content.mjs';
await sync();
const original=readFileSync(resolve(root,'src/content/about.json'),'utf8');
assert.equal(JSON.parse(original).hero.heading,'About Us');
const suffix=Date.now();const slug='local-cms-test-'+suffix;
const ids=[];let upload;
try{
 const form=new FormData();form.set('title','Temporary local CMS verification');form.set('file',new Blob([readFileSync(resolve(root,'public/images/training-workspace.png'))],{type:'image/png'}),'local-cms-test.png');
 upload=await api('/files','POST',form);
 for(const collection of ['site_courses','site_posts']){
  const [template]=await api('/items/'+collection+'?limit=1');const data={...template};delete data.id;
  Object.assign(data,{slug,title:'Temporary local CMS verification',draft:false,image__src:upload.id});
  const row=await api('/items/'+collection,'POST',data);ids.push({collection,id:row.id});
 }
 await sync();
 for(const path of ['training','blog'])assert(existsSync(resolve(root,'dist',path,slug,'index.html')));
 assert(existsSync(resolve(root,'public/images/directus',upload.id+'.png')));
 console.log('PASS: local upload, new course and article, JSON export, static URLs and links.');
 const post=ids.find(x=>x.collection==='site_posts');
 await api(`/items/${post.collection}/${post.id}`,'PATCH',{date:'2026-99-99'});
 await assert.rejects(sync(),/Sync rejected/);
 const saved=JSON.parse(readFileSync(resolve(root,'src/content/posts',slug+'.json'),'utf8'));assert.notEqual(saved.date,'2026-99-99');
 await api(`/items/${post.collection}/${post.id}`,'PATCH',{date:saved.date});
 for(const row of ids)await api(`/items/${row.collection}/${row.id}`,'PATCH',{draft:true});
 await sync();
 for(const path of ['training','blog'])assert(!existsSync(resolve(root,'dist',path,slug,'index.html')));
 console.log('PASS: invalid edit rolled back; drafts removed from generated routes.');
}finally{
 for(const row of ids)await api(`/items/${row.collection}/${row.id}`,'DELETE');
 await sync();
 if(upload){await api('/files/'+upload.id,'DELETE');const image=resolve(root,'public/images/directus',upload.id+'.png');if(existsSync(image))rmSync(image)}
 assert.equal(readFileSync(resolve(root,'src/content/about.json'),'utf8'),original);
 for(const path of ['training','blog'])assert(!existsSync(resolve(root,'dist',path,slug,'index.html')));
 console.log('PASS: temporary entries deleted, original content preserved and final local build passed.');
}
const anonymous=await fetch('http://127.0.0.1:8055/items/site_home');assert([401,403].includes(anonymous.status));
console.log('PASS: anonymous CMS content access denied.');
