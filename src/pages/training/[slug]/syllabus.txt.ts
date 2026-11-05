import type { APIRoute } from 'astro';
import { courses, type Course } from '../../../lib/content';
export function getStaticPaths(){return courses.map(course=>({params:{slug:course.slug},props:{course}}))}
export const GET:APIRoute=({props})=>{
 const course=props.course as Course;
 return new Response([course.title,'',course.syllabusHeading,'',...course.syllabus.map(topic=>`- ${topic}`),''].join('\n'),{headers:{'Content-Type':'text/plain; charset=utf-8'}});
};
