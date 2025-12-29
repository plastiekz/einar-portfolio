class a{constructor(){this.baseDir="./jobs"}async saveJob(t){const s=new Date().toISOString().split("T")[0],o=t.source.toLowerCase().replace(/\s+/g,"_"),n=this.sanitizeFilename(t.id),i=(void 0)(this.baseDir,s,o);(void 0)(i)||(void 0)(i,{recursive:!0});const e=(void 0)(i,`${n}.txt`),r=this.formatJobContent(t);return(void 0)(e,r,"utf-8"),console.log(`[JobStorage] Saved job to: ${e}`),e}formatJobContent(t){return`=== JOB POSTING ===
Title: ${t.title}
Company: ${t.seller||"N/A"}
Location: ${t.location}
Source: ${t.source}
URL: ${t.url}
Saved: ${new Date().toISOString()}

=== DESCRIPTION ===
${t.description||"No description available"}

=== METADATA (JSON) ===
${JSON.stringify(t,null,2)}
`}async loadAllJobs(){const t=[];if(!(void 0)(this.baseDir))return t}findJobFiles(t){const s=[];if(!(void 0)(t))return s}parseJobContent(t){const s=t.match(/=== METADATA \(JSON\) ===\s*\n([\s\S]+)$/);if(s)return JSON.parse(s[1]);const o=t.split(`
`),n={};for(const e of o)e.startsWith("Title: ")&&(n.title=e.substring(7)),e.startsWith("Company: ")&&(n.seller=e.substring(9)),e.startsWith("Location: ")&&(n.location=e.substring(10)),e.startsWith("Source: ")&&(n.source=e.substring(8)),e.startsWith("URL: ")&&(n.url=e.substring(5));const i=t.match(/=== DESCRIPTION ===\s*\n([\s\S]+?)\n\n===/);return i&&(n.description=i[1].trim()),n}sanitizeFilename(t){return t.replace(/[^a-z0-9_-]/gi,"_").substring(0,100)}async saveLetter(t,s){const o=new Date().toISOString().split("T")[0],n=(void 0)(this.baseDir,o,"letters");(void 0)(n)||(void 0)(n,{recursive:!0});const i=this.sanitizeFilename(t),e=(void 0)(n,`${i}_letter.txt`);return(void 0)(e,s,"utf-8"),console.log(`[JobStorage] Saved letter to: ${e}`),e}}const l=new a;export{a as JobStorage,l as jobStorage};
