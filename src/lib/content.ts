import { z } from 'zod';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import navData from '../content/navigation.json';
import trainingData from '../content/training.json';
import footerData from '../content/footer.json';
export { default as home } from '../content/home.json';
export { default as about } from '../content/about.json';
export { default as consultancy } from '../content/consultancy.json';
export { default as safety } from '../content/safety.json';
export { default as blog } from '../content/blog.json';
export { default as contact } from '../content/contact.json';
export { default as ui } from '../content/ui.json';
const text=z.string().min(1);
const href=z.string().refine(v=>v===''||/^(\/(?!\/)|#|https:\/\/|mailto:|tel:)/.test(v),'Invalid destination URL');
const asset=text.refine(v=>{const path=resolve('public','.'+v);return v.startsWith('/images/')&&path.startsWith(resolve('public/images')+'/')&&existsSync(path)&&statSync(path).size>0},'Missing local image');
const image=z.object({src:asset,alt:z.string()}).strict();
const link=z.object({label:z.string(),href}).strict();
export const navigation=z.object({logo:image,homeHref:href,menuLabel:text,skipLabel:text,label:text,chevron:asset,items:z.array(link.extend({showChevron:z.boolean(),children:z.array(link)}))}).strict().parse(navData);
export const training=z.object({pageTitle:text,heading:text,description:text,metaDescription:text,heroImage:image,coursesLabel:text,readMoreLabel:text,arrow:asset}).strict().parse(trainingData);
export const footer=z.object({logo:image,description:text,groups:z.array(z.object({heading:text,links:z.array(link)})),contactHeading:text,contacts:z.array(link.extend({icon:asset})),socials:z.array(link.extend({icon:asset})),copyright:text,credit:text}).strict().parse(footerData);
const slug=text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const date=text.refine(v=>/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v,'Invalid calendar date');
const entry={slug,title:text,date,order:z.number(),draft:z.boolean(),description:text,image};
const courseSchema=z.object({...entry,heroDescription:text,intro:text,syllabusHeading:text,syllabus:z.array(text),sections:z.array(z.object({heading:text,body:text})),downloadLabel:text,contactLabel:text}).strict();
const postSchema=z.object({...entry,heading:text,category:text,body:text}).strict();
export type Course=z.infer<typeof courseSchema>;
export type Post=z.infer<typeof postSchema>;
function entries<T extends {slug:string;draft:boolean;order:number}>(modules:Record<string,unknown>,schema:z.ZodType<T>):T[]{
 const values=Object.values(modules).map(v=>schema.parse(v));
 if(new Set(values.map(v=>v.slug)).size!==values.length)throw new Error('Duplicate content slug');
 return values.filter(v=>!v.draft).sort((a,b)=>a.order-b.order||a.slug.localeCompare(b.slug));
}
export const courses=entries(import.meta.glob('../content/courses/*.json',{eager:true,import:'default'}),courseSchema);
export const posts=entries(import.meta.glob('../content/posts/*.json',{eager:true,import:'default'}),postSchema);
const legalSchema=z.object({slug,title:text,body:text,contactLabel:text}).strict();
export const legalPages=Object.values(import.meta.glob('../content/legal/*.json',{eager:true,import:'default'})).map(v=>legalSchema.parse(v));
export interface ImageContent {src:string;alt:string}
export interface ButtonContent {label:string;href:string}
export interface HeroContent {heading:string;accent:string;description:string;image:ImageContent;button:ButtonContent}
export interface FeatureContent {heading:string;body:string;image:ImageContent;button:ButtonContent;eyebrow?:string;stats?:{value:string;label:string}[]}
