// Runtime isolation: only this project's Unix IPC sockets are allowed, never outbound TCP.
import net from 'node:net';
import path from 'node:path';
import {syncBuiltinESMExports} from 'node:module';
process.env.PM2_HOME=path.resolve('.pm2');
const connect=net.Socket.prototype.connect;
net.Socket.prototype.connect=function(...args){
 const a=Array.isArray(args[0])?args[0][0]:args[0];
 const socketPath=typeof a==='string'?a:a?.path;
 if(socketPath&&path.resolve(socketPath).startsWith(process.cwd()+path.sep))return connect.apply(this,args);
 const error=Object.assign(new Error('Aerolex local CMS: outbound network disabled'),{code:'ECONNREFUSED'});
 queueMicrotask(()=>this.destroy(error));return this;
};
globalThis.fetch=async()=>{throw new Error('Aerolex local CMS: outbound fetch disabled');};
syncBuiltinESMExports();
