// Shared browser/server normalization. Alias is display text, not verified identity.
export function validateAlias(value){
 if(typeof value!=='string')throw Error('Escribe un apodo antes de competir.');
 const alias=value.normalize('NFKC').trim();
 if(!/^@?[\p{L}\p{N}_.-]{2,24}$/u.test(alias)||!/[\p{L}\p{N}]/u.test(alias))throw Error('Apodo: 2–24 letras o números, punto o guion.');
 return alias;
}
