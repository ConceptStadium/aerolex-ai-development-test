import {readFileSync,existsSync,statSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {parse} from 'yaml';
import assert from 'node:assert/strict';
const config=parse(readFileSync('.pages.yml','utf8'));
assert.equal(config.media.input,'public/images');assert.equal(config.media.output,'/images');
let count=0;
function check(fields,value,path){
  assert(value && typeof value==='object' && !Array.isArray(value),path+' must be an object');
  assert.deepEqual(Object.keys(value).sort(),fields.map(f=>f.name).sort(),path+' fields must match CMS');
  for(const f of fields){
    const v=value[f.name], key=path+'.'+f.name;
    const validate=item=>{
      if(f.type==='object') return check(f.fields,item,key);
      assert.equal(typeof item,f.type==='boolean'?'boolean':f.type==='number'?'number':'string',key);
      if(f.required && typeof item==='string') assert(item.length>0,key+' required');
      if(f.pattern) assert(new RegExp(f.pattern).test(item),key+' invalid format');
      if(f.name==='href'||f.name==='homeHref') assert(item===''||/^(\/(?!\/)|#|https:\/\/|mailto:|tel:)/.test(item),key+' unsafe URL');
      if(f.type==='image'){
        const local=resolve('public','.'+item);
        assert(item.startsWith('/images/') && local.startsWith(resolve('public/images')+'/'),key+' image path');
        assert(existsSync(local)&&statSync(local).size>0,key+' missing image'); count++;
      }
    };
    if(f.list){assert(Array.isArray(v),key);v.forEach(validate)}else validate(v);
  }
}
let files=0;
for(const entry of config.content){
 assert.equal(entry.format,'json');
 const paths=entry.type==='collection'?readdirSync(entry.path).filter(p=>p.endsWith('.json')).map(p=>entry.path+'/'+p):[entry.path];
 const slugs=new Set();
 for(const path of paths){const data=JSON.parse(readFileSync(path,'utf8'));check(entry.fields,data,path);files++;
 if(data.slug){assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug),path+' invalid slug');assert(!slugs.has(data.slug),path+' duplicate slug');slugs.add(data.slug)}
 if(data.date)assert(/^\d{4}-\d{2}-\d{2}$/.test(data.date)&&new Date(data.date).toISOString().slice(0,10)===data.date,path+' invalid date');
 }
}
console.log(`Validated ${files} CMS JSON files and ${count} image references.`);
const contact=JSON.parse(readFileSync('src/content/contact.json','utf8'));
assert.equal(new Set(contact.form.fields.map(f=>f.name)).size,contact.form.fields.length,'Duplicate form field');
for(const field of contact.form.fields){assert(['text','email','select','textarea'].includes(field.type),'Unsupported form field type');assert(/^[a-zA-Z][a-zA-Z0-9]*$/.test(field.name),'Invalid form field name')}
const categories=JSON.parse(readFileSync('src/content/blog.json','utf8')).categories.slice(1);
for(const file of readdirSync('src/content/posts'))if(file.endsWith('.json'))assert(categories.includes(JSON.parse(readFileSync('src/content/posts/'+file,'utf8')).category),'Blog category must match a filter');
