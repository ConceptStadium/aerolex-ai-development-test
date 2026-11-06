import database from './node_modules/@directus/api/dist/database/index.js';
import {getSchema} from './node_modules/@directus/api/dist/utils/get-schema.js';
import {UsersService} from './node_modules/@directus/api/dist/services/users.js';
import {useEnv} from '@directus/env';
const db=database();const env=useEnv();
if(!(await db('directus_users').first())){
 const role=await db('directus_roles').where({name:'Administrator'}).first();
 await new UsersService({schema:await getSchema()}).createOne({email:env.ADMIN_EMAIL,password:env.ADMIN_PASSWORD,token:env.ADMIN_TOKEN,role:role.id,status:'active',first_name:'Local',last_name:'Editor'});
 console.log('Local admin account initialized.');
}
await db.destroy();process.exit(0);
